import React, { useState, useEffect } from 'react';
import './AdminHomePage.css';
import API_BASE_URL from '../config'; // Import the API base URL
import { Link } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const ManagePatient = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/getallusers`);
      const data = await response.json();

      // Calculate stats dynamically
      const totalAdmins = data.filter((user) => user.role === 'Admin').length;
      const totalDoctors = data.filter((user) => user.role === 'Doctor').length;
      const totalPatients = data.filter((user) => user.role === 'Patient').length;

      setStats({ totalAdmins, totalDoctors, totalPatients });
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderTable = (role, title) => {
    const filteredUsers = users.filter((user) => user.role === role);
    return (
      <section className="admin-details">
        <h2>{title} Details</h2>
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
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.email}</td>
                <td>{user.mob}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  };

  return (
    <div className="admin-dashboard">
      <AdminNavbar/>

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

        {renderTable('Patient', 'Patient')}
      </main>

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default ManagePatient;
