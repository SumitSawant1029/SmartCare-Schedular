import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorRegistrationForm.css";

const specializations = [
  "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic", "Pediatrician", "Psychiatrist", "Surgeon"
];

const steps = [
  { key: "specialization", label: "Select your Specialization", type: "dropdown" },
  { key: "licenseNumber", label: "Enter your License Number", type: "text" },
  { key: "hospital", label: "Enter your Hospital Name", type: "text" },
  { key: "yearsOfExperience", label: "Enter your Years of Experience", type: "number" },
];

function DoctorRegistrationForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:5000/api/auth/getuserdetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authtoken: token }),
        });

        const data = await response.json();
        if (data.success) {
          setEmail(data.data.email);
          checkDoctorStatus(data.data.email);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    }
    fetchUserDetails();
  }, []);

  const checkDoctorStatus = async (email) => {
    try {
      const response = await fetch("http://localhost:5000/api/doc/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setLoading(false);
      if (data.success && data.message === false) navigate("/waitpage");
      else if (data.success && data.message === true) navigate("/doctorhomepage");
    } catch (error) {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="doctor-registration-container">
      <header className="header">
        <h1>Welcome</h1>
        <nav>
          <button onClick={() => navigate("/")} className="logout-button">Logout</button>
        </nav>
      </header>
      <div className="doctor-registration-card">
        <div className="doctor-registration-content">
          <h2 className="doctor-registration-title">Doctor Registration</h2>
          {submitted ? (
            <p>Successfully Submitted! Your submission is under review. You will shortly receive an email if your submission is valid and approved. Thank you for your patience.</p>
          ) : (
            <>
              {steps[step] && (
                steps[step].type === "dropdown" ? (
                  <select
                    name={steps[step].key}
                    value={formData[steps[step].key] || ""}
                    onChange={handleChange}
                    className="doctor-registration-input"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={steps[step].type}
                    name={steps[step].key}
                    placeholder={steps[step].label}
                    value={formData[steps[step].key] || ""}
                    onChange={handleChange}
                    className="doctor-registration-input"
                  />
                )
              )}
              {step === steps.length && (
                <div className="profile-picture-section">
                  <h3>Upload Profile Picture</h3>
                  <input type="file" accept="image/*" onChange={(e) => setProfilePicture(URL.createObjectURL(e.target.files[0]))} />
                  {profilePicture && <img src={profilePicture} alt="Profile Preview" width="100" />}
                </div>
              )}
              <div className="button-group">
                {step > 0 && <button onClick={handleBack} className="back-button">Back</button>}
                {step < steps.length ? (
                  <button onClick={handleNext} className="next-button">Next</button>
                ) : (
                  <button onClick={handleSubmit} className="submit-button">Submit</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorRegistrationForm;
