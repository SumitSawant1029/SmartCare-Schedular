
import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./CommonComponent/LandingPage";
import Login from "./CommonComponent/Login";
import SignupPage from "./CommonComponent/SignupPage";


function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignupPage/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;



