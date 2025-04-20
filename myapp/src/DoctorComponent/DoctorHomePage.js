import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorHomePage.css';
import DoctorNavbar from './DoctorNavbar';
import API_URL from '../config';
import { FaFilePdf, FaNotesMedical, FaUserInjured, FaCalendarAlt, FaClock, FaStethoscope } from 'react-icons/fa';

const DoctorHomePage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [report, setReport] = useState(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const doctorEmail = localStorage.getItem('email');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
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
            return (
              appointmentDate === today &&
              appointment.status !== 'PCancelled' &&
              appointment.status !== 'DCancelled' &&
              appointment.status !== 'Completed'
            );
          });
          setAppointments(filteredAppointments);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorEmail]);

  const handleViewAllRecords = (email) => {
    navigate(`/patient-records/${email}`);
  };

  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleSubmit = async () => {
    if (!prescription || !report || !notes) {
      alert('All fields are required!');
      return;
    }

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

      if (response.ok) {
        alert('Patient history added successfully!');
        setSelectedAppointment(null);
        setPrescription(null);
        setReport(null);
        setNotes('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <DoctorNavbar />
      <div className="doctor-dashboard">
        <main className="doctor-main-content">
          <section className="appointments-section">
            <div className="section-header">
              <h2><FaCalendarAlt /> Today's Appointments</h2>
              <p className="appointment-count">{appointments.length} appointment(s)</p>
            </div>
            
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading appointments...</p>
              </div>
            ) : appointments.length > 0 ? (
              <div className="appointments-grid">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="card-header">
                      <h3><FaUserInjured /> {appointment.patientName}</h3>
                      <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="appointment-detail">
                        <FaStethoscope className="detail-icon" />
                        <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
                      </div>
                      <div className="appointment-detail">
                        <FaClock className="detail-icon" />
                        <p>{new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button 
                        className="btn records-btn"
                        onClick={() => handleViewAllRecords(appointment.patientEmail)}
                      >
                        View Records
                      </button>
                      <button 
                        className="btn complete-btn"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        Complete Visit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-appointments">
                <img src="/images/no-appointments.svg" alt="No appointments" />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </section>
        </main>

        {selectedAppointment && (
          <div className="modal-overlay">
            <div className="completion-modal">
              <div className="modal-header">
                <h3>Complete Appointment</h3>
                <button 
                  className="close-modal"
                  onClick={() => setSelectedAppointment(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    <FaFilePdf /> Prescription (PDF only)
                  </label>
                  <div className="file-upload">
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={(e) => handleFileChange(e, setPrescription)} 
                    />
                    <span>{prescription ? 'File selected' : 'Choose file'}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <FaFilePdf /> Medical Report (PDF only)
                  </label>
                  <div className="file-upload">
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={(e) => handleFileChange(e, setReport)} 
                    />
                    <span>{report ? 'File selected' : 'Choose file'}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <FaNotesMedical /> Doctor's Notes
                  </label>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter your clinical notes here..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn cancel-btn"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn submit-btn"
                  onClick={handleSubmit}
                >
                  Submit & Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorHomePage;