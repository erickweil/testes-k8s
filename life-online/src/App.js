import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BitCanvas from './components/BitCanvas/BitCanvas';
import Layout from './Layout'
import JogoDaVida from './pages/JogoDaVida';
function App() {

  const BASENAME = window.PUBLIC_URL && window.PUBLIC_URL.length > 0 ? window.PUBLIC_URL : "/";
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        {
        // Se for no caminho de quando é build no dev, redireciona.
        //!ISBUILD && <Route path={BUILDBASENAME} element={<Redirecionar path={DEVBASENAME}/>}/>
        }
        <Route path="/" element={<Layout />}>
          <Route index element={<JogoDaVida />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
