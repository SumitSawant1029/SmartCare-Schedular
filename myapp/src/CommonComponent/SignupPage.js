import React, { useState } from "react";
import API_URL from "../config";
import { useNavigate } from "react-router-dom";
import './SignupPage.css';  // Import the updated CSS

const SignUpPage = () => {
  const [signUpData, setSignUpData] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    mob: "",
    email: "",
    password: "",
    DOB: "",
  
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/auth/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });

      const result = await response.json();
      if (result.success ) {
        alert("Account created successfully!");
        navigate("/login");  // Redirect to login page after successful sign-up
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={signUpData.firstname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={signUpData.lastname}
          onChange={handleChange}
          required
        />
        <select
          name="gender"
          value={signUpData.gender}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          name="mob"
          placeholder="Mobile Number"
          value={signUpData.mob}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={signUpData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={signUpData.password}
          onChange={handleChange}
          required
        />
        <input
          type="cnfpassword"
          name="cnfpassword"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="DOB"
          value={signUpData.DOB}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <p className="login-link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default SignUpPage;
