import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BitCanvas from './components/BitCanvas/BitCanvas';
import Layout from './Layout'
import JogoDaVida from './pages/JogoDaVida';
//import Config from './config/production.json';
//import Config from './config/production-kcire.json';
import Config from './config/default.json';
function App() {
  //const APIURL = "localhost:9090";

  //const APIURL = "192.168.1.112:31001";
  const APIURL = Config["goapiurl"];
  const APIWEBSOCKET = Config["goapiwebsocket"];
  const BASENAME = window.PUBLIC_URL && window.PUBLIC_URL.length > 0 ? window.PUBLIC_URL : "/";
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        {
        // Se for no caminho de quando é build no dev, redireciona.
        //!ISBUILD && <Route path={BUILDBASENAME} element={<Redirecionar path={DEVBASENAME}/>}/>
        }
        <Route path="/life" element={<Layout />}>
          <Route index element={<JogoDaVida apiurl={APIURL} apiwebsocket={APIWEBSOCKET}/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
//  return (
//    <JogoDaVida apiurl={APIURL}/>
//  )
}

export default App;
