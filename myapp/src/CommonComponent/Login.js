import React, { useState } from "react";
import API_URL from "../config";
import { useNavigate } from "react-router-dom";
import './Login.css';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchUserEmail = async (authToken) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/getuserdetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authtoken: authToken }),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem("email", result.data.email);
        console.log("Email stored in localStorage:", result.data.email);
      } else {
        console.error("Failed to fetch user details:", result.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();
      console.log(result);
      if (result.success) {
        localStorage.setItem("authToken", result.authtoken);

        // Fetch and store user email
        await fetchUserEmail(result.authtoken);

        // Navigate based on the role
        const userRole = result.role;
        if (userRole === "Admin") {
          navigate("/adminhomepage");
        } else if (userRole === "Doctor") {
          navigate("/docregister");
        } else if (userRole === "Patient") {
          navigate("/patienthomepage");
        } else {
          alert("Role not recognized!");
        }
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={loginData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={loginData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p className="signup-link">
        Don't have an account? <a href="/signup">Sign Up</a>
      </p>
    </div>
  );
};

export default LoginPage;
