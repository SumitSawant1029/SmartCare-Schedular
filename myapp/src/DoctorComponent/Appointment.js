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
  const [selectedSlots, setSelectedSlots] = useState([]);
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
          // Set the available slots from the response
          setSelectedSlots(data.availableSlots || []);
        } else {
          console.error('No availability found:', data.message);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, [doctorEmail]);

  const toggleSlot = async (slot) => {
    const newSlots = selectedSlots.includes(slot)
      ? selectedSlots.filter((s) => s !== slot)
      : [...selectedSlots, slot];

    setSelectedSlots(newSlots); // Update local state first

    try {
      await fetch('http://localhost:5000/api/doc/availability/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorEmail, date: getTomorrowDate(), selectedSlots: newSlots }),
      });
    } catch (error) {
      console.error('Error saving slot:', error);
      // Rollback to the previous state in case of an error
      setSelectedSlots(selectedSlots);
    }
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
        body: JSON.stringify({ doctorEmail, date: getTomorrowDate(), selectedSlots }),
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
