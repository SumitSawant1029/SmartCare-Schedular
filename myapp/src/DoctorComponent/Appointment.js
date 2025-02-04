import React, { useState, useEffect } from 'react';
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
  const [slotData, setSlotData] = useState({}); // Store the data with booked and doctorAllowed
  const doctorEmail = localStorage.getItem('email');

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!doctorEmail) return;

      try {
        const response = await fetch('http://localhost:5000/api/doc/availability/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorEmail }),
        });

        const data = await response.json();

        if (response.status === 200) {
          // Set the slot data with booked and doctorAllowed status
          setSlotData(data.availableSlots || {});
        } else {
          console.error('No availability found:', data.message);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, [doctorEmail]);

  const toggleSlot = (slot) => {
    setSlotData((prevState) => {
      const newState = { ...prevState };
      if (newState[slot]) {
        newState[slot].doctorAllowed = !newState[slot].doctorAllowed;
      } else {
        newState[slot] = { booked: false, doctorAllowed: true };
      }
      return newState;
    });
  };

  const saveAvailability = async () => {
    if (!doctorEmail) {
      alert('Doctor email not found! Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/doc/availability/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorEmail, date: getTomorrowDate(), availableSlots: slotData }),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability');
    }
  };

  return (
    <>
      <Navbar />
      <div className="appointments-container">
        <h1>Set Availability for Tomorrow ({getTomorrowDate()})</h1>
        <div className="slots-grid">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              className={slotData[slot]?.doctorAllowed ? 'slot allowed' : 'slot not-allowed'}
              onClick={() => toggleSlot(slot)}
              disabled={!slotData[slot]?.doctorAllowed}
            >
              {slot} - {slotData[slot]?.doctorAllowed ? 'Allowed' : 'Not Allowed'}
            </button>
          ))}
        </div>
        <button className="save-btn" onClick={saveAvailability}>Save Availability</button>
      </div>
    </>
  );
};

export default Appointment;
