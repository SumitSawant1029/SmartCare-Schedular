import React, { useState, useEffect, useRef } from "react";
import "./Daibetes.css"; // Ensure this has styles for horizontal scrolling
import PatientNavbar from "../PatientNavbar";
import { Link } from 'react-router-dom';

const questions = [
  {
    key: "Gender",
    text: "What is your gender? (Male/Female)",
    validate: (val) => /^(male|female)$/i.test(val),
  },
  {
    key: "Age",
    text: "What is your age? (Between 1 and 120)",
    validate: (val) => /^\d+$/.test(val) && val > 0 && val <= 120,
  },
  {
    key: "Pregnancies",
    text: "How many pregnancies have you had? (Only for females, 0-20)",
    genderSpecific: "Female",
    validate: (val) => /^\d+$/.test(val) && val >= 0 && val <= 20,
  },
  {
    key: "Glucose",
    text: "What is your glucose level? (Between 50 and 300 mg/dL)",
    validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 50 && val <= 300,
  },
  {
    key: "BloodPressure",
    text: "What is your blood pressure? (Between 40 and 200 mmHg)",
    validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 40 && val <= 200,
  },
  {
    key: "Insulin",
    text: "What is your insulin level? (Between 10 and 900 μU/mL)",
    validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 10 && val <= 900,
  },
  {
    key: "BMI",
    text: "What is your BMI? (Between 10 and 60 kg/m²)",
    validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 10 && val <= 60,
  },
  {
    key: "SkinThickness",
    text: "What is your skin thickness? (Between 5 and 100 mm)",
    validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 5 && val <= 100,
  },
  {
    key: "DPF",
    text: "What is your Diabetes Pedigree Function (DPF)? (Between 0.1 and 2.5)",
    validate: (val) => /^\d+(\.\d+)?$/.test(val) && val >= 0.1 && val <= 2.5,
  },
];

const Diabetes = () => {
  const [conversation, setConversation] = useState([
    { sender: "bot", text: "Hi! I'm your Diabetes Risk Checker. " + questions[0].text },
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

    // Compute next index with skip logic
    let nextIndex = currentQuestionIndex + 1;

    // Skip female-specific questions if gender is male
    if (updatedData.Gender?.toLowerCase() === 'male') {
      while (
        nextIndex < questions.length &&
        questions[nextIndex].genderSpecific === 'Female'
      ) {
        nextIndex++;
      }
    }

    // Skip pregnancies question if age < 18
    if (updatedData.Age !== undefined) {
      const age = parseInt(updatedData.Age, 10);
      if (age < 18) {
        while (
          nextIndex < questions.length &&
          questions[nextIndex].key === 'Pregnancies'
        ) {
          nextIndex++;
        }
      }
    }

    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setConversation((prev) => [...prev, { sender: "bot", text: questions[nextIndex].text }]);
      return;
    }

    // Before sending to predict, ensure pregnancies default for male
    if (updatedData.Gender?.toLowerCase() === 'male' && updatedData.Pregnancies === undefined) {
      updatedData.Pregnancies = '0';
    }

    // All questions answered, call prediction
    setLoading(true);
    setConversation((prev) => [...prev, { sender: "bot", text: "🤖 Thinking..." }]);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      setConversation((prev) => [
        ...prev,
        { sender: "bot", text: result.prediction },
      ]);

      if (result.prediction.toLowerCase().includes("diabetes")) {
        fetchDoctors();
      }
    } catch (error) {
      setConversation((prev) => [...prev, { sender: "bot", text: "Oops, an error occurred!" }]);
    }

    setLoading(false);
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/doc/specialization/Diabetologist");
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
        <h2>Diabetes Risk Checker</h2>
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

export default Diabetes;