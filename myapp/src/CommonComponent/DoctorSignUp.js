import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorSignUp.css";

const DoctorSignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    gender: "Male",
    mob: "",
    DOB: "",
    role: "Patient",
    password: "",
    cnfpassword: "",
    email: "",
  });

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Unable to retrieve your location");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const sendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/sendotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await response.json();
      if (result.success) {
        setOtpSent(true);
        alert("OTP sent to your email. Please verify.");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong while sending OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/verifyotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setOtpVerified(true);
        setOtpError("");
        alert("OTP verified successfully! You can now sign up.");
      } else {
        setOtpVerified(false);
        setOtpError(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong while verifying OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.firstname) newErrors.firstname = "First name is required";
    if (!formData.lastname) newErrors.lastname = "Last name is required";
    if (!formData.mob || formData.mob.length !== 10) newErrors.mob = "Mobile number must be 10 digits";
    if (!formData.DOB) newErrors.DOB = "Date of birth is required";
    if (formData.password !== formData.cnfpassword) newErrors.password = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      alert("Please fix the errors before submitting.");
      return;
    }

    const userData = {
      ...formData,
      role: "Doctor",
      date: new Date().toISOString(),
      latitude: latitude,
      longitude: longitude,
    };

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/createuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (result.success) {
        alert("Account created successfully!");
        navigate("/login");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong during sign-up!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-form-container">
      <h2>Create Your Account Doctor</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          name="mob"
          placeholder="Mobile Number"
          value={formData.mob}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="DOB"
          placeholder="Date of Birth"
          value={formData.DOB}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {!otpSent && (
          <button type="button" onClick={sendOtp} disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        )}
        {otpSent && !otpVerified && (
          <>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              required
            />
            {otpError && <p className="error">{otpError}</p>}
            <button type="button" onClick={verifyOtp} disabled={isLoading}>
              {isLoading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </>
        )}
        {otpVerified && (
          <>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="cnfpassword"
              placeholder="Confirm Password"
              value={formData.cnfpassword}
              onChange={handleChange}
              required
            />
            <button type="submit">
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </>
        )}
      </form>
      <p className="login-link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default DoctorSignupPage;
