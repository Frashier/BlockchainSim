import "./App.css";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="app_container">
      <Navbar />
      <div className="app_body">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
