import './Layout.css';
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <nav className="topo">
        <ul className="topo" id="barratopo">
          <li className="col left">
            <Link to="/">Jogo da Vida</Link>
          </li>
          <li className="col right">
            <Link to="/sobre">Sobre</Link>
          </li>
          
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;