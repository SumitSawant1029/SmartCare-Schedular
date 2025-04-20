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
            setDoctorDetails(data.data);
            setLoading(false);
          } else {
            setError(data.message || 'Failed to fetch data');
            setLoading(false);
          }
        })
        .catch(() => {
          setError('Error fetching profile details');
          setLoading(false);
        });
    }
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    console.log('Profile updated:', doctorDetails);
  };

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <h2>Doctor Profile</h2>
          <form onSubmit={handleUpdateProfile}>
            <label>First Name</label>
            <input
              type="text"
              value={doctorDetails.firstname}
              onChange={(e) =>
                setDoctorDetails({ ...doctorDetails, firstname: e.target.value })
              }
              required
              disabled
            />

            <label>Last Name</label>
            <input
              type="text"
              value={doctorDetails.lastname}
              onChange={(e) =>
                setDoctorDetails({ ...doctorDetails, lastname: e.target.value })
              }
              required
              disabled
            />

            <label>Email</label>
            <input type="email" value={doctorDetails.email} disabled />

            <label>Phone Number</label>
            <input
              type="text"
              value={doctorDetails.mob}
              onChange={(e) =>
                setDoctorDetails({ ...doctorDetails, mob: e.target.value })
              }
              required
              disabled
            />

            <label>Role</label>
            <input type="text" value={doctorDetails.role} disabled />

            <label>Email Verified</label>
            <input type="checkbox" checked={doctorDetails.isEmailVerified} disabled />

            <button type="submit">Update Profile</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DoctorProfile;
