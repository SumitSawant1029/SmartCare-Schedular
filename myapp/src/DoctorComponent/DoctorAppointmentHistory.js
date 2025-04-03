import React, { useState, useEffect } from 'react';
import './DoctorAppointmentHistory.css';
import DoctorNavbar from './DoctorNavbar';
import API_URL from '../config';

const DoctorAppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filter, setFilter] = useState({
    date: '',
    patientName: '',
    showAll: true
  });
  const doctorEmail = localStorage.getItem('email');

  useEffect(() => {
    const fetchAppointmentHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/book/appointments/doctor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments);
          setFilteredAppointments(data.appointments); // Default to show all appointments
        } else {
          console.error('Error fetching appointment history');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchAppointmentHistory();
  }, [doctorEmail]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => {
      const newFilter = { ...prevFilter, [name]: value };
      if (newFilter.date || newFilter.patientName) {
        newFilter.showAll = false;
      } else {
        newFilter.showAll = true;
      }
      return newFilter;
    });
  };

  const handleSearch = () => {
    let filtered = appointments;
    if (filter.date) {
      filtered = filtered.filter(appointment => {
        const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-CA'); // 'yyyy-mm-dd' format
        return formattedDate === filter.date;
      });
    }
    if (filter.patientName) {
      filtered = filtered.filter(appointment =>
        appointment.patientName.toLowerCase().includes(filter.patientName.toLowerCase())
      );
    }
    setFilteredAppointments(filtered);
  };

  const resetFilter = () => {
    setFilter({
      date: '',
      patientName: '',
      showAll: true
    });
    setFilteredAppointments(appointments); // Reset to show all appointments
  };

  const formatDateAndTime = (dateString) => {
    const appointmentDate = new Date(dateString);
    const day = appointmentDate.getDate();
    const month = appointmentDate.getMonth() + 1;
    const year = appointmentDate.getFullYear();
    const hours = appointmentDate.getHours();
    const minutes = appointmentDate.getMinutes();
    const seconds = appointmentDate.getSeconds();
    const timePeriod = hours >= 12 ? 'PM' : 'AM';
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    const formattedTime = `${(hours % 12 || 12).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${timePeriod}`;
    return { formattedDate, formattedTime };
  };
  

  const getStatusClassName = (status) => {
    if (status === 'PCancelled' || status === 'DCancelled') {
      return 'cancelled';  // Grey
    } else if (status === 'Completed') {
      return 'completed';  // Green
    } else if (status === 'Confirmed') {
      return 'confirmed';  // Default (you can add any color you like)
    }
    return '';
  };

  return (
    <>
      <DoctorNavbar />
      <div className="dashboard">
        <main>
          <section className="appointments-history">
            <h2>Appointment History</h2>
            <div className="filter-section">
              <input
                type="text"
                name="patientName"
                value={filter.patientName}
                onChange={handleFilterChange}
                placeholder="Search by Patient Name"
              />
              <input
                type="date"
                name="date"
                value={filter.date}
                onChange={handleFilterChange}
              />
              <button onClick={handleSearch}>Search</button>
              <button onClick={resetFilter}>Show All</button>
            </div>
            <div className="appointments-history-list">
              {filteredAppointments.length > 0 ? (
                <ul>
                  {filteredAppointments.map((appointment) => {
                    const { formattedDate, formattedTime } = formatDateAndTime(appointment.appointmentDate);
                    const statusClass = getStatusClassName(appointment.status);
                    return (
                      <li key={appointment._id} className="appointment-card">
                        <div className={`status-bar ${statusClass}`}></div> {/* Status bar on the left */}
                        <div className="appointment-details">
                          <p><strong>Patient:</strong> {appointment.patientName}</p>
                          <p><strong>Date:</strong> {formattedDate}</p>
                          <p><strong>Time:</strong> {formattedTime}</p>
                          <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
                          <p><strong>Status:</strong> {appointment.status}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No appointment history available.</p>
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

export default DoctorAppointmentHistory;
