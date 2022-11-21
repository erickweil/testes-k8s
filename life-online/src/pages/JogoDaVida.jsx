import BitCanvas from "../components/BitCanvas/BitCanvas";
import {Buffer} from 'buffer';
import React, { useCallback, useEffect, useMemo, useState } from "react";

const JogoDaVida = () => {

    const [grade, setGrade] = useState({"grade":false,"gradew":0,"gradeh":0});

    let arr = false;

    const onUpdateGrade = (data) => {
        const width = data.width;
        const height = data.height;
        const gradebase64 = data.grade;
        const gradebin = Buffer.from(gradebase64, "base64");

        if(!arr || arr.length != width * height)
        {
            arr = new Array(width * height);
        }

        let x = 0;
        let y = 0;
        
        for(let i =0;i<(width * height) / 8;i++)
        {
            const b = gradebin[i];
            for(let k=0;k<8;k++)
            {
                const bit = b & (1 << k);
                arr[y * width + x] = bit == 0 ? 0 : 1;
                x++;
                if(x >= width)
                {
                    x = 0;
                    y++;
                }
            }
        }

        setGrade({"grade":arr,"gradew":width,"gradeh":height})
    };

    const fetchGrade = (control) => {
        fetch('http://localhost:9090/grade')
        .then((response) => response.json())
        .then((data) => {
           //console.log(data); // DEBUG
           onUpdateGrade(data);
           control["finished"] = true;
        })
        .catch((err) => {
           console.log(err.message);
        });
    };

    useEffect(() => {
        const control = {"finished":true};
        const interval = setInterval(() => {
            if(control["finished"] === true)
            {
                control["finished"] = false;
                fetchGrade(control);
            }
        }, 100);
        return () => clearInterval(interval);
     }, []);

    return (
        <BitCanvas grade={grade["grade"]} gradew={grade["gradew"]} gradeh={grade["gradeh"]} ></BitCanvas>
    );
};

export default JogoDaVida;