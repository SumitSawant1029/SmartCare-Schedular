import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PatientNavbar.css';
import API_URL from '../config';

const PatientNavbar = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const email = localStorage.getItem("email");

    if (email) {
      fetch(`${API_URL}/api/auth/user?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.data) {
            const { firstname, lastname } = data.data;
            setDoctorName(`${firstname} ${lastname}`);
          }
        })
        .catch((error) => console.error('Error fetching doctor details:', error));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("email");
    navigate("/"); // Redirect to home page after logout
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="header">
      <h1>Welcome, {doctorName || 'Loading...'}</h1>
      <nav>
        <Link to="/patienthomepage">Home</Link>
        <div className="dropdown">
          <button className="dropdown-btn" onClick={toggleDropdown}>Appointments</button>
          {isDropdownOpen && (
            <div className="dropdown-menu" ref={dropdownRef}>
              <Link to="/alldoctors" className="dropdown-item">Book Appointment</Link>
              <Link to="/pastappointments" className="dropdown-item">Appointment History</Link>
            </div>
          )}
        </div>
        <Link to="/patientprofile">Profile</Link>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>
    </header>
  );
};

export default PatientNavbar;
