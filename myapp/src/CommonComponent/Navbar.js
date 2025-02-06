import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import CSS for Navbar
import logo from "../Asset/logoNavbar.png";

const Navbar = () => {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={`navbar ${scrolling ? "navbar-scrolled" : ""}`}>
      <div className="navbar-logo">
        <img src={logo} alt="Logo" />
      </div>

      <ul className="navbar-links">
        <li><Link to="/" className="navbar-link">Home</Link></li>
        <li><Link to="#features" className="navbar-link">Features</Link></li>
        <li><Link to="#contact" className="navbar-link">Contact</Link></li>
      </ul>

      <div className="navbar-buttons">
        <Link to="/login" className="navbar-button">Log in</Link>
        <Link to="/signup" className="navbar-button1">Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;
