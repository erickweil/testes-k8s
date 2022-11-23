import BitCanvas from "../components/BitCanvas/BitCanvas";
import {Buffer} from 'buffer';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useWebSocket from 'react-use-websocket';

const JogoDaVida = (props) => {
    let estado = false;
    let setGrade = false;
    let arr = false;
    const ws = useRef(null);

    const onUpdateGrade = (data) => {
        const width = data.width;
        const height = data.height;
        const offx = data.offx;
        const offy = data.offy;
        const resx = data.resx;
        const resy = data.resy;
        const gradebase64 = data.grade;
        const gradebin = Buffer.from(gradebase64, "base64");

        if(!arr || arr.length != width * height)
        {
            console.log("Criado array de tamanho "+(width*height))
            arr = new Array(width * height);
        }

        let x = offx;
        let y = offy;
        
        for(let i =0;i<(resx * resy) / 8;i++)
        {
            const b = gradebin[i];
            for(let k=0;k<8;k++)
            {
                const bit = b & (1 << k);
                arr[y * width + x] = bit == 0 ? 0 : 1;
                x++;
                if(x >= offx+resx)
                {
                    x = offx;
                    y++;
                }
            }
        }

        if(setGrade !== false)
        setGrade(estado,{"grade":arr,"gradew":width,"gradeh":height})
    };

    const fetchGrade = (control) => {
        /*let getParams = "";
        if(estado && estado.gradeDrawEnd && estado.gradeDrawStart)
        {
            getParams = "?"+
            "x0="+encodeURIComponent(estado.gradeDrawStart.x)+
            "&x1="+encodeURIComponent(estado.gradeDrawEnd.x)+
            "&y0="+encodeURIComponent(estado.gradeDrawStart.y)+
            "&y1="+encodeURIComponent(estado.gradeDrawEnd.y)
        }

        fetch("http://localhost:9090/grade"+getParams)
        .then((response) => response.json())
        .then((data) => {
           //console.log(data); // DEBUG
           onUpdateGrade(data);
           control["finished"] = true;
        })
        .catch((err) => {
           console.log(err.message);
        });*/
        if(!ws.current) return;

        ws.current.send(
            JSON.stringify({
                req:"getGrade",
                x0:""+estado.gradeDrawStart.x,
                x1:""+estado.gradeDrawEnd.x,
                y0:""+estado.gradeDrawStart.y,
                y1:""+estado.gradeDrawEnd.y
            })
        )
    };

    const onSetCell = (coord,value) => {
        /*fetch("http://localhost:9090/grade/"+coord.x+"/"+coord.y+"/"+value,{
            method: "POST"
        })
        .then((response) => response.json())
        .then((data) => {
           console.log(data);
        })
        .catch((err) => {
           console.log(err.message);
        });*/
        if(!ws.current) return;
        
        ws.current.send(
            JSON.stringify({req:"setGrade",x:""+coord.x,y:""+coord.y,v:""+value})
        )
    }

    useEffect(() => {
        const control = {"finished":false};

        ws.current = new WebSocket("wss://"+props.apiurl);
        ws.current.onopen = () => {
            control["finished"] = true;
            console.log("ws opened");
        }
        ws.current.onclose = () => console.log("ws closed");
        const wsCurrent = ws.current;

        
        const interval = setInterval(() => {
            if(control["finished"] === true)
            {
                control["finished"] = false;
                fetchGrade(control);
            }
        }, 110);

        ws.current.onmessage = e => {
            //if (isPaused) return;
            const message = JSON.parse(e.data);
            //console.log("e", message);
            //console.log("ws response:", message);

            if(message.grade)
            {
                control["finished"] = true;
                onUpdateGrade(message);
            }
            else
            {
                console.log("ws response:", message);
            }
        };

        return () => {
            clearInterval(interval);
            wsCurrent.close()
        };
     }, []);

    const getUpdateCallback = (_estado,_setGrade) => {
        estado = _estado;
        setGrade = _setGrade;
    }

    return (
        <BitCanvas getUpdateCallback={getUpdateCallback} onSetCell={onSetCell} ></BitCanvas>
    );
};

export default JogoDaVida;
