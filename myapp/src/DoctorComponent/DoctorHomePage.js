import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorHomePage.css';
import DoctorNavbar from './DoctorNavbar';
import API_URL from '../config';

const DoctorHomePage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [report, setReport] = useState(null);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();
  const doctorEmail = localStorage.getItem('email');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log('Fetching appointments for doctor:', doctorEmail);
        const response = await fetch(`${API_URL}/api/book/appointments/doctor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorEmail }),
        });

        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Appointments data:', data);

          const today = new Date().setHours(0, 0, 0, 0);
          const filteredAppointments = data.appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.appointmentDate).setHours(0, 0, 0, 0);
            return (
              appointmentDate === today &&
              appointment.status !== 'PCancelled' &&
              appointment.status !== 'DCancelled'  &&
              appointment.status !== 'Completed'
            );
          });

          console.log('Filtered Appointments:', filteredAppointments);
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

  const handleViewAllRecords = (email) => {
    console.log('Navigating to patient records for:', email);
    navigate(`/patient-records/${email}`);
  };

  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('File converted to base64');
      setFile(reader.result.split(',')[1]); // Extract base64 data
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!prescription || !report || !notes) {
      alert('All fields are required!');
      return;
    }

    console.log('Submitting patient history:', {
      appointmentId: selectedAppointment?._id,
      patientEmail: selectedAppointment?.patientEmail,
      prescription,
      report,
      notes,
    });

    try {
      const response = await fetch(`${API_URL}/api/phis/addhistory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.appointmentId,
          patientEmail: selectedAppointment.patientEmail,
          prescription,
          report,
          notes,
        }),
      });

      console.log('API Response Status:', response.status);
      if (response.ok) {
        console.log('Patient history successfully added');
        alert('Patient history added and appointment marked as complete!');
        setSelectedAppointment(null);
        setPrescription(null);
        setReport(null);
        setNotes('');
        window.location.reload();
      } else {
        const errorResponse = await response.json();
        console.error('Failed to add patient history:', errorResponse);
      }
    } catch (error) {
      console.error('Error:', error);
    }
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
                      <button className="btn view-history-btn" onClick={() => handleViewAllRecords(appointment.patientEmail)}>
                        View All Records
                      </button>
                      <button className="btn complete-btn" onClick={() => setSelectedAppointment(appointment)}>
                        Complete
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
      
      {selectedAppointment && (
        <div className="modal">
          <div className="modal-content">
            <h2>Complete Appointment</h2>
            <label>Prescription (PDF):</label>
            <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setPrescription)} />
            <label>Medical Report (PDF):</label>
            <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setReport)} />
            <label>Doctor's Notes:</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
            <div className="modal-buttons">
              <button className="btn close-btn" onClick={() => setSelectedAppointment(null)}>Close</button>
              <button className="btn complete-btn" onClick={handleSubmit}>Mark as Complete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorHomePage;
