import React, { useState, useEffect } from 'react';
import './DoctorHomePage.css';
import DoctorNavbar from './DoctorNavbar';
import API_URL from '../config';

const DoctorHomePage = () => {
  const [appointments, setAppointments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionBase64, setPrescriptionBase64] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [files, setFiles] = useState([]); // Stores multiple PDF files

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
          console.log("Fetched Appointments:", data);
          const today = new Date().setHours(0, 0, 0, 0);

          const filteredAppointments = data.appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.appointmentDate).setHours(0, 0, 0, 0);
            return (
              appointmentDate === today &&
              appointment.status !== 'PCancelled' &&
              appointment.status !== 'DCancelled'
            );
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
        setPrescriptionBase64(reader.result.split(',')[1]); // Set Base64 string
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a PDF for the prescription.');
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Extract Base64
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitPrescription = async () => {
    if (!selectedAppointment || !prescriptionBase64 || files.length === 0) {
      alert("Please upload both prescription and report.");
      return;
    }

    try {
      const reportBase64 = await fileToBase64(files[0]); // Convert first report file to Base64

      const payload = {
        appointmentId: selectedAppointment.appointmentId,
        patientEmail: selectedAppointment.patientEmail,
        prescription: prescriptionBase64,
        report: reportBase64, 
        notes: doctorNotes,
      };

      console.log("Submitting Payload:", payload);

      const response = await fetch(`${API_URL}/api/phis/addhistory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Appointment marked as completed!");
        setAppointments(appointments.filter(app => app._id !== selectedAppointment._id));
        setShowPopup(false);
      } else {
        alert("Failed to complete appointment.");
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
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

            <label>Prescription (PDF only):</label>
            <input type="file" accept="application/pdf" onChange={handlePrescriptionChange} />

            <label>Explain the Condition and Diagnosis:</label>
            <textarea 
              value={doctorNotes} 
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Enter additional notes"
            ></textarea>

            <label>Reports (PDFs only):</label>
            <input type="file" accept="application/pdf" multiple onChange={handleFileChange} />

            <div className="popup-buttons">
              <button 
                className="btn submit-btn" 
                onClick={handleSubmitPrescription} 
                style={{
                  backgroundColor: '#4CAF50',
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
