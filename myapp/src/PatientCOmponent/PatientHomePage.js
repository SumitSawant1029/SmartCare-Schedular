import React, { useState, useEffect } from 'react';
import API_URL from '../config'; // Adjust the path as needed
import './PatientHomePage.css';
import PatientNavbar from './PatientNavbar';
import decisionTree from '../Asset/decisionTree.json';

const PatientHomePage = () => {
  const [isQAActive, setIsQAActive] = useState(false);
  const [currentNode, setCurrentNode] = useState(decisionTree);
  const [recommendedSpecialist, setRecommendedSpecialist] = useState(null);
  const patientEmail = localStorage.getItem('email');


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

  




  return (
    <div className="patient-dashboard">
      <PatientNavbar />
      <main className="main-content">

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


      <footer>
        <p>Smart Care Scheduler © 2025</p>
      </footer>
    </div>
  );
};

export default PatientHomePage;
