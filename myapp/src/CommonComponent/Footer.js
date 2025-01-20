import React from 'react';
import './Footer.css'; // Import CSS for Footer

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 SmartCare Scheduler. All Rights Reserved.</p>
        <div className="social-links">
          <a href="https://www.facebook.com" className="social-link">Facebook</a>
          <a href="https://www.twitter.com" className="social-link">Twitter</a>
          <a href="https://www.linkedin.com" className="social-link">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
