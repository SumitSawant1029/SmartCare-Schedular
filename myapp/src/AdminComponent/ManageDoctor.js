import React, { useState, useEffect } from 'react';
import './AdminHomePage.css';
import API_BASE_URL from '../config'; // Import the API base URL
import { Link } from 'react-router-dom';

const ManageDoctor = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/getallusers`);
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

  // Function to delete a user
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/deleteuser/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Function to update user role based on email
  const updateUserRole = async (userEmail, newRole) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/updateuserrole", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, newRole }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the user list
      } else {
        console.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

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
              <th>Actions</th>
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
                <td>
                  <button onClick={() => deleteUser(user._id)}>Delete</button>
                  <select
                    onChange={(e) => updateUserRole(user.email, e.target.value)} // Send email to update role
                    defaultValue={user.role}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Patient">Patient</option>
                  </select>
                </td>
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

        {renderTable('Doctor', 'Doctor')}
        
      </main>

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default ManageDoctor;
