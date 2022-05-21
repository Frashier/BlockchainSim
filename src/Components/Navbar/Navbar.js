import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar_navigation">
        <Link to="/" className="navbar_navigation_link">
          Strona główna
        </Link>
        <Link to="/simulation" className="navbar_navigation_link">
          Symulacja
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
