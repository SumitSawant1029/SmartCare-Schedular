import React, { useState, useEffect } from 'react';
import './PatientHomePage.css';
import PatientNavbar from './PatientNavbar';
import decisionTree from '../Asset/decisionTree.json';

const PatientHomePage = () => {
  const [isQAActive, setIsQAActive] = useState(false);
  const [currentNode, setCurrentNode] = useState(decisionTree);
  const [recommendedSpecialist, setRecommendedSpecialist] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null); // Track which appointment is being canceled
  const patientEmail = localStorage.getItem('email');

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/book/appointments/patient', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ patientEmail: patientEmail }),
        });

        const data = await response.json();
        console.log(data);
        if (data.appointments) {
          setAppointments(data.appointments);
        } else {
          console.error('Failed to fetch appointments');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  // Handle user's answer in the decision tree
  const handleAnswer = (answer) => {
    if (currentNode[answer.toLowerCase()]) {
      const nextNode = currentNode[answer.toLowerCase()];
      if (nextNode.specialization) {
        setRecommendedSpecialist(nextNode.specialization);
        setIsQAActive(false);
      } else {
        setCurrentNode(nextNode);
      }
    }
  };

  // Handle cancel appointment logic
  const cancelAppointment = (appointmentId) => {
    setAppointmentToCancel(appointmentId); // Set the appointment to cancel
    setShowCancelModal(true); // Show the confirmation modal
  };

  // Confirm the cancelation of the appointment
  const confirmCancel = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/book/appointments/cancel/${appointmentToCancel}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Successfully canceled, update the state
        setAppointments(appointments.filter((appointment) => appointment._id !== appointmentToCancel));
        setShowCancelModal(false); // Close the modal
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      alert('Error canceling appointment');
    }
  };

  // Cancel and close modal
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(null);
  };

  // Function to format the date and time correctly (in UTC format)
  const formatAppointmentDate = (appointmentDate) => {
    const dateObj = new Date(appointmentDate);

    // Extract date in YYYY-MM-DD format (UTC)
    const date = dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1).toString().padStart(2, '0') + '-' + dateObj.getUTCDate().toString().padStart(2, '0');

    // Extract time in HH:MM format (UTC)
    const time = dateObj.getUTCHours().toString().padStart(2, '0') + ':' + dateObj.getUTCMinutes().toString().padStart(2, '0');

    return {
      date,
      time,
    };
  };

  return (
    <div className="patient-dashboard">
      <PatientNavbar />
      <main className="main-content">
        <section className="appointments-section card">
          <h2>Your Appointments</h2>
          <ul>
            {appointments.length === 0 ? (
              <li>No appointments scheduled</li>
            ) : (
              appointments.map((appointment) => {
                const { date, time } = formatAppointmentDate(appointment.appointmentDate);

                return (
                  <li key={appointment._id}>
                    <strong>Doctor:  </strong> Dr. {appointment.doctorName}<br />
                    <strong>Date:</strong> {date}<br /> {/* Displaying the date */}
                    <strong>Time:</strong> {time}<br /> {/* Displaying the time */}
                    <strong>Symptoms:</strong> {appointment.symptoms}<br />
                    <strong>Status:</strong> {appointment.status}<br />
                    <button
                      className="btn btn-danger cancel-btn"
                      onClick={() => cancelAppointment(appointment._id)}
                    >
                      Cancel Appointment
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        {/* Symptom Checker Section */}
        <section className="disease-prediction-section card">
          {!isQAActive ? (
            <div className="start-diagnosis">
              <button
                onClick={() => {
                  setIsQAActive(true);
                  setCurrentNode(decisionTree);
                  setRecommendedSpecialist(null);
                }}
                className="btn btn-primary"
              >
                Start Symptom Checker
              </button>
            </div>
          ) : (
            <div className="question-container">
              <h3>{currentNode.question}</h3>
              <div className="options">
                <button onClick={() => handleAnswer('yes')} className="btn btn-success">
                  Yes
                </button>
                <button onClick={() => handleAnswer('no')} className="btn btn-danger">
                  No
                </button>
              </div>
            </div>
          )}

          {recommendedSpecialist && (
            <div className="result-container">
              <h3>Recommended Specialist</h3>
              <p>{recommendedSpecialist}</p>
            </div>
          )}
        </section>
      </main>

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to cancel this appointment?</h3>
            <div className="modal-buttons">
              <button onClick={confirmCancel} className="btn btn-danger">
                Yes, Cancel Appointment
              </button>
              <button onClick={closeCancelModal} className="btn btn-secondary">
                No, Keep Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default PatientHomePage;
