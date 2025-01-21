import React, { useState, useEffect } from 'react';
import './PatientHomePage.css';

const PatientHomePage = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Simulate fetching patient appointments from the API
    const fetchAppointments = () => {
      const patientAppointments = [
        { id: 1, doctorName: 'Dr. Smith', time: '10:30 AM', status: 'Confirmed' },
        { id: 2, doctorName: 'Dr. Jane', time: '2:00 PM', status: 'Pending' },
      ];
      setAppointments(patientAppointments);
    };

    fetchAppointments();
  }, []);

  return (
    <div className="patient-dashboard">
      <header className="patient-header">
        <h1>Welcome, [Patient Name]</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/appointments">My Appointments</a>
          <a href="/profile">Profile</a>
          <a href="/logout">Logout</a>
        </nav>
      </header>

      <main>
        <section className="patient-appointments">
          <h2>My Appointments</h2>
          <div className="appointments-list">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <h3>{appointment.doctorName}</h3>
                  <p><strong>Time:</strong> {appointment.time}</p>
                  <p><strong>Status:</strong> {appointment.status}</p>
                </div>
              ))
            ) : (
              <p>You have no appointments scheduled.</p>
            )}
          </div>
        </section>
      </main>

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default PatientHomePage;
