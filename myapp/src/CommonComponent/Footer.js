import React from 'react';
import './Footer.css'; // Import CSS for Footer
import logo from '../Asset/logoNavbar.png'; // Adjust the path to your logo image

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and About Section */}
        <div className="footer-section">
          <img src={logo} alt="SmartCare Logo" className="footer-logo" />
          <h3>About SmartCare</h3>
          <p>
            SmartCare Scheduler is an AI-driven healthcare platform that connects 
            patients with the best doctors, offering seamless appointment booking 
            and real-time updates.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Our Services</a></li>
            <li><a href="#">Book an Appointment</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: support@smartcare.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>Location: Mumbai, India</p>
        </div>

        {/* Social Media Links */}
        <div className="footer-section social-links">
          <h3>Follow Us</h3>
          <a href="https://www.facebook.com" className="social-link">Facebook</a>
          <a href="https://www.twitter.com" className="social-link">Twitter</a>
          <a href="https://www.linkedin.com" className="social-link">LinkedIn</a>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <p>© 2025 SmartCare Scheduler. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
