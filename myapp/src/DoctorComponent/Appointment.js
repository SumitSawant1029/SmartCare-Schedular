import React, { useState, useEffect } from 'react';
import './Appointment.css';
import Navbar from './DoctorNavbar';
import API_URL from '../config';
const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'
];

const Appointment = () => {
  const [allowedSlots, setAllowedSlots] = useState([]);
  const doctorEmail = localStorage.getItem('email');

  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorEmail) return;

      try {
        const response = await fetch(`${API_URL}/api/doc/get-slots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorEmail }),
        });

        const data = await response.json();

        if (response.status === 200) {
          setAllowedSlots(data.allowedSlots || []);
        } else {
          console.error('No slots found:', data.message);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
      }
    };

    fetchSlots();
  }, [doctorEmail]);

  const toggleSlot = async (slot) => {
    const isAllowed = allowedSlots.includes(slot);
    const apiEndpoint = isAllowed ? 'disallow-slots' : 'allow-slots';
    const updatedSlots = isAllowed ? allowedSlots.filter(s => s !== slot) : [...allowedSlots, slot];

    try {
      const response = await fetch(`${API_URL}/api/doc/${apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorEmail, slots: [slot] }),
      });
      console.log("Successfull");
      const data = await response.json();

      if (response.status === 200) {
        // Update the slots list based on the API response
        if (!isAllowed) {
          setAllowedSlots(updatedSlots);
        } else {
          setAllowedSlots(updatedSlots);
        }
      } else {
        console.error('Error toggling slot:', data.message);
      }
    } catch (error) {
      console.error('Error toggling slot:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="appointments-container">
        <h1>Doctor's Availability</h1>
        <div className="slots-grid">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              className={allowedSlots.includes(slot) ? 'slot allowed' : 'slot not-allowed'}
              style={{ backgroundColor: allowedSlots.includes(slot) ? 'green' : 'grey', color: 'white' }}
              onClick={() => toggleSlot(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Appointment;