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
            exact
            path={`/BlockchainSim/simulation`}
            element={<Simulation />}
          />
          <Route exact path={`/BlockchainSim`} element={<Homepage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
