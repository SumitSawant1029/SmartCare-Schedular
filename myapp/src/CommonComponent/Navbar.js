import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import CSS for Navbar

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>SmartCare</h2>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/" className="navbar-link">Home</Link>
        </li>
        <li>
          <Link to="#features" className="navbar-link">Features</Link>
        </li>
        <li>
          <Link to="#contact" className="navbar-link">Contact</Link>
        </li>
        <li>
          <Link to="/login" className="navbar-link">Login</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
