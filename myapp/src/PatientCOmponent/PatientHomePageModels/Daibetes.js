import React, { useState, useEffect, useRef } from "react";
import "./Daibetes.css"; // Ensure this has styles for horizontal scrolling
import PatientNavbar from "../PatientNavbar";
import { Link } from 'react-router-dom';


const questions = [
  { key: "Gender", text: "What is your gender? (Male/Female)", validate: (val) => /^(male|female)$/i.test(val) },
  { key: "Age", text: "What is your age? (Enter a number)", validate: (val) => /^\d+$/.test(val) && val > 0 },
  { key: "Pregnancies", text: "How many pregnancies have you had? (Only for females)", genderSpecific: "Female", validate: (val) => /^\d+$/.test(val) && val >= 0 },
  { key: "Glucose", text: "What is your glucose level? (mg/dL)", validate: (val) => /^\d+(\.\d+)?$/.test(val) && val > 0 },
  { key: "BloodPressure", text: "What is your blood pressure? (mmHg)", validate: (val) => /^\d+(\.\d+)?$/.test(val) && val > 0 },
  { key: "Insulin", text: "What is your insulin level? (μU/mL)", validate: (val) => /^\d+(\.\d+)?$/.test(val) && val > 0 },
  { key: "BMI", text: "What is your BMI? (kg/m²)", validate: (val) => /^\d+(\.\d+)?$/.test(val) && val > 0 },
  { key: "SkinThickness", text: "What is your skin thickness? (mm)", validate: (val) => /^\d+(\.\d+)?$/.test(val) && val > 0 },
  { key: "DPF", text: "What is your Diabetes Pedigree Function (DPF)? (Decimal value)", validate: (val) => /^\d+(\.\d+)?$/.test(val) && val > 0 },
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

    let nextIndex = currentQuestionIndex + 1;
    if (currentQuestion.key === "Gender" && inputValue.toLowerCase() === "male") {
      while (nextIndex < questions.length && questions[nextIndex].key === "Pregnancies") {
        nextIndex++;
      }
    }

    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setConversation((prev) => [...prev, { sender: "bot", text: questions[nextIndex].text }]);
    } else {
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
          { sender: "bot", text: `Here is something for you:`, gif: result.gif_url },
        ]);

        if (result.prediction.toLowerCase().includes("diabetes")) {
          fetchDoctors();
        }
      } catch (error) {
        setConversation((prev) => [...prev, { sender: "bot", text: "Oops, an error occurred!" }]);
      }

      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/doc/specialization/Diabetologist");
      const data = await response.json();
  
      console.log("✅ API Response:", data);
      console.log("✅ Fetched Doctors Before Filtering:", data.data);
  
      const approvedDoctors = data.data.filter((doc) => doc.isApproved);
      console.log("✅ Approved Doctors After Filtering:", approvedDoctors); // Log after filtering
  
      if (approvedDoctors.length > 0) {
        const sortedDoctors = approvedDoctors.sort((a, b) => b.review - a.review);
        console.log("✅ Sorted Doctors:", sortedDoctors); // Log after sorting
        setDoctors(sortedDoctors);
  
        setConversation((prev) => [
          ...prev,
          { sender: "bot", text: "I recommend these specialists for you:" },
        ]);
      } else {
        console.log("⚠️ No approved doctors found after filtering!");
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
              {msg.gif && <img src={msg.gif} alt="Diabetes info" className="chat-gif" />}
            </div>
          ))}

          {/* Horizontal Doctor Slider inside the chat */}
          {doctors.length > 0 && (
  <div className="message bot">
    <p>I recommend these specialists for you:</p>
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
                        <button className="btn btn-primary">
                          Book Appointment
                        </button>
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
