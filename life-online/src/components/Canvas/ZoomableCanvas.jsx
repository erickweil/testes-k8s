import MeuCanvas from "./MeuCanvas";
import { mesclarEstado, pageToCanvas, canvasToPage } from "./CanvasControler";
import { normalizeWheel } from "./TouchManager";

/** Transformar de posição local no canvas para página */
export function zoomCanvasToPage(p,offsetLeft,offsetTop,span,scale)
{
    const tp = {x:(p.x - span.x) * scale,y:(p.y - span.y) * scale};

    return canvasToPage(tp,offsetLeft,offsetTop);
}

/** Transformar de posição da página para local no canvas */
export function pageToZoomCanvas(p,offsetLeft,offsetTop,span,scale)
{
    const tp = pageToCanvas(p,offsetLeft,offsetTop);

    return {x:tp.x / scale + span.x,y:tp.y / scale + span.y};
}

/**
 * Zoomable Canvas
 * Permite mover para os lados e dar zoom no canvas
 * @param draw Função de desenho normal
 * @param uidraw Função que irá desenhar depois de tudo, sem escala nem zoom
 * @param events Objeto que deve conter quais eventos deseja controlar (ex: onMouseDown). O evento receberá como parâmetro (e,estado) onde
 * estado é um objeto contendo informações que podem ser alteradas com a função mesclarEstado do CanvasControler
 * @param getInitialState Função que inicializa o estado
 * @param options Opções gerais
 * @param   options.DEBUG exibe informações sobre o canvas
 * @param   options.spanButton "any" controla qual botão realiza o span: "any", "left", "middle" ou "right"
 * @param   options.maxZoomScale 20.0 O máximo que pode dar zoom
 * @param   options.minZoomScale 0.25 O mínimo que pode dar zoom
 * @param   options.spanEnabled true Se é possível realizar span
 * @param   options.zoomEnabled true Se é possível realizar zoom
 * @param   options.useTouchManager true // TouchManager simplifica o uso do toque re-interpretando como Mouse
 * @param   options.preventContextMenu true // Cancelar eventos de abrir o menu do botão direito ou long-tap
 * @param   options.context "2d" // contexto de desenho do canvas
 * 
 */
const ZoomableCanvas = (props) => {

    console.log("Criou o ZoomableCanvas");
    const { uidraw, draw, everyFrame, events, getInitialState, onPropsChange, options:_options, ...rest } = props

    const defaultOptions = {
        DEBUG: false,
        spanButton:"any",
        maxZoomScale: 20.0,
        minZoomScale: 0.25,
        spanEnabled: true,
        zoomEnabled: true
    };
    const options = _options ? {...defaultOptions,..._options} : defaultOptions;

    const spanButton = options.spanButton;
    const DEBUG = options.DEBUG;
    const maxZoomScale = options.maxZoomScale;
    const minZoomScale = options.minZoomScale;
    // Obtêm o mouse em coordenadas locais
    const getMouse = (e,estado) => 
    {
        const umouse = pageToZoomCanvas({
            x:e.pageX,
            y:e.pageY
        },estado.offsetLeft,estado.offsetTop,estado.span,estado.scale);


        return {
            pageX:e.pageX,
            pageY:e.pageY,
            x:umouse.x,
            y:umouse.y,
            left: e.buttons & 1,
            middle: e.buttons & 4,
            right: e.buttons & 2
        };
    };

    // Desenhar ou não algumas informações sobre a tela e o mouse
    let DEBUG_N = 0;
    let DEBUG_TXTN = 0;
    let DEBUG_TXT = "";
    let DEBUG_TXT2 = "";
    let DEBUG_TXT2N = 0;
    let DEBUG_TXT3 = "";
    let DEBUG_TXT3N = 0;
    let DEBUG_TXT4 = "";
    let DEBUG_TXT4N = 0;
    // Função que desenha tudo
    const mydraw = (ctx,estado) => {
        const w = estado.width;
        const h = estado.height;

        ctx.clearRect(0, 0, w,h);

        

        ctx.save();

        ctx.scale(estado.scale,estado.scale);
        ctx.translate(-estado.span.x,-estado.span.y);
        
        if(DEBUG)
        {
            const b = 32
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(0, 0, w, b);
            ctx.fillRect(0, h-b, w, b);
            
            ctx.fillRect(0, 0, b, h);
            ctx.fillRect(w-b, 0, b, h);

            if(estado.mouse)
            {
                ctx.fillStyle = "#" + 
                (estado.mouse.left ? "ff" : "00") +
                (estado.mouse.middle ? "ff" : "00") +
                (estado.mouse.right ? "ff" : "00");

                ctx.fillRect(estado.mouse.x-b/2,estado.mouse.y-b/2,b,b);
            }
        }
        draw(ctx,estado);

        ctx.restore();

        if(DEBUG)
        {    
            const b = 32
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(0, 0, w, b);
            ctx.fillRect(0, h-b, w, b);
            //ctx.fillStyle = '#00ff00';
            ctx.fillRect(0, 0, b, h);
            ctx.fillRect(w-b, 0, b, h);   

            ctx.fillStyle = '#ffffff';
            ctx.font = "30px Arial";
            ctx.fillText("Drawed:"+DEBUG_N, 10, 25);
            DEBUG_N++;

            ctx.fillText("Changes:"+estado._changes, 200, 25);
            ctx.fillText(DEBUG_TXT, 10, 80);
            ctx.fillText(DEBUG_TXT2, 10, 80+50);
            ctx.fillText(DEBUG_TXT3, 10, 80+100);
            ctx.fillText(DEBUG_TXT4, 10, 80+150);
        }
        uidraw(ctx,estado);
    };

    const isSpanningClick = (e,estado) => {
        const spanningClick = estado.spanEnabled &&
            ((spanButton == "any") ||
            (spanButton == "left" && e.button == 0) ||
            (spanButton == "middle" && e.button == 1) ||
            (spanButton == "right" && e.button == 2));
        return spanningClick;
    }

    // ############################
    //          Eventos
    // ############################
    // onMouseDown - Clicou o mouse
    // onMouseMove - Moveu o mouse
    // onMouseUp - Soltou o mouse
    // onWheel e doZoom - Controlar o zoom
    const onMouseDown = (e,estado) => {
        if(DEBUG)
        {
            DEBUG_TXTN++
            DEBUG_TXT = DEBUG_TXTN+" Down "+e.button+" "+e.pageX+","+e.pageY;
        }
        const mouse = getMouse(e,estado);
        

        const spanning = isSpanningClick(e,estado);

        mesclarEstado(estado,{
            mouse:mouse,
            spanning: spanning,
            spanned:false,
            spanningStart:mouse
        });

        if(!spanning && events.onMouseDown) 
        mesclarEstado(estado,events.onMouseDown(e,estado));
    };

    const onMouseMove = (e,estado) => {
        if(DEBUG) DEBUG_TXT += ".";

        const mouse = getMouse(e,estado);

        if(estado.spanEnabled)
        {
            const span = estado.span;
            let spanned = estado.spanned;

            if(estado.spanning)
            {
                span.x -= mouse.x - estado.spanningStart.x;
                span.y -= mouse.y - estado.spanningStart.y;
                spanned = true;
            }

            mesclarEstado(estado,{
                mouse:getMouse(e,estado),
                span:span,
                spanned:spanned
            });
        }
        else
        {
            mesclarEstado(estado,{
                mouse:getMouse(e,estado),
                spanning: false,
                spanned: false
            });
        }

        if(!estado.spanning && events.onMouseMove) 
        mesclarEstado(estado,events.onMouseMove(e,estado));
    };

    const onMouseUp = (e,estado) => {
        if(DEBUG)
        {
            DEBUG_TXT2N++
            DEBUG_TXT2 = DEBUG_TXT2N+" Up "+e.button+" "+e.pageX+","+e.pageY;
        }
        const mouse = getMouse(e,estado);

        const wasSpanning = estado.spanning;
        const wasSpanned = estado.spanned;

        mesclarEstado(estado,{
            mouse:mouse,
            spanning:false

            // Apesar do updateEstado mesclar, filhos são substituídos, então é necessário mesclar aqui:
            //,retangulos:[mouse,...(estado.retangulos ? estado.retangulos : [])]
        });

        if(!wasSpanning && events.onMouseUp) 
        mesclarEstado(estado,events.onMouseUp(e,estado));

        if(!wasSpanning || (wasSpanning && !wasSpanned))
        {
            // applyclick only if the span button is the same as this click event button
            const spanningClick = isSpanningClick(e,estado);

            if(spanningClick && events.onClick)
            {
                mesclarEstado(estado,events.onMouseDown(e,estado)); // Simulate all events, because they where not propagated
                mesclarEstado(estado,events.onMouseUp(e,estado));
                mesclarEstado(estado,events.onClick(e,estado));
            }
        }
    };

    const doZoom = (e,estado) => {  
        if(!estado.zoomEnabled) return;

        let scale = estado.scale;
        let span = estado.span;
        let mouse = estado.mouse;
        let offLeft = estado.offsetLeft;
        let offTop = estado.offsetTop;
        //let screenPos = {pageX:window.innerWidth/2.0,pageY:window.innerHeight/2.0};
        //let screenPos = mouse;

        let before = pageToZoomCanvas({
            x:e.pageX,
            y:e.pageY
        },offLeft,offTop,span,scale);

		scale *= e.delta;
		scale = Math.max(Math.min(scale,maxZoomScale),minZoomScale);
		
        let after = pageToZoomCanvas({
            x:e.pageX,
            y:e.pageY
        },offLeft,offTop,span,scale);

		span.x -= after.x - before.x;
		span.y -= after.y - before.y;

        const newMousePos = pageToZoomCanvas({x:mouse.pageX,y:mouse.pageY},offLeft,offTop,span,scale); // Atualiza o mouse com a nova transformação
        mouse.x = newMousePos.x;
        mouse.y = newMousePos.y;

        return {
            scale:scale,
            span:span,
            mouse:mouse
        };
    };

    const onWheel = (e,estado) => {

        const wheelDelta = normalizeWheel(e);
        const amount = 1.0 - Math.max(Math.min(wheelDelta.pixelY/200.0,0.2),-0.2);
        const mouse = estado.mouse;

        return doZoom({
            pageX:mouse.pageX,
            pageY:mouse.pageY,
            delta:amount
            },estado);
    };
    
    const onClick = (e,estado) => {
        if(DEBUG)
        {
            DEBUG_TXT3N++;
            DEBUG_TXT3 = DEBUG_TXT3N+" Click "+e.button+" "+e.pageX+","+e.pageY;
        }
        const spanningClick = isSpanningClick(e,estado);

        if(!spanningClick && events.onClick)
        {
            return events.onClick(e,estado);
        }
    };

    const onMouseLeave = (e,estado) => {
        const mouse = getMouse(e,estado);
        mesclarEstado(estado,{mouse:mouse});

        if(events.onMouseLeave) return events.onMouseLeave(e,estado);
    }

    const onMouseEnter = (e,estado) => {
        const mouse = getMouse(e,estado);
        mesclarEstado(estado,{mouse:mouse});

        if(events.onMouseEnter) return events.onMouseEnter(e,estado);
    }

    // Não é o jeito certo? idaí?
    const myGetInitialState = (estado) => {

        mesclarEstado(estado,{
            mouse:{pageX:0,pageY:0,x:0,y:0,left:false,middle:false,right:false},
            span:{x:0,y:0},
            spanning:false,
            scale:1.0,
            spanningStart:{x:0,y:0},
            spanned:false,
            spanEnabled:options.spanEnabled,
            zoomEnabled:options.zoomEnabled
        });

        //carrega o estado inicial de quem chamou
        getInitialState(estado);
    };

    let myListeners = {
        onMouseDown:onMouseDown,
        onMouseMove:onMouseMove,
        onMouseUp:onMouseUp,
        onWheel:onWheel,
        doZoom:doZoom,
        onClick:onClick,
        onMouseLeave: onMouseLeave,
        onMouseEnter: onMouseEnter
    };

    for (const k in events) {
        if(!(k in myListeners))
        myListeners[k] = events[k];
    }
    return <MeuCanvas 
    draw={mydraw}
    everyFrame={everyFrame}
    getInitialState={myGetInitialState}
    onPropsChange={onPropsChange}
    events={myListeners}
    options={options} />;
    
};
  
export default ZoomableCanvas;