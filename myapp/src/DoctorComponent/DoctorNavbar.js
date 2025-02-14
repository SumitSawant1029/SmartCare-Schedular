import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DoctorHomePage.css';
import API_URL from '../config';

const DoctorNavbar = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    // Get email from localStorage
    const email = localStorage.getItem("email");
    if (email) {
      // Make an API call to fetch doctor details using GET request
      fetch(`${API_URL}/api/auth/user?email=${encodeURIComponent(email)}`, {
        method: 'GET', // Use GET instead of POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Send token for authorization
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.data) {
            const { firstname, lastname } = data.data;
            setDoctorName(`${firstname} ${lastname}`); // Set the doctor's full name
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
      <h1>Welcome, Dr. {doctorName || 'Loading...'}</h1> {/* Display doctor's name or loading text */}
      <nav>
        <Link to="/doctorhomepage">Home</Link>
        <Link to="/appointments">Appointments</Link>
        <Link to="/doctorprofile">Profile</Link>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>
    </header>
  );
};

export default DoctorNavbar;
