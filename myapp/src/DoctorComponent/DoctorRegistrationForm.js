import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorRegistrationForm.css";

const steps = [
  { key: "specialization", label: "Enter your Specialization", type: "text" },
  { key: "licenseNumber", label: "Enter your License Number", type: "text" },
  { key: "hospital", label: "Enter your Hospital Name", type: "text" },
  { key: "yearsOfExperience", label: "Enter your Years of Experience", type: "number" },
];

function DoctorRegistrationForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
  
        console.log("Stored Auth Token:", token);
  
        const response = await fetch("http://localhost:5000/api/auth/getuserdetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ authtoken: token }), // Send token in the request body
        });
  
        const data = await response.json();
  
        if (data.success) {
          setEmail(data.data.email);
          localStorage.setItem("email", data.data.email); // Store email in local storage
          console.log("Email stored in local storage:", data.data.email);
          
          checkDoctorStatus(data.data.email);
        } else {
          console.error("Error fetching user details:", data.message);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
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
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success && data.message === false) {
        // If the account is being verified, show the verification message
        navigate("/waitpage");
      } else if (data.success && data.message === true) {
        // If both are true, navigate to the dashboard
        navigate("/doctorhomepage");
      } else {
        // If the success is false, show the form
        setStep(0); // Reset the step to show the form
      }
    } catch (error) {
      console.error("Error checking doctor status:", error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      submitForm();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [steps[step].key]: e.target.value });
  };

  const handleAddAvailability = () => {
    if (day && time) {
      setAvailability([...availability, { day, time }]);
      setDay("");
      setTime("");
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const submitForm = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/doc/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ...formData,
          availability,
          profilePicture,
        }),
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

          {/* Step-based Input Fields */}
          <input
            type={steps[step].type}
            placeholder={steps[step].label}
            value={formData[steps[step].key] || ""}
            onChange={handleChange}
            className="doctor-registration-input"
          />

          {/* Availability Input */}
          {step === steps.length - 1 && (
            <div className="availability-section">
              <h3>Enter Availability</h3>
              <input
                type="text"
                placeholder="Day (e.g., Monday)"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
              <input
                type="text"
                placeholder="Time (e.g., 9:00 AM - 5:00 PM)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <button type="button" onClick={handleAddAvailability}>
                Add Availability
              </button>

              <ul>
                {availability.map((slot, index) => (
                  <li key={index}>{`${slot.day}: ${slot.time}`}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Profile Picture Upload */}
          {step === steps.length - 1 && (
            <div className="profile-picture-section">
              <h3>Upload Profile Picture</h3>
              <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
              {profilePicture && <img src={profilePicture} alt="Profile Preview" width="100" />}
            </div>
          )}

          <button onClick={handleNext} className="doctor-registration-button">
            {step === steps.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegistrationForm;
