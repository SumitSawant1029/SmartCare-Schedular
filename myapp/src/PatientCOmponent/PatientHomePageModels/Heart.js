import React, { useState, useEffect, useRef } from "react";
import "./Heart.css"; // Make sure to style appropriately like Diabetes.css
import PatientNavbar from "../PatientNavbar";
import { Link } from 'react-router-dom';

const questions = [
  {
    key: "age",
    text: "What is your age? (Between 1 and 120)",
    validate: (val) => /^\d+$/.test(val) && val > 0 && val <= 120,
  },
  {
    key: "chest_pain",
    text: "What is your chest pain type? (0: Typical Angina, 1: Atypical Angina, 2: Non-anginal Pain, 3: Asymptomatic)",
    validate: (val) => /^[0-3]$/.test(val),
  },
  {
    key: "blood_pressure",
    text: "What is your resting blood pressure? (Between 40 and 200 mmHg)",
    validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 40 && val <= 200,
  },
  {
    key: "cholesterol",
    text: "What is your cholesterol level? (Between 100 and 400 mg/dL)",
    validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 100 && val <= 400,
  },
  {
    key: "fasting_blood_sugar",
    text: "Is your fasting blood sugar > 120 mg/dL? (0: No, 1: Yes)",
    validate: (val) => /^[0-1]$/.test(val),
  },
  {
    key: "ecg",
    text: "What is your resting electrocardiographic result? (0: Normal, 1: ST-T wave abnormality, 2: Left ventricular hypertrophy)",
    validate: (val) => /^[0-2]$/.test(val),
  },
  {
    key: "max_heart_rate",
    text: "What is your maximum heart rate achieved? (Between 60 and 220 bpm)",
    validate: (val) => /^\d+$/.test(val) && val >= 60 && val <= 220,
  },
];

const Heart = () => {
  const [conversation, setConversation] = useState([
    { sender: "bot", text: "Hi! I'm your Heart Disease Risk Checker. " + questions[0].text },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [collectedData, setCollectedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [conversation]);

  const handleUserInput = async (e) => {
    e.preventDefault();
    if (!inputValue) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isValid = currentQuestion.validate ? currentQuestion.validate(inputValue) : true;

    if (!isValid) {
      setConversation((prev) => [
        ...prev,
        { sender: "user", text: inputValue },
        { sender: "bot", text: `❌ Invalid input! Please enter a valid response. ${currentQuestion.text}` },
      ]);
      setInputValue("");
      return;
    }

    setConversation((prev) => [...prev, { sender: "user", text: inputValue }]);
    const updatedData = { ...collectedData, [currentQuestion.key]: inputValue };
    setCollectedData(updatedData);
    setInputValue("");

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setConversation((prev) => [...prev, { sender: "bot", text: questions[nextIndex].text }]);
      return;
    }

    // All questions answered
    setLoading(true);
    setConversation((prev) => [...prev, { sender: "bot", text: "🤖 Thinking..." }]);

    try {
      const response = await fetch("http://localhost:8000/predict_heart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      setConversation((prev) => [
        ...prev,
        { sender: "bot", text: result.prediction },
      ]);

      if (result.prediction.toLowerCase().includes("yes")) {
        fetchDoctors();
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setConversation((prev) => [...prev, { sender: "bot", text: "Oops, an error occurred!" }]);
    }

    setLoading(false);
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/doc/specialization/Cardiologist");
      const data = await response.json();

      const approvedDoctors = data.data.filter((doc) => doc.isApproved);
      if (approvedDoctors.length > 0) {
        const sortedDoctors = approvedDoctors.sort((a, b) => b.review - a.review);
        setDoctors(sortedDoctors);
        setConversation((prev) => [
          ...prev,
          { sender: "bot", text: "I recommend these specialists for you:" },
        ]);
      }
    } catch (error) {
      console.error("❌ Error fetching doctors:", error);
    }
  };

  return (
    <>
      <PatientNavbar />
      <div className="chatbot-container">
        <h2>Heart Disease Risk Checker</h2>
        <div className="chat-window" ref={chatRef}>
          {conversation.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}

          {doctors.length > 0 && (
            <div className="message bot">
              <div className="doctor-slider">
                {doctors.map((doctor, index) => (
                  <div key={doctor._id || index} className="doctor-card">
                    <img
                      src={doctor.profilePicture || "https://via.placeholder.com/150"}
                      alt={doctor.email}
                      className="doctor-image"
                    />
                    <div className="doctor-info">
                      <h4>{doctor.name}</h4>
                      <p>🏥 {doctor.hospital}</p>
                      <p>⭐ {doctor.review.toFixed(1)} / 5</p>
                      <p>📅 {doctor.yearsOfExperience} years of experience</p>
                      <Link
                        to={`/bookappointments?email=${encodeURIComponent(
                          doctor.email
                        )}&name=${encodeURIComponent(doctor.name)}`}
                      >
                        <button className="btn btn-primary">Book Appointment</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && <div className="message bot loading">🤖 Thinking...</div>}
        </div>

        {!loading && currentQuestionIndex < questions.length && (
          <form onSubmit={handleUserInput} className="input-form">
            <input
              type="text"
              placeholder="Type your answer..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        )}
      </div>
    </>
  );
};

export default Heart;
