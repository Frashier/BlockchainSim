import styles from "./App.module.css";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className={styles.app_container}>
      <Navbar />
      <div className={styles.app_body}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
