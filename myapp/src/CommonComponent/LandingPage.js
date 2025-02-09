import React, { useRef } from "react";
import { motion, useInView, useScroll } from "framer-motion";
import './LandingPage.css';
import Navbar from './Navbar';
import Footer from './Footer';
import top from '../Asset/LandingTopBanner.png';
import clock from '../Asset/clock.png';
import location from '../Asset/location.png';
import aibase from "../Asset/aibase.png";
import appointment from "../Asset/appointment.png";
import whychooseus from "../Asset/whychooseus.png";
const LandingPage = () => {
  

  return (
    <>
      <Navbar />
      <div className="banner">
        <img src={top}></img>

      </div>
      <br/>
      <br/>
      <div className="services-container">
  <h2>Our Services</h2>
  <br/>
  <div className="services-grid">
    <div className="service-card">
      <img
        src={aibase}  // Adjust the path to your logo image for AI-Based Diagnosis
        alt="AI-Based Diagnosis"
        className="service-logo"
      />
      <h3>AI-Based Diagnosis</h3>
      <p>Predicts diseases based on symptoms.</p>
    </div>
    <div className="service-card">
      <img
        src={location}  // Adjust the path to your logo image for Doctor Recommendation
        alt="Doctor Recommendation"
        className="service-logo"
      />
      <h3>Doctor Recommendation</h3>
      <p>Suggests the best doctor based on specialization, location, and reviews.</p>
    </div>
    <div className="service-card">
      <img
        src={appointment} // Adjust the path to your logo image for Seamless Appointment Booking
        alt="Seamless Appointment Booking"
        className="service-logo"
      />
      <h3>Appointment Booking</h3>
      <p>Patients can easily schedule appointments.</p>
    </div>
    <div className="service-card">
      <img
        src={clock}  // Adjust the path to your logo image for Real-Time Notifications
        alt="Real-Time Notifications"
        className="service-logo"
      />
      <h3>Real-Time Notifications</h3>
      <p>Patients are notified one day prior to any changes.</p>
    </div>
  </div>
</div>

<div className="why-choose-us">
      {/* Text Content */}
      <div className="content">
        <h2>Why Choose Us?</h2>
        <p>
          SmartCare Scheduler offers <strong>AI-powered</strong> doctor recommendations, 
          <strong> real-time</strong> appointment booking, and <strong>seamless</strong> healthcare management. 
          Get <strong>faster diagnoses</strong> and <strong>better scheduling</strong> for an improved healthcare experience.
        </p>
      </div>

      {/* Image on the Right */}
      <div className="image-container">
        <img src={whychooseus} alt="Why Choose Us" />
      </div>
    </div>
    <div className="stats">
  <h2>Our Impact</h2>
  <div className="stat-card">
    <h3>🩺 500+ Doctors</h3>
    <h3>✅ 10,000+ Appointments Booked</h3>
    <h3>😊 98% Patient Satisfaction</h3>
  </div>
</div>

      <Footer />
    </>
  );
};

export default LandingPage;
