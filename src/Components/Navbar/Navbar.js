import "./Navbar.css";
import content from "../../translations/polish.json";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar_navigation">
        <Link to="/" className="navbar_navigation_link">
          {content.navbar.homepage}
        </Link>
        <Link to="/simulation" className="navbar_navigation_link">
          {content.navbar.simulation}
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
