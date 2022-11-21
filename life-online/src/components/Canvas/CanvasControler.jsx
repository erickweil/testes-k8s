import { useRef, useState, useEffect } from 'react'
//import TouchManager from './TouchManager';

/**
 * Função que controla o estado do canvas,
 * sempre que modificar o estado, faça-o com essa função pois assim o canvas saberá quando atualizar
 * @param estado O estado anterior
 * @param novoEstado Objeto com apenas as propriedades que mudaram 
 * (Pode também ser o mesmo objeto do estado anterior)
 */
export function mesclarEstado(estado,novoEstado) {
  // https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
  //setEstado({...estado,...novoEstado});

  if(!novoEstado) return;

  let changed = false;
  for (const k in novoEstado) {
      estado[k] = novoEstado[k];
      changed = true;
  }

  if(changed)estado._changes++;
}

/**
@see https://www.pluralsight.com/guides/re-render-react-component-on-window-resize
Currently, our example code is set up to call handleResize as often
as the window resizes. We're setting state and re-rendering for every 
single pixel change as often as the event loop will let us.

But what if there's a good reason to handling the resizing less often
than that? We might want to be less aggressive in our re-rendering for 
performance reasons, such as in the case of a slow or expensive-to-render component.

In such a case, we can debounce the resize handling and thus the re-rendering.
This will mean to throttle or wait between calls to our handleResize function. 
There are solid debounce implementations. Let's add a short and simple one to our example:
*/
function debounce(fn, ms) {
  let timer
  return _ => {
    clearTimeout(timer)
    timer = setTimeout(_ => {
      timer = null
      fn.apply(this, arguments)
    }, ms)
  };
}

/** Transformar de posição local no canvas para página */ 
export function canvasToPage(p,offsetLeft,offsetTop)
{
  return {x:p.x + offsetLeft,y:p.y + offsetTop};
}

/** Transformar de posição da página para local no canvas */
export function pageToCanvas(p,offsetLeft,offsetTop)
{
  return {x:p.x-offsetLeft,y:p.y-offsetTop};
}

/**
@see https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258

Canvas Controler, handles resizing and animationframe callbacks
also handles state using useRef only... to prevent re-renders
*/
const CanvasControler = (draw,everyFrame,getInitialState, onPropsChange, options={}) => {
  
  
  //const [estado,setEstado] = useState(null);
  //if(!estado) setEstado(getInitialState());

  // Usando só useRef pra não causar um re-render toda vez
  // https://www.smashingmagazine.com/2020/11/react-useref-hook/
  const canvasRef = useRef({canvas:null,estado:null});
  if(!canvasRef.current.estado)
  {
    console.log("SETANDO ESTADO INICIAL...");
    const novoEstado = {
      offsetLeft:0,
      offsetTop:0,
      width:window.innerWidth,
      height:window.innerHeight,
      _changes:1
    };
    
    getInitialState(novoEstado);

    canvasRef.current.estado = novoEstado;
  }
  else
  {
    if(onPropsChange)
    {
      console.log("onPropsChange");
      onPropsChange(canvasRef.current.estado);
    }
  }

  // GetEstado
  // Essa função garante que:
  // - O estado obtido sempre é o mais recente
  //   - Um conflito de mesclagem é evitado por alterar o próprio objeto com novos valores e então realizar o setEstado
  // - Cada mudança de estado mudará apenas o necessário
  const getEstado = () => {
    if(!canvasRef) return {};

    return canvasRef.current.estado;
  };

  // Executa o evento e mescla o estado
  const doEvent = (callback,e) => 
  {
    const _estado = getEstado();

    // Pode retornar apenas o que mudou como um novo objeto
    // O mesmo objeto já modificado (Se modificar o mesmo objeto não precisa retornar ele)
    // Um objeto vazio, falso, null ou não retornar.
    const novoEstado = callback(e,_estado);

    // Em qualquer situação, mesclarEstado faz com que o novoEstado seja aplicado
    // Apenas alterando propriedades no mesmo objeto, sem necessidade de alterar o ref
    mesclarEstado(_estado,novoEstado);
    
    //setEstado({..._estado}); -- NÃO USAR ESTADO MAIS
  };

  useEffect(() => {
  
    console.log("useEffect do CanvasControler")
    const canvas = canvasRef.current.canvas;
    const context = canvas.getContext((options && options.context) || '2d');

    // Timer
    let animationFrameId;

    // Listener de Resize
    const doResize = (e) => {
      const { top, left } = canvas.getBoundingClientRect();
      const width = window.innerWidth;
      const height = window.innerHeight - top;

      if (canvas.width !== width || canvas.height !== height) {
        const estado = getEstado();        

        canvas.width = width;
        canvas.height = height;

        mesclarEstado(estado,{
          width:width,
          height:height,
          offsetLeft:left /*canvas.offsetLeft*/,
          offsetTop:top /*canvas.offsetTop*/
        });
      }
    };

    const debounceHandleResize = debounce(doResize,100);
    window.addEventListener("resize", debounceHandleResize);

    // Timer que se auto-registra recursivamente
    const render = () => {
      const estado = getEstado();

      // só garante que vai atualizar a cada mudança se o estado for modificado com mesclarEstado
      if(estado._changes > 0)
      {
        mesclarEstado(estado,{
          width:canvas.width,
          height:canvas.height
          //offsetLeft:canvas.offsetLeft,
          //offsetTop:canvas.offsetTop
        });

        draw(context,estado);
        estado._changes = 0;
      }

      if(everyFrame)
      mesclarEstado(estado,everyFrame(estado));
      // auto-registra novamente
      // TODO: só pedir um AnimationFrame se houve uma mudança mesmo para ser feita.
      animationFrameId = window.requestAnimationFrame(render);
    }

    // Inicia o Timer
    doResize();
    render();

    // Retorna a função que cancela o timer
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", debounceHandleResize);
    }
  }, [draw]); // Só vai re-chamar o useEffect se o draw mudar.

  return [doEvent,canvasRef];
}
export default CanvasControler;