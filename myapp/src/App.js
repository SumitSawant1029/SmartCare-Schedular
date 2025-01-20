
import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./CommonComponent/LandingPage";


function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;



