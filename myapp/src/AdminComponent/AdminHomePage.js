import React, { useState, useEffect } from 'react';
import './AdminHomePage.css';
import API_URL from '../config';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet'; // Leaflet library for handling maps
import AdminNavbar from './AdminNavbar';
import { Line } from 'react-chartjs-2'; // For rendering line charts
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminHomePage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });
  // Removed: const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null); // New state for error handling

  // Define different user icons for doctors and patients
  const doctorIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const patientIcon = new L.Icon({
    iconUrl: 'https://w7.pngwing.com/pngs/457/630/png-transparent-location-logo-location-computer-icons-symbol-location-miscellaneous-angle-heart-thumbnail.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const [mapKey, setMapKey] = useState(0); // State to trigger map re-render

  // Dummy Data for Appointment Graphs
  const appointmentData = {
    appointmentsByYear: {
      labels: ['2021', '2022', '2023', '2024'],
      data: [100, 200, 250, 300],
    },
    appointmentsPerYear: {
      labels: ['2021', '2022', '2023', '2024'],
      data: [150, 220, 270, 330],
    },
  };

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/getallusers`);
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

      const response = await fetch(`${API_URL}/api/auth/getuserdetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authtoken: token,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Removed setting selectedUser since it was not used.
        console.log(data); // Log the user details if needed
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

  // Function to reset the map view to India
  const resetMapToIndia = () => {
    setMapKey(prevKey => prevKey + 1); // Change key to trigger re-render
  };

  // Custom hook to use the map instance and reset view
 // Custom hook to use the map instance and reset view
const ResetMap = () => {
  const map = useMap(); // Get the map instance
  useEffect(() => {
    if (map) {
      map.setView([20.5937, 78.9629], 5); // Coordinates for India and zoom level 5
    }
  }, [map]); // Removed mapKey from dependency array
  return null;
};


  return (
    <div className="admin-dashboard">
      <AdminNavbar />

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

        {error && <p className="error">{error}</p>}

        {/* Map section */}
        <section className="user-map">
          <h2>User Locations</h2>
          <MapContainer
            key={mapKey}
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '700px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {users.map((user) => {
              console.log("User data:", user);
              if (user.location && user.location.coordinates && user.location.coordinates.length === 2) {
                const [longitude, latitude] = user.location.coordinates;
                return (
                  <Marker
                    key={user._id}
                    position={[latitude, longitude]}
                    icon={user.role === 'Doctor' ? doctorIcon : patientIcon}
                  >
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
                return null;
              }
            })}
            <ResetMap />
          </MapContainer>

          <button onClick={resetMapToIndia} className="reset-map-button">Reset Map to India</button>
        </section>

        {/* Graph Section */}
        <section className="appointment-graphs">
          <h2>Appointment Statistics</h2>
          <div className="graph-container">
            <div className="graph-card">
              <h3>Appointments Based on Year</h3>
              <Line
                data={{
                  labels: appointmentData.appointmentsByYear.labels,
                  datasets: [
                    {
                      label: 'Appointments by Year',
                      data: appointmentData.appointmentsByYear.data,
                      fill: false,
                      borderColor: '#007bff',
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Appointments Based on Year',
                    },
                  },
                }}
              />
            </div>

            <div className="graph-card">
              <h3>Appointments per Year</h3>
              <Line
                data={{
                  labels: appointmentData.appointmentsPerYear.labels,
                  datasets: [
                    {
                      label: 'Appointments per Year',
                      data: appointmentData.appointmentsPerYear.data,
                      fill: false,
                      borderColor: '#28a745',
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Appointments per Year',
                    },
                  },
                }}
              />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default AdminHomePage;
