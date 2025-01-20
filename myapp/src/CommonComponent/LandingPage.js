import React from "react";
import './LandingPage.css'; // Import the CSS file for styling
import Footer from './Footer';
import Navbar from './Navbar';
const LandingPage = () => {
  return (
    <>
    <Navbar/>
    <div className="landing-page">
      <header className="hero-section">
        <h1>SmartCare Scheduler</h1>
        <p>
          Revolutionizing healthcare by predicting diseases and scheduling doctors efficiently.
        </p>
        <a href="#features" className="btn-primary">
          Learn More
        </a>
      </header>

      <section id="features" className="features-section">
        <h2>Features</h2>
        <div className="features">
          <div className="feature-card">
            <h3>Disease Prediction</h3>
            <p>
              Using AI to predict the most probable diseases based on symptoms and medical history.
            </p>
          </div>
          <div className="feature-card">
            <h3>Doctor Scheduling</h3>
            <p>
              Automatically schedules appointments with the best available doctors for timely care.
            </p>
          </div>
          <div className="feature-card">
            <h3>Optimized Healthcare</h3>
            <p>
              Reduces waiting times and improves patient outcomes with intelligent scheduling.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Transform Healthcare?</h2>
        <p>
          Join us in creating a smarter, healthier future with SmartCare Scheduler.
        </p>
        <a href="#contact" className="btn-primary">
          Get Started
        </a>
      </section>
    </div>
    <Footer/>
    </>
  );
};

export default LandingPage;
