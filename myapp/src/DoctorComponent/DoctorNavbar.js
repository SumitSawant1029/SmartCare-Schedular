import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DoctorNavbar.css';
import API_URL from '../config';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import logo from "../Asset/logoNavbarwhite.png"; // Adjust path as needed

const DoctorNavbar = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('');
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef(null);

  useEffect(() => {
    const email = localStorage.getItem("email");

    if (email) {
      fetch(`${API_URL}/api/auth/user?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.data) {
            const { firstname, lastname } = data.data;
            const formattedFirstName = formatName(firstname);
            const formattedLastName = formatName(lastname);
            setDoctorName(`${formattedFirstName} ${formattedLastName}`);
          }
        })
        .catch((error) => console.error('Error fetching doctor details:', error));
    }
  }, []);

  const formatName = (name) => {
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return '';
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("email");
    navigate("/"); // Redirect to home page after logout
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  return (
    <header className="navbar">
      <div className="logo">
        <img src={logo} alt="SmartCare Logo" />
      </div>

      <nav className="nav-links">
        <Link to="/doctorhomepage" className="nav-item">Home</Link>
        <Link to="/Dhistoryappointments" className="nav-item">Appointments</Link>

        {/* Account Dropdown */}
        <div className="account-dropdown">
          <button className="dropdown-btn" onClick={toggleAccountDropdown}>
            <FaUserCircle /> {doctorName ? doctorName : 'Loading...'} <FaChevronDown />
          </button>
          {isAccountDropdownOpen && (
            <div className="dropdown-menu" ref={accountDropdownRef}>
              <Link to="/doctorprofile" className="dropdown-item">Profile</Link>
              <button onClick={handleLogout} className="dropdown-item">Logout</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default DoctorNavbar;
