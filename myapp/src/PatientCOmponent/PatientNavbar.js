import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PatientNavbar.css';
import API_URL from '../config';
const PatientNavbar = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('');

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

  return (
    <header className="header">
      <h1>Welcome, {doctorName || 'Loading...'}</h1> 
      <nav>
        <Link to="/patienthomepage">Home</Link>
        <Link to="/alldoctors">Book Appointments</Link>
        <Link to="/patientprofile">Profile</Link>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>
    </header>
  );
};

export default PatientNavbar;
