import React, { useState, useEffect } from 'react';
import './AdminHomePage.css';
import API_BASE_URL from '../config'; // Import the API base URL
import { Link } from 'react-router-dom';

const ManageDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });

  // Fetch all users from the API
  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/getallusers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, // Add token to the request
        },
      });
      const data = await response.json();

      // Filter doctors by approval status
      const approvedDoctors = data.filter((user) => user.role === 'Doctor' && user.isApproved === true);
      const pendingDoctors = data.filter((user) => user.role === 'Doctor' && user.isApproved === false);

      setDoctors(approvedDoctors);
      setPendingDoctors(pendingDoctors);

      // Calculate stats dynamically
      const totalAdmins = data.filter((user) => user.role === 'Admin').length;
      const totalDoctors = data.filter((user) => user.role === 'Doctor').length;
      const totalPatients = data.filter((user) => user.role === 'Patient').length;

      setStats({ totalAdmins, totalDoctors, totalPatients });
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const renderTable = (doctors, title) => {
    return (
      <section className="admin-details">
        <h2>{title} Doctor Details</h2>
        <table className="details-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Mobile</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor._id}>
                <td>{doctor._id}</td>
                <td>{doctor.firstname}</td>
                <td>{doctor.lastname}</td>
                <td>{doctor.email}</td>
                <td>{doctor.mob}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Welcome, Admin</h1>
        <nav>
          <Link to="/adminhomepage">Dashboard</Link>
          <Link to="/managedoctor">Manage Doctors</Link>
          <Link to="/managepatient">Manage Patients</Link>
          <Link to="/">Logout</Link>
        </nav>
      </header>

      <main>
        <section className="admin-stats">
          <h2>System Overview</h2>
          <div className="stats-cards">
            <div className="stats-card">
              <h3>Total Admins</h3>
              <p>{stats.totalAdmins}</p>
            </div>
            <div className="stats-card">
              <h3>Total Doctors</h3>
              <p>{stats.totalDoctors}</p>
            </div>
            <div className="stats-card">
              <h3>Total Patients</h3>
              <p>{stats.totalPatients}</p>
            </div>
          </div>
        </section>

        {renderTable(pendingDoctors, 'Pending')}
        {renderTable(doctors, 'Approved')}
      </main>

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default ManageDoctor;
