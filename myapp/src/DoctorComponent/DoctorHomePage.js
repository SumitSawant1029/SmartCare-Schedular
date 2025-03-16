import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import './DoctorHomePage.css';
import DoctorNavbar from './DoctorNavbar';
import API_URL from '../config';

const DoctorHomePage = () => {
  const [appointments, setAppointments] = useState([]);
  const [patientEmail, setPatientEmail] = useState(null);
  const navigate = useNavigate();

  const doctorEmail = localStorage.getItem('email');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/book/appointments/doctor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          const today = new Date().setHours(0, 0, 0, 0);
          const filteredAppointments = data.appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.appointmentDate).setHours(0, 0, 0, 0);
            return (
              appointmentDate === today &&
              appointment.status !== 'PCancelled' &&
              appointment.status !== 'DCancelled'
            );
          });

          setAppointments(filteredAppointments);
        } else {
          console.error('Error fetching appointments');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchAppointments();
  }, [doctorEmail]);

  // Function to navigate to "View All Records" page
  const handleViewAllRecords = (email) => {
    navigate(`/patient-records/${email}`);
  };

  return (
    <>
      <DoctorNavbar />
      <div className="dashboard">
        <main>
          <section className="appointments">
            <h2>Today's Appointments</h2>
            <div className="appointments-list">
              {appointments.length > 0 ? (
                <ul>
                  {appointments.map((appointment) => (
                    <li key={appointment._id} className="appointment-card">
                      <div className="appointment-details">
                        <p><strong>Patient:</strong> {appointment.patientName}</p>
                        <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
                        <p><strong>Date:</strong> {new Date(appointment.appointmentDate).toDateString()}</p>
                        <p><strong>Time:</strong> {new Date(appointment.appointmentDate).toLocaleTimeString()}</p>
                      </div>
                      <button
                        className="btn view-history-btn"
                        onClick={() => handleViewAllRecords(appointment.patientEmail)}
                      >
                        View All Records
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No appointments for today!</p>
              )}
            </div>
          </section>
        </main>
        <footer>
          <p>Smart Care Scheduler © 2025</p>
        </footer>
      </div>
    </>
  );
};

export default DoctorHomePage;
