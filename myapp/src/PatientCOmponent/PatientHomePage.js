import React, { useState } from 'react';
import './PatientHomePage.css';
import PatientNavbar from './PatientNavbar';
import decisionTree from '../Asset/decisionTree.json';
import lung from "../Asset/LungDisease_PatientHomePage.jpg";
import brain from "../Asset/BrainDisease_PatientHomePage.jpg";
import cancer from "../Asset/CancerDisease_PatientHomePage.jpg";
import heart from "../Asset/HeartDisease_PatientHomePage.jpg";
import stroke from "../Asset/Stroke_PatientHomePage.jpg";
import diabetes from "../Asset/Daibetes_PatientHomePage.jpg";

const diseaseDecisionTrees = {
  Lung: decisionTree.lung,
  Brain: decisionTree.brain,
  Cancer: decisionTree.cancer,
  Heart: decisionTree.heart,
  Stroke: decisionTree.stroke,
  Diabetes: decisionTree.diabetes,
};

const PatientHomePage = () => {
  const [isQAActive, setIsQAActive] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [recommendedSpecialist, setRecommendedSpecialist] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);

  const startSymptomChecker = (disease) => {
    setIsQAActive(true);
    setCurrentNode(diseaseDecisionTrees[disease]);
    setRecommendedSpecialist(null);
    setSelectedDisease(disease);
  };

  const handleAnswer = (answer) => {
    if (currentNode && currentNode[answer.toLowerCase()]) {
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
    <>
      <PatientNavbar />
      <div className="patient-dashboard">
        <main className="main-content">
          <section className="disease-cards-container">
            <h2>Select a Category</h2>
            <div className="disease-cards">
              {[{ name: "Lung", img: lung, desc: "Respiratory issues like asthma, bronchitis, and COPD." },
                { name: "Brain", img: brain, desc: "Neurological conditions such as migraines and epilepsy." },
                { name: "Cancer", img: cancer, desc: "Oncology specialists for early detection and treatment." },
                { name: "Heart", img: heart, desc: "Cardiac diseases like heart attacks, hypertension, and heart failure." },
                { name: "Stroke", img: stroke, desc: "Brain blood flow disruption causing paralysis and speech loss." },
                { name: "Diabetes", img: diabetes, desc: "Chronic high blood sugar levels leading to multiple health issues." }
              ].map((disease, index) => (
                <div key={index} className="disease-card" onClick={() => startSymptomChecker(disease.name)}>
                  <img src={disease.img} alt={`${disease.name} Disease`} />
                  <h3>{disease.name} Disease</h3>
                  <p>{disease.desc}</p>
                  <button className="btn btn-primary">Check Symptoms</button>
                </div>
              ))}
            </div>
          </section>

          {isQAActive && currentNode && (
            <section className="disease-prediction-section card">
              <h2>Symptom Checker - {selectedDisease} Disease</h2>
              <div className="question-container">
                <h3>{currentNode.question}</h3>
                <div className="options">
                  <button onClick={() => handleAnswer('yes')} className="btn btn-success">Yes</button>
                  <button onClick={() => handleAnswer('no')} className="btn btn-danger">No</button>
                </div>
              </div>
            </section>
          )}

          {recommendedSpecialist && (
            <section className="result-container">
              <h3>Recommended Specialist</h3>
              <p>{recommendedSpecialist}</p>
            </section>
          )}
        </main>
        <footer>
          <p>Smart Care Scheduler © 2025</p>
        </footer>
      </div>
    </>
  );
};

export default PatientHomePage;
