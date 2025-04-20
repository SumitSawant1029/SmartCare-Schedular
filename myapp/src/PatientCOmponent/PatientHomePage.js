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

import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleCardClick = (disease) => {
    if (disease === "Diabetes") {
      navigate('/Diabetes');
    }else if(disease === "Heart"){
      navigate('/Heart');
    } else if(disease === "Brain"){
      navigate('/Brain');
    }else if(disease === "Liver"){
      navigate('/Liver');
    }else {
      setIsQAActive(true);
      setCurrentNode(diseaseDecisionTrees[disease]);
      setRecommendedSpecialist(null);
      setSelectedDisease(disease);
    }
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
            <div className="disease-cards">
            {[
   { 
    name: "Liver", 
    img: cancer, 
    desc: "Liver diseases can have a wide range of symptoms, and many of these symptoms may appear gradually over time. Early signs might include unexplained fatigue, which can make even basic activities feel exhausting. You may notice yellowing of the skin and the whites of your eyes, known as jaundice, as well as dark-colored urine and pale-colored stool. Abdominal discomfort or swelling, especially in the upper right side of the abdomen, is another common sign. People with liver issues may also experience nausea, loss of appetite, and unintentional weight loss. In more severe cases, symptoms like easy bruising, bleeding gums, and confusion can occur. These signs suggest liver dysfunction, and if left untreated, liver disease can progress to cirrhosis or liver cancer. It is crucial to seek medical advice as soon as any of these symptoms arise to prevent long-term damage." 
  },
   
   { 
    name: "Brain", 
    img: brain, 
    desc: "Brain diseases can present with a variety of symptoms, many of which are often subtle at first. Some of the most common signs include frequent and severe headaches, dizziness, or lightheadedness, which may also be accompanied by a feeling of imbalance or unsteadiness. You may also experience memory problems, confusion, or difficulty concentrating. In more advanced cases, these issues might escalate to include difficulty speaking, understanding language, or even paralysis in part of the body. Seizures, loss of coordination, and changes in behavior or mood, such as depression or irritability, can also be indicative of a neurological condition. Conditions like epilepsy, migraines, or neurodegenerative diseases can develop gradually, so it’s important to pay attention to any cognitive or physical changes that interfere with daily life, especially if they worsen over time." 
  },
  
  
  { 
    name: "Lung", 
    img: lung, 
    desc: "Lung-related diseases can manifest in a variety of ways. Early symptoms may include shortness of breath, persistent coughing (especially with mucus or blood), wheezing, or chest tightness. People with lung issues often feel fatigued easily and may experience reduced exercise capacity. Chronic lung conditions like asthma, bronchitis, or COPD can also cause frequent respiratory infections, chest pain, and a feeling of constriction in the chest. In more severe cases, you might experience swelling in your ankles or legs due to fluid retention. If you notice a prolonged cough that doesn’t improve, or if you find yourself gasping for air during simple activities like walking or climbing stairs, it's important to consult with a healthcare provider to determine the underlying cause and receive appropriate treatment." 
  },
 
  { 
    name: "Heart", 
    img: heart, 
    desc: "Heart diseases often present with symptoms that range from mild discomfort to severe, life-threatening events. Early signs can include chest pain or discomfort, which may feel like tightness, pressure, or a squeezing sensation. Shortness of breath, particularly with physical activity or even at rest, is another common symptom of heart problems. If you feel your heart pounding or beating irregularly, or if you experience dizziness, lightheadedness, or fainting, these may indicate an issue with the heart’s rhythm or function. Swelling in your legs, ankles, or abdomen, as well as fatigue that makes daily tasks difficult, are other potential signs of heart failure or cardiovascular disease. High blood pressure, heart attacks, and heart failure are just a few conditions that can cause these symptoms, and early detection is critical for effective treatment and preventing more serious complications." 
  },
  { 
    name: "Diabetes", 
    img: diabetes, 
    desc: "Diabetes is a chronic condition characterized by high blood sugar levels, which can lead to a variety of symptoms that affect multiple parts of the body. The most common symptoms of diabetes include frequent urination, excessive thirst that doesn’t go away, and blurry vision. People with diabetes often feel tired or weak, even after getting plenty of rest, and may experience unexplained weight loss despite an increased appetite. Other signs include slow-healing sores or cuts, frequent infections, and tingling or numbness in the hands or feet, which can be early signs of nerve damage. Over time, poorly managed blood sugar levels can lead to complications like heart disease, kidney failure, or vision loss. If you notice any of these symptoms, it’s important to get tested for diabetes and follow a proper treatment plan to manage the condition and prevent further complications." 
  }
].map((disease, index) => (
  <div key={index} className="disease-card" onClick={() => handleCardClick(disease.name)}>
    <div className={`card-inner ${index % 2 === 0 ? '' : 'reverse'}`}>
      <div className="image-container">
        <img src={disease.img} alt={`${disease.name} Disease`} />
      </div>
      <div className="card-content">
        <h3>{disease.name} Disease</h3>
        <p>{disease.desc}</p>
        <button className="btn btn-primary">Check Symptoms</button>
      </div>
    </div>
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

