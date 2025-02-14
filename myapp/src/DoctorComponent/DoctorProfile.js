import React, { useEffect, useState } from 'react';
import './DoctorProfile.css';
import Navbar from './DoctorNavbar';
import API_URL from '../config';

const DoctorProfile = () => {
  const [doctorDetails, setDoctorDetails] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mob: '',
    role: '',
    isEmailVerified: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      fetch(`${API_URL}/api/auth/user?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.data) {
            setDoctorDetails(data.data); // Set the fetched doctor details
            setLoading(false); // Update loading state
          } else {
            setError(data.message || 'Failed to fetch data');
            setLoading(false);
          }
        })
        .catch((err) => {
          setError('Error fetching profile details');
          setLoading(false);
        });
    }
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // Here you would add the logic to update the profile (e.g., send a PUT request to the backend)
    console.log('Profile updated:', doctorDetails);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
    <Navbar/>
    <div className="profile-container">
      <h2>Doctor Profile</h2>
      <form onSubmit={handleUpdateProfile}>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            value={doctorDetails.firstname}
            onChange={(e) => setDoctorDetails({ ...doctorDetails, firstname: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={doctorDetails.lastname}
            onChange={(e) => setDoctorDetails({ ...doctorDetails, lastname: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={doctorDetails.email} disabled />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            value={doctorDetails.mob}
            onChange={(e) => setDoctorDetails({ ...doctorDetails, mob: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <input type="text" value={doctorDetails.role} disabled />
        </div>
        <div className="form-group">
          <label>Email Verified</label>
          <input type="checkbox" checked={doctorDetails.isEmailVerified} disabled />
        </div>
        <button type="submit" className="update-button">Update Profile</button>
      </form>
    </div>
    </>
  );
};

export default DoctorProfile;
