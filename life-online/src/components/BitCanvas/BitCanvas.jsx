import { mesclarEstado } from "../Canvas/CanvasControler";
import ZoomableCanvas from "../Canvas/ZoomableCanvas";

const BitCanvas = (props) => {
    const defaultOptions = {
        DEBUG: false,
        spanButton:"right",
        maxZoomScale: 20.0,
        minZoomScale: 0.25,
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
        const larg = 10;
        ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
        ctx.fillRect(0, 0, larg*estado.gradew, larg*estado.gradeh);

        if(estado.grade)
        {
            ctx.fillStyle = "rgba(0, 255, 0, 1.0)";
            for(let y=0;y<estado.gradeh;y++)
            {
                for(let x=0;x<estado.gradew;x++)
                {
                    if(estado.grade[y*estado.gradew + x] == 1)
                    ctx.fillRect(x*larg, y*larg, larg, larg);
                }   
            }
        }
    }

    const onClick = (e,estado) =>
    {
        
    };

    const everyFrame = (estado) =>
    {
    }

    const getInitialState = (estado) => {
        // Só alterar o estado com mesclarEstado
        // Então o Canvas gerencia as mudanças assim decidindo re-desenhar
        mesclarEstado(estado,{
            gradew: props.gradew,
            gradeh: props.gradeh,
            grade: props.grade
        });

        //carregarImagem(estado,props.imagem);
    };

    // Update Grid
    const onPropsChange = (estado) => {
        mesclarEstado(estado,{
            gradew: props.gradew,
            gradeh: props.gradeh,
            grade: props.grade
        });
    }

    return (
        <ZoomableCanvas
        getInitialState={getInitialState}
        onPropsChange={onPropsChange}
        uidraw={myuidraw}
        draw={mydraw}
        everyFrame={everyFrame}
        events={{
            onClick:onClick
        }}
        options={options}
        />
    );
}
  
export default BitCanvas;