import React, { useState, useEffect } from 'react';
import './AdminHomePage.css';
import API_BASE_URL from '../config'; // Import the API base URL
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // Leaflet library for handling maps

const AdminHomePage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null); // New state for selected user
  const [error, setError] = useState(null); // New state for error handling

  // Define a basic user icon for the markers
  const userIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],  // size of the icon
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // point from which the popup should open
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

  // Fetch user details using the authtoken
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage

      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/getuserdetails`, {
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

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Welcome, {selectedUser ? selectedUser.firstname : 'Loading...'}!</h1> {/* Display firstname here */}
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

        {error && <p className="error">{error}</p>} {/* Display error message if any */}

        {/* Map section */}
        <section className="user-map">
          <h2>User Locations</h2>
          <MapContainer
            center={[20.5937, 78.9629]}  // Center on India
            zoom={5}  // Zoom level for India
            style={{ height: '700px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Render markers for each user */}
            {users.map((user) => {
              // Log user data to check if the coordinates are available
              console.log("User data:", user);
              // Check if the coordinates exist and are valid
              if (user.location && user.location.coordinates && user.location.coordinates.length === 2) {
                const [longitude, latitude] = user.location.coordinates;
                return (
                  <Marker key={user._id} position={[latitude, longitude]} icon={userIcon}>
                    <Popup>
                      <strong>{user.firstname} {user.lastname}</strong>
                      <br />
                      {user.role}
                      <br />
                      {user.email}
                    </Popup>
                  </Marker>
                );
              } else {
                console.log(`No valid coordinates for ${user.firstname}`);
                return null;  // Don't render the marker if no valid coordinates
              }
            })}
          </MapContainer>
        </section>
      </main>

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default AdminHomePage;
