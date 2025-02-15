import React, { useState, useEffect } from 'react';
import './DoctorHomePage.css';
import DoctorNavbar from './DoctorNavbar';
import API_URL from '../config';


// Calendar Component (now clickable)
const Calendar = ({ appointmentCounts, onDateClick }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed: 0 for January, 11 for December
  const monthName = now.toLocaleString('default', { month: 'long' });

  // Get first and last day of the month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay(); // Day of week (0: Sunday, 6: Saturday)

  // Build weeks array (each week is an array of days)
  const weeks = [];
  let week = [];

  // Fill initial empty cells for days before the 1st
  for (let i = 0; i < startDay; i++) {
    week.push(null);
  }

  // Fill in days for the month
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  // If there are remaining days in the week, fill with null
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  return (
    <div className="calendar">
      <h3>{monthName} {currentYear}</h3>
      <table>
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => (
                <td
                  key={j}
                  className="calendar-cell"
                  onClick={() => day && onDateClick(new Date(currentYear, currentMonth, day))}
                  style={{ cursor: day ? 'pointer' : 'default' }}
                >
                  {day && (
                    <div>
                      <div className="day-number">{day}</div>
                      <div className="appointment-count">
                        {appointmentCounts[day] || 0} appointments
                      </div>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DoctorHomePage = () => {
  const [appointments, setAppointments] = useState([]);
  const doctorEmail = localStorage.getItem('email'); // You can dynamically set this based on the logged-in user

  // Fetch appointments for the doctor from the API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/book/appointments/doctor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ doctorEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setAppointments(data.appointments);  // Assuming response has 'appointments' field
        } else {
          console.error('Error fetching appointments');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchAppointments();
  }, [doctorEmail]);

  // Cancel appointment handler
  const cancelAppointment = (appointmentId) => {
    console.log(`Canceling appointment with ID: ${appointmentId}`);
    // Add API call logic here to cancel the appointment
  };

  // Confirm appointment handler
  const confirmAppointment = (appointmentId) => {
    console.log(`Confirming appointment with ID: ${appointmentId}`);
    // Add API call logic here to confirm the appointment
  };

  // Format Date and Time (using UTC to display the API's time correctly)
  const formatDateAndTime = (dateString) => {
    const appointmentDate = new Date(dateString);

    // Extract date in UTC
    const day = appointmentDate.getUTCDate();
    const month = appointmentDate.getUTCMonth() + 1; // Months are 0-indexed
    const year = appointmentDate.getUTCFullYear();

    // Extract time in UTC
    const hours = appointmentDate.getUTCHours();
    const minutes = appointmentDate.getUTCMinutes();
    const seconds = appointmentDate.getUTCSeconds();

    // Format date as DD/MM/YYYY
    const formattedDate = `${day.toString().padStart(2, '0')}/${month
      .toString()
      .padStart(2, '0')}/${year}`;

    // Format time with AM/PM
    const timePeriod = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${(hours % 12 || 12)
      .toString()
      .padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${timePeriod}`;

    return { formattedDate, formattedTime };
  };

  // Dummy appointment counts for the calendar (later replace with real data)
  const dummyAppointmentCounts = {
    1: 2,
    3: 1,
    5: 4,
    7: 3,
    10: 2,
    12: 5,
    15: 1,
    18: 3,
    20: 2,
    22: 4,
    25: 1,
    28: 2,
  };

  // Handle clicking on a day in the calendar
  const handleDateClick = (date) => {
    console.log('Selected Date:', date);
    // You can now filter appointments or load a new view based on the selected date
  };

  return (
    <>
      <DoctorNavbar />
      <br />
      <br />
      <div className="dashboard">
        {/* Clickable Calendar Component */}
        <Calendar
          appointmentCounts={dummyAppointmentCounts}
          onDateClick={handleDateClick}
        />

        <main>
          <section className="appointments">
            <h2>Today's Appointments</h2>
            <div className="appointments-list">
              {appointments.length > 0 ? (
                <ul>
                  {appointments.map((appointment) => {
                    const { formattedDate, formattedTime } = formatDateAndTime(
                      appointment.appointmentDate
                    );

                    return (
                      <li key={appointment._id} className="appointment-card">
                        <strong>Patient:</strong> {appointment.patientName} <br />
                        <strong>Date:</strong> {formattedDate} <br />
                        <strong>Time:</strong> {formattedTime} <br />
                        <strong>Symptoms:</strong> {appointment.symptoms} <br />
                        <strong>Status:</strong> {appointment.status} <br />

                        <button
                          className="btn confirm-btn"
                          onClick={() => confirmAppointment(appointment._id)}
                        >
                          Confirm Appointment
                        </button>
                        <button
                          className="btn cancel-btn"
                          onClick={() => cancelAppointment(appointment._id)}
                        >
                          Cancel Appointment
                        </button>
                      </li>
                    );
                  })}
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
