import React, { useState, useEffect } from 'react';
import './AdminHomePage.css';
import API_BASE_URL from '../config'; // Import the API base URL
import { Link } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

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
  const approveDoctor = async (doctorId, doctorEmail) => {
    try {
      console.log(`Approving doctor with ID: ${doctorId} and Email: ${doctorEmail}`); // Debug log

      const response = await fetch(`${API_BASE_URL}/api/doc/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ doctorId })
      });

      // Check HTTP status
      console.log('Approval API Response Status:', response.status);

      const responseData = await response.json().catch(err => {
        console.error('Error parsing approval response JSON:', err);
        throw new Error('Invalid JSON response from approval API');
      });

      console.log('Approval API Response Data:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to approve doctor: ${responseData.message || 'Unknown error'}`);
      }

      // After approval, trigger the setAvailability API
      console.log(`Setting availability for doctor email: ${doctorEmail}`);

      const availabilityResponse = await fetch(`${API_BASE_URL}/api/doc/setAvailability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ doctorEmail })
      });

      // Check HTTP status
      console.log('Availability API Response Status:', availabilityResponse.status);

      const availabilityData = await availabilityResponse.json().catch(err => {
        console.error('Error parsing availability response JSON:', err);
        throw new Error('Invalid JSON response from availability API');
      });

      console.log('Availability API Response Data:', availabilityData);

      if (!availabilityResponse.ok) {
        throw new Error(`Failed to set availability: ${availabilityData.message || 'Unknown error'}`);
      }

      console.log('Doctor successfully approved and availability set');

      // Refresh the doctor list
      fetchDoctors();
    } catch (error) {
      console.error('Error approving doctor or setting availability:', error);
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
                    <button onClick={() => approveDoctor(doctor._id, doctor.email)} className="approve-btn">
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
