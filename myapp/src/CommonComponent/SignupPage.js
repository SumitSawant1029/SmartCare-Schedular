import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import API_URL from "../config"; // Add your API_URL here for the backend endpoint

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    gender: "Male",
    countryCode: "+91", // Default country code for India
    mob: "",
    DOB: "",
    role: "Patient",
    email: "",
    password: "",
    cnfpassword: "",
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // To toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // To toggle confirm password visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validation function for form fields
  const validateFields = () => {
    const newErrors = {};
    if (!formData.firstname.trim()) newErrors.firstname = "First name is required";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required";
    if (!formData.mob.trim()) newErrors.mob = "Mobile number is required";
    if (formData.countryCode === "+91" && formData.mob.trim().length !== 10)
      newErrors.mob = "Mobile number must be 10 digits for India";
    if (!formData.DOB) newErrors.DOB = "Date of birth is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (otpVerified) {
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password !== formData.cnfpassword)
        newErrors.cnfpassword = "Passwords do not match";
    }
    return newErrors;
  };

  // Function to send OTP
  const sendOtp = async () => {
    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setNotification({
        type: "danger",
        message: "Please fix the errors before sending OTP.",
      });
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const result = await response.json();
      if (result.success) {
        setOtpSent(true);
        setNotification({
          type: "success",
          message: "OTP sent to your email. Please verify.",
        });
      } else {
        setNotification({
          type: "danger",
          message: result.message || "Failed to send OTP.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setNotification({
        type: "danger",
        message: "Something went wrong while sending OTP!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to resend OTP
  const resendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const result = await response.json();
      if (result.success) {
        setNotification({
          type: "success",
          message: "OTP re-sent to your email.",
        });
      } else {
        setNotification({
          type: "danger",
          message: result.message || "Failed to resend OTP.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setNotification({
        type: "danger",
        message: "Something went wrong while resending OTP!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setOtpError("Please enter the OTP");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verifyotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const result = await response.json();
      if (result.success) {
        setOtpVerified(true);
        setOtpError("");
        setNotification({
          type: "success",
          message: "OTP verified successfully! You can now set your password.",
        });
      } else {
        setOtpVerified(false);
        setOtpError(result.error || "OTP verification failed.");
        setNotification({
          type: "danger",
          message: result.error || "OTP verification failed.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setNotification({
        type: "danger",
        message: "Something went wrong while verifying OTP!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission after OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setNotification({
        type: "danger",
        message: "Please fix the errors before submitting.",
      });
      return;
    }
    const userData = {
      ...formData,
      mob: `${formData.countryCode}${formData.mob.trim()}`,
      role: "Patient",
      date: new Date().toISOString(),
    };
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/createuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      if (result.success) {
        setNotification({
          type: "success",
          message: "Account created successfully!",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setNotification({
          type: "danger",
          message: result.message || "Failed to create account.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setNotification({
        type: "danger",
        message: "Something went wrong during sign-up!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-form-container">
        <h2>Create Your Account</h2>
        {notification && (
          <div className={`alert alert-${notification.type}`} role="alert">
            {notification.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="input-group">
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={formData.firstname}
              onChange={handleChange}
              disabled={otpSent}
              required
            />
            {errors.firstname && <span className="error">{errors.firstname}</span>}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleChange}
              disabled={otpSent}
              required
            />
            {errors.lastname && <span className="error">{errors.lastname}</span>}
          </div>
          <div className="input-group">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={otpSent}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* Phone Number */}
          <div className="input-group phone-group">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              disabled={otpSent}
              required
            >
              <option value="+91">+91 (India)</option>
              <option value="+1">+1 (USA)</option>
              <option value="+44">+44 (UK)</option>
            </select>
            <input
              type="text"
              name="mob"
              placeholder="Mobile Number"
              value={formData.mob}
              onChange={handleChange}
              disabled={otpSent}
              required
            />
            {errors.mob && <span className="error">{errors.mob}</span>}
          </div>
          {/* Date of Birth */}
          <div className="input-group">
            <input
              type="date"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
              disabled={otpSent}
              required
            />
            {errors.DOB && <span className="error">{errors.DOB}</span>}
          </div>
          {/* Email */}
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={otpSent}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          {/* OTP */}
          {!otpSent && (
            <button
              type="button"
              onClick={sendOtp}
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          )}
          {otpSent && !otpVerified && (
            <div className="input-group">
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              {otpError && <span className="error">{otpError}</span>}
              <button type="button" onClick={verifyOtp} disabled={isLoading}>
                Verify OTP
              </button>
              <button type="button" onClick={resendOtp} disabled={isLoading}>
                Resend OTP
              </button>
            </div>
          )}
          {/* Password and Confirm Password */}
          {otpVerified && (
            <>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
  <input
    type={showConfirmPassword ? "text" : "password"}
    name="cnfpassword"
    placeholder="Confirm Password"
    value={formData.cnfpassword}
    onChange={handleChange}
    required
    className="password-input"
  />
  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="show-password-btn"
  >
    {showConfirmPassword ? "Hide" : "Show"}
  </button>
</div>

              <button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
