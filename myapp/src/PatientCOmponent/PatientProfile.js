import React, { useEffect, useState } from "react";
import API_URL from "../config";
import PatientNavbar from "./PatientNavbar";
import "./PatientProfile.css"; // Importing CSS file

const PatientProfile = () => {
  const [user, setUser] = useState(null);
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/user?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [email]);

  if (!user) return <p className="loading">Loading...</p>;

  return (
    <>
      <PatientNavbar />
    <div className="profile-container">

      {/* Profile Card */}
      <div className="profile-card">
        <h2 className="profile-name">{user.firstname} {user.lastname}</h2>
        <p className="profile-email">{user.email}</p>

        <div className="info-grid">
          <div className="info-box">
            <p className="info-label">Mobile</p>
            <p className="info-value">{user.mob}</p>
          </div>
          <div className="info-box">
            <p className="info-label">Role</p>
            <p className="info-value">{user.role}</p>
          </div>
        </div>

        <div className={`email-status ${user.isEmailVerified ? "verified" : "not-verified"}`}>
          {user.isEmailVerified ? "✔ Email Verified" : "✖ Email Not Verified"}
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-card">
        <h3 className="insights-title">📊 Appointment Insights</h3>
        <div className="insights-grid">
          <div className="insight-box attended">
            <p className="insight-value">10</p>
            <p className="insight-label">Attended</p>
          </div>
          <div className="insight-box cancelled">
            <p className="insight-value">3</p>
            <p className="insight-label">Cancelled</p>
          </div>
          <div className="insight-box pending">
            <p className="insight-value">2</p>
            <p className="insight-label">Pending</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PatientProfile;
