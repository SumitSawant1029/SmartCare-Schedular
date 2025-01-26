import React, { useState, useEffect } from 'react';
import './AdminHomePage.css';
import API_BASE_URL from '../config'; // Import the API base URL
import { Link } from 'react-router-dom';

const AdminHomePage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null); // New state for selected user
  const [error, setError] = useState(null); // New state for error handling

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

  // Fetch user details using the authtoken
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage

      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/getuserdetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authtoken: token, // Send token in the request body
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedUser(data.data); // Access the actual user data here
        console.log(data); // Store the user details
      } else {
        setError(data.message || 'User not found');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Error fetching user details');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserDetails(); // Fetch logged-in user details when component mounts
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
      <header className="admin-header">
        <h1>Welcome, {selectedUser ? selectedUser.firstname : 'Loading...'} !</h1> {/* Display firstname here */}
        <nav>
          <Link to="/adminhomepage">Dashboard</Link>
          <Link to="/managedoctor">Manage Doctors</Link>
          <Link to="/managepatient">Manage Patients</Link>
          <Link to="/logout">Logout</Link>
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

        {renderTable('Admin', 'Admin')}

        {selectedUser && (
          <section className="user-details">
            <h2>User Details</h2>
            <p><strong>First Name:</strong> {selectedUser.firstname}</p>
            <p><strong>Last Name:</strong> {selectedUser.lastname}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Mobile:</strong> {selectedUser.mob}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Email Verified:</strong> {selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
          </section>
        )}

        {error && <p className="error">{error}</p>} {/* Display error message if any */}
      </main>

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default AdminHomePage;
