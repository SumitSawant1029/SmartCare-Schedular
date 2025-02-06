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

      <div className="">
        <a>Why Choose Us?</a>

      </div>
      <Footer />
    </>
  );
};

export default LandingPage;
