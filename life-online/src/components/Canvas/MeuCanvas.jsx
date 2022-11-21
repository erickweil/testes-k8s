import React, {memo} from 'react'
import CanvasControler from './CanvasControler'
import TouchManager from "./TouchManager";
import "./MeuCanvas.css"

/**
 * Meu Canvas,
 * Permite que desenhe em um canvas, gerenciando estado e eventos de mouse e toque
 * @param draw Função de desenho normal
 * @param events Objeto que deve conter quais eventos deseja controlar (ex: onMouseDown). O evento receberá como parâmetro (e,estado) onde
 * estado é um objeto contendo informações que podem ser alteradas com a função mesclarEstado do CanvasControler
 * @param getInitialState Função que inicializa o estado
 * @param options Opções gerais
 * @param options.useTouchManager true TouchManager simplifica o uso do toque re-interpretando como Mouse
 * @param options.preventContextMenu true Cancelar eventos de abrir o menu do botão direito ou long-tap
 * @param options.context "2d" contexto de desenho do canvas
 */
const MeuCanvas = props => {  

    console.log("Criou o MeuCanvas");

    const { draw, everyFrame, events, getInitialState, onPropsChange, options: _options, ...rest } = props

    const defaultOptions = {
        useTouchManager:true,
        preventContextMenu:true,
        contextMenuAsRightClick:true // Finge que o evento ContextMenu seja um botão direito do mouse
    };
    const options = _options ? {...defaultOptions,..._options} : defaultOptions;


    const [doEvent,canvasRef] = CanvasControler(draw, everyFrame,getInitialState, onPropsChange, options)
    
    let myListeners = {
        onContextMenu:(e) => {
            if(options.preventContextMenu)
                e.preventDefault(); // evitar abrir a janela contextMenu ao clicar o botão direito

            if(options.contextMenuAsRightClick && events.onClick)
            {
                e.button = 2;
                e.buttons = e.buttons | 2;
                return doEvent(events.onClick,e);
            }
            if(events.onContextMenu) 
                return doEvent(events.onContextMenu,e);
        }
    };

    const touchManager = new TouchManager();

    if(options.useTouchManager)
    myListeners = {...myListeners,...{
        onTouchStart:(e) => { touchManager.touchstart(e); },
        onTouchMove:(e) => { touchManager.touchmove(e); },
        onTouchEnd:(e) => { 
            // Impedir um evento de long tap?
            if(options.preventContextMenu)
                e.preventDefault();

            touchManager.touchend(e); },
        onTouchCancel:(e) => { touchManager.touchcancel(e); }
    }};

    for (const k in events) {
        if(!(k in myListeners))
        myListeners[k] = (e) => { doEvent(events[k],e); }
    }
  
    if(options.useTouchManager)
    {
        // TouchManager gerencia para que funcione em ambientes de toque perfeitamente
        // Basicamente o TouchManager faz ficar igual a quando é clique do mouse 
        // 1 toque -> Botão esquerdo
        // 2 toques -> Botão direito
        // 3 toques -> Botão do meio
        // (Especialmente necessário para funcionar o pinch zoom + span)    
        touchManager.addEventListener("onTouchDown",(...args) => {myListeners.onMouseDown && myListeners.onMouseDown(...args)}, false);
        touchManager.addEventListener("onTouchMove",(...args) => {myListeners.onMouseMove && myListeners.onMouseMove(...args)}, false);
        touchManager.addEventListener("onTouchUp",(...args) => {

            myListeners.onMouseUp && myListeners.onMouseUp(...args);
            myListeners.onClick && myListeners.onClick(...args);

        }, false);
        touchManager.addEventListener("onTouchZoom",(...args) => {
            myListeners.doZoom && myListeners.doZoom(...args);
        }, false);
    }
    
    // Removing custom doZoom listener from canvasListeners to prevent React Error
    const { doZoom, ...canvasListeners} = myListeners;
    return <canvas
        tabIndex="0"
        id="canvasInAPerfectWorld" 
        ref={el => canvasRef.current.canvas = el}
        {/*
        onMouseMove={(e) => { events.onMouseMove && doEvent(events.onMouseMove,e); }} 
        onMouseDown={(e) => { events.onMouseDown && doEvent(events.onMouseDown,e); }} 
        onMouseUp={(e) => { events.onMouseUp && doEvent(events.onMouseUp,e); }} 
        onContextMenu={(e) => { events.onContextMenu && doEvent(events.onContextMenu,e); }} 
        onWheel={(e) => { events.onWheel && doEvent(events.onWheel,e); }} 
        onTouchStart={(e) => { events.onTouchStart && doEvent(events.onTouchStart,e); }} 
        onTouchMove={(e) => { events.onTouchMove && doEvent(events.onTouchMove,e); }} 
        onTouchEnd={(e) => { events.onTouchEnd && doEvent(events.onTouchEnd,e); }} 
        onTouchCancel={(e) => { events.onTouchCancel && doEvent(events.onTouchCancel,e); }} 
        */
       ...canvasListeners}
        
        {...rest}    
    />;
}

//export default memo(MeuCanvas)
export default MeuCanvas