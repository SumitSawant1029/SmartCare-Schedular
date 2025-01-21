import React, { useState, useEffect } from 'react';
import './AdminHomePage.css';

const AdminHomePage = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
  });

  useEffect(() => {
    // Simulate fetching admin statistics from the API
    const fetchStats = () => {
      const adminStats = {
        totalDoctors: 25,
        totalPatients: 120,
        totalAppointments: 75,
      };
      setStats(adminStats);
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Welcome, Admin</h1>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/doctors">Manage Doctors</a>
          <a href="/patients">Manage Patients</a>
          <a href="/logout">Logout</a>
        </nav>
      </header>

      <main>
        <section className="admin-stats">
          <h2>System Overview</h2>
          <div className="stats-cards">
            <div className="stats-card">
              <h3>Total Doctors</h3>
              <p>{stats.totalDoctors}</p>
            </div>
            <div className="stats-card">
              <h3>Total Patients</h3>
              <p>{stats.totalPatients}</p>
            </div>
            <div className="stats-card">
              <h3>Total Appointments</h3>
              <p>{stats.totalAppointments}</p>
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
