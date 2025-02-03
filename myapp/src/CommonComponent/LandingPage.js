import React, { useRef } from "react";
import { motion, useInView, useScroll } from "framer-motion";
import './LandingPage.css';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingPage = () => {
  // Scroll animations with Framer Motion
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const isHeroInView = useInView(heroRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true });
  const isAboutInView = useInView(aboutRef, { once: true });
  const isTestimonialsInView = useInView(testimonialsRef, { once: true });
  const isCtaInView = useInView(ctaRef, { once: true });

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <>
      <Navbar />
      <motion.div 
        className="progress-bar" 
        style={{ scaleX: scrollYProgress }} 
      />

      <div className="landing-page">
        {/* Hero Section */}
        <motion.header 
          ref={heroRef}
          className="hero-section"
          initial="hidden"
          animate={isHeroInView ? "visible" : "hidden"}
          variants={fadeUp}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            SmartCare Scheduler
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Revolutionizing healthcare by predicting diseases and scheduling doctors efficiently.
          </motion.p>
          <motion.a 
            href="#features" 
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.a>
        </motion.header>

        {/* Features Section */}
        <motion.section 
          ref={featuresRef}
          id="features" 
          className="features-section"
          initial="hidden"
          animate={isFeaturesInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <h2>Features</h2>
          <motion.div className="features" variants={staggerContainer}>
            {[
              {
                title: "Disease Prediction",
                content: "Using AI to predict the most probable diseases based on symptoms and medical history."
              },
              {
                title: "Doctor Scheduling",
                content: "Automatically schedules appointments with the best available doctors for timely care."
              },
              {
                title: "Optimized Healthcare",
                content: "Reduces waiting times and improves patient outcomes with intelligent scheduling."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                variants={staggerItem}
                whileHover={{ y: -10 }}
              >
                <h3>{feature.title}</h3>
                <p>{feature.content}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* About Section */}
        <motion.section
          ref={aboutRef}
          id="about"
          className="about-section"
          initial="hidden"
          animate={isAboutInView ? "visible" : "hidden"}
          variants={fadeLeft}
          transition={{ duration: 0.8 }}
        >
          <h2>About Us</h2>
          <p>
            At SmartCare Scheduler, we are dedicated to bringing the latest in healthcare technology to improve patient outcomes. Our team of experts works around the clock to develop innovative solutions that blend artificial intelligence with medical expertise.
          </p>
          <p>
            Our mission is to streamline the healthcare process, ensuring that patients receive timely and effective care while reducing the administrative burden on medical professionals.
          </p>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          ref={testimonialsRef}
          id="testimonials"
          className="testimonials-section"
          initial="hidden"
          animate={isTestimonialsInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <h2>What Our Clients Say</h2>
          <motion.div className="testimonials" variants={staggerContainer}>
            {[
              {
                name: "Dr. Jane Smith",
                feedback: "SmartCare Scheduler has completely transformed our scheduling system. It's efficient and user-friendly!"
              },
              {
                name: "Patient John Doe",
                feedback: "I was amazed by how quickly I got an appointment with the right specialist. Truly a game-changer."
              },
              {
                name: "Administrator Lisa Ray",
                feedback: "Managing patient appointments has never been easier. The system has significantly reduced our workload."
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="testimonial-card"
                variants={staggerItem}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <p>"{testimonial.feedback}"</p>
                <h4>- {testimonial.name}</h4>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          ref={ctaRef}
          className="cta-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isCtaInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            animate={{
              rotate: [0, -2, 2, -2, 0],
              transition: { repeat: Infinity, duration: 4 }
            }}
          >
            Ready to Transform Healthcare?
          </motion.h2>
          <p>
            Join us in creating a smarter, healthier future with SmartCare Scheduler.
          </p>
          <motion.a 
            href="#contact" 
            className="btn-primary"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
            }}
          >
            Get Started
          </motion.a>
        </motion.section>
      </div>
      <Footer />
    </>
  );
};

export default LandingPage;
