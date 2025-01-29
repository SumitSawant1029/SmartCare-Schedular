import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate is used for navigation in React Router v6+

import "./DoctorRegistrationForm.css"; // Make sure the CSS file is in the same folder

const steps = [
  { key: "specialization", label: "Enter your Specialization", type: "text" },
  { key: "licenseNumber", label: "Enter your License Number", type: "text" },
  { key: "hospital", label: "Enter your Hospital Name", type: "text" },
  { key: "yearsOfExperience", label: "Enter your Years of Experience", type: "number" },
  { key: "availability", label: "Enter your Availability (e.g., Mon-Fri 9AM-5PM)", type: "text" },
];

function DoctorRegistrationForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Using useNavigate instead of useHistory

  // Fetch user details and check doctor status
  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const response = await fetch("http://localhost:5000/auth/api/getuserdetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("authToken"),
          },
        });

        const data = await response.json();
        if (data.success) {
          setEmail(data.data.email);
          checkDoctorStatus(data.data.email);
        } else {
          console.error("Error fetching user details");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchUserDetails();
  }, []); // No need to add checkDoctorStatus to dependencies, it's inside the useEffect

  // Check if doctor exists and is approved
  const checkDoctorStatus = async (email) => {
    try {
      const response = await fetch("http://localhost:5000/doctor/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        navigate("/doctor/dashboard"); // Use navigate instead of history.push
      }
    } catch (error) {
      console.error("Error checking doctor status:", error);
      setLoading(false);
    }
  };

  // Handle form submission
  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await submitForm();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [steps[step].key]: e.target.value });
  };

  const submitForm = async () => {
    try {
      const response = await fetch("http://localhost:5000/doctor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...formData }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Your details have been submitted. Await admin approval.");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="doctor-registration-container">
      <div className="doctor-registration-card">
        <div className="doctor-registration-content">
          <h2 className="doctor-registration-title">Doctor Registration</h2>
          <input
            type={steps[step].type}
            placeholder={steps[step].label}
            value={formData[steps[step].key] || ""}
            onChange={handleChange}
            className="doctor-registration-input"
          />
          <button
            onClick={handleNext}
            className="doctor-registration-button"
          >
            {step === steps.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegistrationForm;
