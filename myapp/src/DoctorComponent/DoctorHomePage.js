import React, { useState, useEffect } from 'react';
import './DoctorHomePage.css';
import DoctorNavbar from './DoctorNavbar';
import API_URL from '../config';

const DoctorHomePage = () => {
  const [appointments, setAppointments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionBase64, setPrescriptionBase64] = useState(''); // Base64 string for prescription
  const [doctorNotes, setDoctorNotes] = useState('');
  const [files, setFiles] = useState([]); // Array to store multiple files

  const doctorEmail = localStorage.getItem('email');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/book/appointments/doctor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          const today = new Date().setHours(0, 0, 0, 0);

          const filteredAppointments = data.appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.appointmentDate).setHours(0, 0, 0, 0);
            return appointmentDate === today;
          });

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

  const handleCompleteClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPopup(true);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter((file) => file.type === 'application/pdf');
    if (pdfFiles.length > 0) {
      setFiles(pdfFiles);
    } else {
      alert('Only PDF files are allowed!');
    }
  };

  const handlePrescriptionChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionBase64(reader.result.split(',')[1]); // Set Base64 string (excluding data URL prefix)
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a PDF for the prescription.');
    }
  };

  const handleSubmitPrescription = async () => {
    if (!selectedAppointment || !prescriptionBase64) return;

    // Log the details before sending them to the API
    console.log("Appointment ID:", selectedAppointment._id);
    console.log("Prescription (Base64):", prescriptionBase64);
    console.log("Doctor Notes:", doctorNotes);
    
    files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, file.name); // Log the uploaded file names
    });

    try {
      const formData = new FormData();
      formData.append('appointmentId', selectedAppointment._id);
      formData.append('prescription', prescriptionBase64); // Send the Base64 string
      formData.append('doctorNotes', doctorNotes);

      // Append multiple files for reports
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch(`${API_URL}/api/book/appointments/complete`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Appointment marked as completed!');
        setAppointments(appointments.filter(app => app._id !== selectedAppointment._id));
        setShowPopup(false);
      } else {
        alert('Failed to complete appointment.');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
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
                  {appointments.map((appointment) => {
                    const appointmentTime = new Date(appointment.appointmentDate);
                    const currentTime = new Date();
                    const isPastAppointment = currentTime >= appointmentTime;

                    return (
                      <li key={appointment._id} className="appointment-card">
                        <div className="appointment-details">
                          <p><strong>Patient:</strong> {appointment.patientName}</p>
                          <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
                          <p><strong>Date:</strong> {appointmentTime.toDateString()}</p>
                          <p><strong>Time:</strong> {appointmentTime.toLocaleTimeString()}</p>
                        </div>

                        {isPastAppointment && (
                          <button className="btn complete-btn" onClick={() => handleCompleteClick(appointment)}>
                            Complete
                          </button>
                        )}
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

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Complete Appointment</h3>

            {/* Prescription PDF input */}
            <label>Prescription (PDF only):</label>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handlePrescriptionChange} 
            />

            <label>Explain the Condition and Diagnosis Applied:</label>
            <textarea 
              value={doctorNotes} 
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Enter any additional notes"
            ></textarea>

            <label>Reports (PDFs only):</label>
            <input 
              type="file" 
              accept="application/pdf" 
              multiple 
              onChange={handleFileChange} 
            />

            <div className="popup-buttons">
              <button 
                className="btn submit-btn" 
                onClick={handleSubmitPrescription} 
                style={{
                  backgroundColor: '#4CAF50',  // Green color
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  borderRadius: '5px',
                }}
              >
                Mark As Completed
              </button>
              <button className="btn cancel-btn" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorHomePage;
