import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className={styles.navbar}>
      <div className={styles.navbar_navigation}>
        <Link to="/" className={styles.navbar_navigation_link}>
          Homepage
        </Link>
        <Link to="/simulation" className={styles.navbar_navigation_link}>
          Simulation
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
