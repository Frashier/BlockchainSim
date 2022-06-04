import "./App.css";
import Navbar from "../Navbar/Navbar";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Homepage from "../Homepage/Homepage";
import Simulation from "../Simulation/Simulation";

function App() {
  return (
    <BrowserRouter>
      <div className="app_container">
        <Navbar />
        <Routes className="app_body">
          <Route
            path={`/${process.env.REACT_REPO_NAME}/simulation`}
            element={<Simulation />}
          />
          <Route
            path={`/${process.env.REACT_REPO_NAME}`}
            element={<Homepage />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
