import React, { useState, useEffect } from 'react';
import './DoctorHomePage.css';

const DoctorHomePage = () => {
  const [appointments, setAppointments] = useState([]);

  // Simulate fetching appointments from an API
  useEffect(() => {
    const fetchAppointments = () => {
      const todayAppointments = [
        { id: 1, patientName: 'John Doe', time: '10:00 AM', reason: 'Routine Checkup' },
        { id: 2, patientName: 'Jane Smith', time: '11:30 AM', reason: 'Flu Symptoms' },
        { id: 3, patientName: 'Mark Lee', time: '1:00 PM', reason: 'Follow-up' },
      ];
      setAppointments(todayAppointments);
    };

    fetchAppointments();
  }, []);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Welcome, Dr. [Name]</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/appointments">Appointments</a>
          <a href="/profile">Profile</a>
          <a href="/">Logout</a>
        </nav>
      </header>

      <main>
        <section className="appointments">
          <h2>Today's Appointments</h2>
          <div className="appointments-list">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <h3>{appointment.patientName}</h3>
                  <p><strong>Time:</strong> {appointment.time}</p>
                  <p><strong>Reason:</strong> {appointment.reason}</p>
                </div>
              ))
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
  );
};

export default DoctorHomePage;
