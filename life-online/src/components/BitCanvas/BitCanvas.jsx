import { mesclarEstado } from "../Canvas/CanvasControler";
import ZoomableCanvas, { pageToZoomCanvas, zoomCanvasToPage} from "../Canvas/ZoomableCanvas";

const BitCanvas = (props) => {
    const defaultOptions = {
        DEBUG: false,
        spanButton:"right",
        maxZoomScale: 32.0,
        minZoomScale: 0.125,
        spanEnabled: true,
        zoomEnabled: true
    }
    const options = props.options ? {...defaultOptions,...props.options} : defaultOptions;
    
    // Not affected by zooming and spanning
    const myuidraw = (ctx,estado) => {

    };

    const mydraw = (ctx,estado) => {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        /*if(estado.imagem)
        {
        ctx.drawImage(estado.imagem,
            estado.imagemPos.x,estado.imagemPos.y,
            estado.imagemSize.x,estado.imagemSize.y);
        }*/
        //ctx.fillStyle = "rgba(255, 0, 0, 1.0)";
        const upperLeft = pageToZoomCanvas({
            x:0,
            y:0
        },0,0,estado.span,estado.scale);

        const bottomRight = pageToZoomCanvas({
            x:w,
            y:h
        },0,0,estado.span,estado.scale);

        //ctx.fillRect(upperLeft.x-50, upperLeft.y-50, 100, 100);
        //ctx.fillRect(bottomRight.x-50, bottomRight.y-50, 100, 100);

        // Square size
        const larg = estado.larg;

        const gradeDrawStart = {
            x: Math.min(estado.gradew,Math.max(0,Math.floor(upperLeft.x / larg))),
            y: Math.min(estado.gradeh,Math.max(0,Math.floor(upperLeft.y / larg)))
        };

        const gradeDrawEnd = {
            x: Math.min(estado.gradew,Math.max(0,Math.ceil(bottomRight.x / larg))),
            y: Math.min(estado.gradeh,Math.max(0,Math.ceil(bottomRight.y / larg)))
        };

        // Mudando o estado assim para n fazer redraw
        estado.gradeDrawStart = gradeDrawStart;
        estado.gradeDrawEnd = gradeDrawEnd;

        ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
        ctx.fillRect(gradeDrawStart.x*larg, gradeDrawStart.y*larg, (gradeDrawEnd.x-gradeDrawStart.x)*larg, (gradeDrawEnd.y-gradeDrawStart.y)*larg);

        if(estado.grade)
        {
            ctx.fillStyle = "rgba(0, 255, 0, 1.0)";
            for(let y=gradeDrawStart.y;y<gradeDrawEnd.y;y++)
            {
                for(let x=gradeDrawStart.x;x<gradeDrawEnd.x;x++)
                {
                    if(estado.grade[y*estado.gradew + x] == 1)
                    ctx.fillRect(x*larg, y*larg, larg, larg);
                }
            }
        }
    }

    const onMouseMove = (e,estado) =>
    {
        const mouse = estado.mouse;

        if(mouse.left)
        {
            const mpix = {
                x: Math.min(estado.gradew,Math.max(0,Math.floor(mouse.x / estado.larg))),
                y: Math.min(estado.gradeh,Math.max(0,Math.floor(mouse.y / estado.larg)))
            };

            if(estado.grade[mpix.y*estado.gradew + mpix.x] != 1)
            {
                estado.grade[mpix.y*estado.gradew + mpix.x] = 1;
                props.onSetCell(mpix,1);
            }
        }
    };

    const everyFrame = (estado) =>
    {
    }

    // Update Grid from Outside
    const onEstadoSet = (estado,novoEstado) => {
        mesclarEstado(estado,novoEstado);
    }

    const getInitialState = (estado) => {
        // Só alterar o estado com mesclarEstado
        // Então o Canvas gerencia as mudanças assim decidindo re-desenhar
        mesclarEstado(estado,{
            gradew: 100,
            gradeh: 100,
            grade: false,
            larg: 10
        });

        props.getUpdateCallback(estado,onEstadoSet);
        //carregarImagem(estado,props.imagem);
    };

    // Update callback
    const onPropsChange = (estado) => {
        props.getUpdateCallback(estado,onEstadoSet);
    }

    return (
        <ZoomableCanvas
        getInitialState={getInitialState}
        onPropsChange={onPropsChange}
        uidraw={myuidraw}
        draw={mydraw}
        everyFrame={everyFrame}
        events={{
            onMouseMove:onMouseMove
        }}
        options={options}
        />
    );
}
  
export default BitCanvas;