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

  const [cnfpassword, setCnfPassword] = useState(""); // State for confirm password
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // State for button disable/enable
  const [errors, setErrors] = useState({}); // State for validation errors

  const navigate = useNavigate();

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "email":
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          newErrors.email = "Invalid email format";
        } else {
          delete newErrors.email;
        }
        break;

      case "mob":
        if (!/^\d{10}$/.test(value)) {
          newErrors.mob = "Mobile number must be 10 digits";
        } else {
          delete newErrors.mob;
        }
        break;

      case "password":
        if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cnfpassword") {
      setCnfPassword(value);
      setIsButtonDisabled(value !== signUpData.password); // Enable button only if passwords match
    } else {
      setSignUpData({
        ...signUpData,
        [name]: value,
      });

      validateField(name, value); // Validate the field on change

      if (name === "password") {
        setIsButtonDisabled(value !== cnfpassword); // Update button state when password changes
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for any remaining validation errors
    if (Object.keys(errors).length > 0) {
      alert("Please fix the errors before submitting.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });

      const result = await response.json();
      if (result.success) {
        alert("Account created successfully!");
        navigate("/login"); // Redirect to login page after successful sign-up
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
        {errors.mob && <p className="error">{errors.mob}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={signUpData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={signUpData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}
        <input
          type="password"
          name="cnfpassword"
          placeholder="Confirm Password"
          value={cnfpassword}
          onChange={handleChange}
          required
        />
        {cnfpassword && cnfpassword !== signUpData.password && (
          <p className="error">Passwords do not match</p>
        )}
        <input
          type="date"
          name="DOB"
          value={signUpData.DOB}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isButtonDisabled}>
          Sign Up
        </button>
      </form>
      <p className="login-link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default SignUpPage;
