import React, { useState, useEffect } from 'react';
import './PatientHomePage.css';

const PatientHomePage = () => {
  const [appointments, setAppointments] = useState([]);
  const [isQAActive, setIsQAActive] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [predictedDisease, setPredictedDisease] = useState(null);
  const [recommendedSpecialist, setRecommendedSpecialist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const questions = [
    {
      id: 1,
      question: 'Do you have a fever?',
      options: ['Yes', 'No'],
    },
    {
      id: 2,
      question: 'Do you have a cough?',
      options: ['Yes', 'No'],
    },
    {
      id: 3,
      question: 'Do you feel fatigued?',
      options: ['Yes', 'No'],
    },
    {
      id: 4,
      question: 'Do you have a headache?',
      options: ['Yes', 'No'],
    },
    // Add more questions as needed
  ];

  useEffect(() => {
    // Simulate fetching patient appointments from the API
    const fetchAppointments = () => {
      const patientAppointments = [
        { id: 1, doctorName: 'Dr. Smith', time: '10:30 AM', status: 'Confirmed' },
        { id: 2, doctorName: 'Dr. Jane', time: '2:00 PM', status: 'Pending' },
      ];
      setAppointments(patientAppointments);
    };

    fetchAppointments();
  }, []);

  const handleAnswer = (answer) => {
    setAnswers([...answers, answer]);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      handleFinishQA();
    }
  };

  const handleStartQA = () => {
    setIsQAActive(true);
  };

  const handleFinishQA = () => {
    setIsQAActive(false);
    setIsLoading(true);
    // Simulate disease prediction based on answers
    setTimeout(() => {
      const disease = getDiseasePrediction(answers);
      setPredictedDisease(disease);
      setRecommendedSpecialist(getSpecialistRecommendation(disease));
      setIsLoading(false);
    }, 2000);
  };

  const getDiseasePrediction = (answers) => {
    // Logic to predict disease based on answers
    if (answers.includes('Yes') && answers.length === 4) {
      return 'Flu'; // For simplicity, just predicting "Flu" if any "Yes" answer exists
    }
    return 'Cold'; // Default prediction
  };

  const getSpecialistRecommendation = (disease) => {
    if (disease === 'Flu') {
      return 'General Physician';
    } else if (disease === 'Cold') {
      return 'ENT Specialist';
    }
    return 'Unknown Specialist';
  };

  return (
    <div className="patient-dashboard">
      <header className="patient-header">
        <h1>Welcome, [Patient Name]</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/appointments">My Appointments</a>
          <a href="/profile">Profile</a>
          <a href="/logout">Logout</a>
        </nav>
      </header>

      <main className="qa-main">
        <section className="patient-disease-prediction">
          {!isQAActive ? (
            <button className="start-qa-btn" onClick={handleStartQA}>
              Start Disease Prediction
            </button>
          ) : (
            <div className="qa-section">
              {questionIndex < questions.length ? (
                <div className="question-card">
                  <h3>{questions[questionIndex]?.question}</h3>
                  <div className="options">
                    {questions[questionIndex]?.options.map((option) => (
                      <button
                        key={option}
                        className="option-btn"
                        onClick={() => handleAnswer(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="finish-card">
                  <h3>Finish and Predict Disease</h3>
                  <button className="finish-btn" onClick={handleFinishQA}>
                    Get Prediction
                  </button>
                </div>
              )}
            </div>
          )}

          {isLoading && <p className="loading-text">Loading your results...</p>}

          {predictedDisease && (
            <div className="prediction-result">
              <h3>Predicted Disease: {predictedDisease}</h3>
              <p><strong>Recommended Specialist:</strong> {recommendedSpecialist}</p>
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
