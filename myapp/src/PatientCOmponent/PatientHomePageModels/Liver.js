import React, { useState, useEffect, useRef } from "react";
import "./Heart.css"; // You can create this file or reuse Heart.css
import PatientNavbar from "../PatientNavbar";
import { Link } from 'react-router-dom';

const questions = [
    {
      key: "age",
      text: "What is your age? (Between 4 and 90)",
      validate: (val) => /^\d+$/.test(val) && val >= 4 && val <= 90,
    },
    {
      key: "gender_Male",
      text: "What is your gender? (1: Male, 0: Female)",
      validate: (val) => /^[0-1]$/.test(val),
    },
    {
      key: "total_bilirubin",
      text: "What is your total bilirubin level? (Between 0.4 and 75.0)",
      validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 0.4 && val <= 75.0,
    },
    {
      key: "direct_bilirubin",
      text: "What is your direct bilirubin level? (Between 0.1 and 19.7)",
      validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 0.1 && val <= 19.7,
    },
    {
      key: "alkaline_phosphatase",
      text: "What is your alkaline phosphatase level? (Between 63 and 2110)",
      validate: (val) => /^\d+$/.test(val) && val >= 63 && val <= 2110,
    },
    {
      key: "alamin_aminotransferase",
      text: "What is your alamin aminotransferase level? (Between 10 and 2000)",
      validate: (val) => /^\d+$/.test(val) && val >= 10 && val <= 2000,
    },
    {
      key: "aspartate_aminotransferase",
      text: "What is your aspartate aminotransferase level? (Between 10 and 4929)",
      validate: (val) => /^\d+$/.test(val) && val >= 10 && val <= 4929,
    },
    {
      key: "total_proteins",
      text: "What is your total protein level? (Between 2.7 and 9.6)",
      validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 2.7 && val <= 9.6,
    },
    {
      key: "albumin",
      text: "What is your albumin level? (Between 0.9 and 5.5)",
      validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 0.9 && val <= 5.5,
    },
    {
      key: "albumin_and_globulin_ratio",
      text: "What is your albumin and globulin ratio? (Between 0.3 and 2.8)",
      validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 0.3 && val <= 2.8,
    }
  ];
  

const Liver = () => {
  const [conversation, setConversation] = useState([
    { sender: "bot", text: "👋 Hi! I'm your Liver Disease Risk Checker. " + questions[0].text },
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
    const updatedData = { ...collectedData, [currentQuestion.key]: parseFloat(inputValue) };
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
      const response = await fetch("http://localhost:8000/predict_liver", {
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
      setConversation((prev) => [...prev, { sender: "bot", text: "❌ Oops, an error occurred!" }]);
    }

    setLoading(false);
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/doc/specialization/Hepatologist");
      const data = await response.json();

      const approvedDoctors = data.data.filter((doc) => doc.isApproved);
      if (approvedDoctors.length > 0) {
        const sortedDoctors = approvedDoctors.sort((a, b) => b.review - a.review);
        setDoctors(sortedDoctors);
        setConversation((prev) => [
          ...prev,
          { sender: "bot", text: "🩺 I recommend these Hepatologists for you:" },
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
        <h2>Liver Disease Risk Checker</h2>
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
                        to={`/bookappointments?email=${encodeURIComponent(doctor.email)}&name=${encodeURIComponent(doctor.name)}`}
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

export default Liver;
