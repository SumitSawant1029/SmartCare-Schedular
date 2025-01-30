import React, { useState } from 'react';
import './Appointment.css';
import Navbar from './DoctorNavbar';
const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'
];

const Appointment = () => {
  const [selectedSlots, setSelectedSlots] = useState([]);

  const toggleSlot = (slot) => {
    setSelectedSlots((prevSlots) =>
      prevSlots.includes(slot)
        ? prevSlots.filter((s) => s !== slot)
        : [...prevSlots, slot]
    );
  };

  const saveAvailability = () => {
    console.log('Selected Slots:', selectedSlots);
    alert('Availability saved successfully!');
    // API call to save selected slots can be added here
  };

  return (
    <>
    <Navbar/>
    <div className="appointments-container">
      <h1>Set Availability for Tomorrow</h1>
      <div className="slots-grid">
        {timeSlots.map((slot) => (
          <button
            key={slot}
            className={selectedSlots.includes(slot) ? 'slot selected' : 'slot'}
            onClick={() => toggleSlot(slot)}
          >
            {slot}
          </button>
        ))}
      </div>
      <button className="save-btn" onClick={saveAvailability}>Save Availability</button>
    </div>
    </>
  );
};

export default Appointment;
