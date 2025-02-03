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

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doc/getallusers/doctor`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();
      console.log('Fetched doctors:', data); // Debugging

      // Filter approved and pending doctors
      const approvedDoctors = data.filter((doctor) => doctor.isApproved === true);
      const pendingDoctors = data.filter((doctor) => doctor.isApproved === false);

      setDoctors(approvedDoctors);
      setPendingDoctors(pendingDoctors);

      // Update stats
      setStats({
        totalAdmins: 0, 
        totalDoctors: data.length,
        totalPatients: 0
      });

    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Approve doctor request (POST with body)
  const approveDoctor = async (doctorId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doc/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ doctorId }) // Sending doctorId in the body
      });

      if (!response.ok) {
        throw new Error('Failed to approve doctor');
      }

      const result = await response.json();
      console.log('Doctor approved:', result);

      // Refresh the list after approval
      fetchDoctors();

    } catch (error) {
      console.error('Error approving doctor:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const renderTable = (doctors, title, isPending = false) => {
    return (
      <section className="admin-details">
        <h2>{title} Doctor Details</h2>
        <table className="details-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Hospital</th>
              <th>Experience</th>
              <th>Approval Status</th>
              {isPending && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor._id}>
                <td>{doctor._id}</td>
                <td>{doctor.email}</td>
                <td>{doctor.specialization}</td>
                <td>{doctor.hospital}</td>
                <td>{doctor.yearsOfExperience} years</td>
                <td>{doctor.isApproved ? 'Approved' : 'Pending'}</td>
                {isPending && (
                  <td>
                    <button onClick={() => approveDoctor(doctor._id)} className="approve-btn">
                      Approve
                    </button>
                  </td>
                )}
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

        {renderTable(pendingDoctors, 'Pending', true)}
        {renderTable(doctors, 'Approved')}
      </main>

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default ManageDoctor;
