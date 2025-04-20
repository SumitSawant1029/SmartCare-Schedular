import React, { useState, useEffect, useRef } from "react";
import "./Heart.css"; // Reuse same styles or create Brain.css
import PatientNavbar from "../PatientNavbar";
import { Link } from "react-router-dom";

const questions = [
    {
      key: "age",
      text: "What is your age? (Must be 20 - 120)",
      validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 0 && val <= 120,
    },
    {
      key: "avg_glucose_level",
      text: "What is your average glucose level? (Must be between 50-300",
      validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 50 && val <= 300,
    },
    {
      key: "bmi",
      text: "What is your BMI? (Must be between 10-100)",
      validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 10 && val <= 100,
    },
    {
      key: "gender_Male",
      text: "Are you male? (0 or 1)",
      validate: (val) => /^[0-1]$/.test(val),
    },
    {
      key: "hypertension_1",
      text: "Do you have hypertension?( 0 or 1)",
      validate: (val) => /^[0-1]$/.test(val),
    },
    {
      key: "heart_disease_1",
      text: "Do you have heart disease? (0 or 1)",
      validate: (val) => /^[0-1]$/.test(val),
    },
    {
      key: "smoking_status_formerly_smoked",
      text: "Did you formerly smoke? (0 or 1)",
      validate: (val) => /^[0-1]$/.test(val),
    },
    {
      key: "smoking_status_never_smoked",
      text: "Have you never smoked? (0 or 1)",
      validate: (val) => /^[0-1]$/.test(val),
    },
    {
      key: "smoking_status_smokes",
      text: "Do you currently smoke? (0 or 1)",
      validate: (val) => /^[0-1]$/.test(val),
    },
  ];

const Brain = () => {
  const [conversation, setConversation] = useState([
    { sender: "bot", text: "🧠 Hi! I'm your Brain Stroke Risk Checker. " + questions[0].text },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [collectedData, setCollectedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState("");
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
        { sender: "bot", text: `❌ Invalid input! Please try again. ${currentQuestion.text}` },
      ]);
      setInputValue("");
      return;
    }

    // Round value before storing
    let roundedValue = inputValue.includes(".")
      ? parseFloat(inputValue).toFixed(1)
      : parseInt(inputValue);
    const updatedData = { ...collectedData, [currentQuestion.key]: Number(roundedValue) };

    setConversation((prev) => [...prev, { sender: "user", text: inputValue }]);
    setCollectedData(updatedData);
    setInputValue("");

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setConversation((prev) => [...prev, { sender: "bot", text: questions[nextIndex].text }]);
    } else {
      // All questions answered
      setLoading(true);
      setConversation((prev) => [...prev, { sender: "bot", text: "🤖 Analyzing your data..." }]);

      try {
        const response = await fetch("http://localhost:8000/predict_brain_stroke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });

        const result = await response.json();
        setPredictionResult(result.prediction);

        setConversation((prev) => [
          ...prev,
          { sender: "bot", text: result.prediction },
        ]);
      } catch (error) {
        console.error("Prediction error:", error);
        setConversation((prev) => [
          ...prev,
          { sender: "bot", text: "❌ Oops, something went wrong while predicting!" },
        ]);
      }

      setLoading(false);
    }
  };

  return (
    <>
      <PatientNavbar />
      <div className="chatbot-container">
        <h2>Brain Stroke Risk Checker</h2>
        <div className="chat-window" ref={chatRef}>
          {conversation.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
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

export default Brain;
