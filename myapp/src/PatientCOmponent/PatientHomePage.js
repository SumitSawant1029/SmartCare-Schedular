import React, { useState, useEffect } from 'react';
import './PatientHomePage.css';
import API_BASE_URL from '../config';
import PatientNavbar from './PatientNavbar';

const PatientHomePage = () => {
  const [appointments, setAppointments] = useState([]);
  const [patientDetails, setPatientDetails] = useState(null);
  const [doctors, setDoctors] = useState([]); // State for doctors
  const [isQAActive, setIsQAActive] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [predictedDisease, setPredictedDisease] = useState(null);
  const [recommendedSpecialist, setRecommendedSpecialist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const questions = [
    { id: 1, question: 'Do you have a fever?', options: ['Yes', 'No'] },
    { id: 2, question: 'Do you have a cough?', options: ['Yes', 'No'] },
    { id: 3, question: 'Do you feel fatigued?', options: ['Yes', 'No'] },
    { id: 4, question: 'Do you have a headache?', options: ['Yes', 'No'] },
  ];

  // Fetch patient details
  const fetchPatientDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/getuserdetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authtoken: token }),
      });

      const data = await response.json();
      if (data.success) {
        setPatientDetails(data.data);
      } else {
        setError(data.message || 'Failed to fetch patient details');
      }
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Error fetching patient details');
    }
  };

  // Fetch patient appointments
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/appointments/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Error fetching appointments');
    }
  };

  // Fetch all doctors
  

  

  const handleAnswer = (answer) => {
    setAnswers([...answers, answer]);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      handleFinishQA();
    }
  };

  const handleFinishQA = () => {
    setIsQAActive(false);
    setIsLoading(true);
    setTimeout(() => {
      const disease = getDiseasePrediction(answers);
      setPredictedDisease(disease);
      setRecommendedSpecialist(getSpecialistRecommendation(disease));
      setIsLoading(false);
    }, 2000);
  };

  const getDiseasePrediction = (answers) => {
    if (answers.includes('Yes')) {
      return 'Flu';
    }
    return 'Cold';
  };

  const getSpecialistRecommendation = (disease) => {
    return disease === 'Flu' ? 'General Physician' : 'ENT Specialist';
  };

  return (
    <div className="patient-dashboard">
      <PatientNavbar/>

      <main className="qa-main">
        <section className="patient-appointments">
          <h2>Your Appointments</h2>
          <ul>
            {appointments.map((appt) => (
              <li key={appt.id}>
                {appt.doctorName} at {appt.time} - {appt.status}
              </li>
            ))}
          </ul>
        </section>

       

        <section className="patient-disease-prediction">
          {!isQAActive ? (
            <button onClick={() => setIsQAActive(true)}>Start Disease Prediction</button>
          ) : (
            <div>
              <h3>{questions[questionIndex]?.question}</h3>
              {questions[questionIndex]?.options.map((option) => (
                <button key={option} onClick={() => handleAnswer(option)}>
                  {option}
                </button>
              ))}
            </div>
          )}

          {isLoading && <p>Loading...</p>}

          {predictedDisease && (
            <div>
              <h3>Predicted Disease: {predictedDisease}</h3>
              <p>Recommended Specialist: {recommendedSpecialist}</p>
            </div>
          )}
        </section>

      </main>

      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default PatientHomePage;
