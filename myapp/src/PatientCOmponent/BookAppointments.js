import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PatientNavbar from "./PatientNavbar";
import Footer from "../CommonComponent/Footer";
import "./BookAppointments.css";
import API_URL from "../config";

const BookAppointments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorName, setDoctorName] = useState("Unknown Doctor");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const patientEmail = localStorage.getItem("email");
  const patientName = localStorage.getItem("name") || "Unknown Patient";

  useEffect(() => {
    const email = params.get("email");
    const name = params.get("name");
    setDoctorEmail(email || "No Email Provided");
    setDoctorName(name || "Unknown Doctor");
  }, [params]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!doctorEmail || !appointmentDate) return;

    try {
      console.log(`Fetching available slots for Dr. ${doctorName} on ${appointmentDate}...`);

      const response = await fetch(`${API_URL}/api/book/available-slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorEmail, date: appointmentDate }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        setAvailableSlots(data.availableSlots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
      setAvailableSlots([]);
    }
  }, [doctorEmail, appointmentDate]);

  useEffect(() => {
    if (doctorEmail && appointmentDate) {
      fetchAvailableSlots();
    }
  }, [appointmentDate, doctorEmail, fetchAvailableSlots]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!appointmentDate || !appointmentTime || !symptoms) {
      alert("Please fill all fields");
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("You cannot select a past date.");
      return;
    }

    const bookingData = {
      patientName,
      patientEmail,
      doctorEmail,
      doctorName,
      appointmentDate,
      appointmentTime, // Ensure correct slot selection
      symptoms,
    };

    try {
      const response = await fetch(`${API_URL}/api/book/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      console.log("Booking Response:", data);

      if (response.ok) {
        setPopupMessage("Appointment booked successfully!");
        setShowPopup(true);
        setTimeout(() => navigate("/patienthomepage"), 2000);
      } else {
        setPopupMessage(data.message || "Error booking appointment.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Booking Error:", error);
      setPopupMessage("Failed to book appointment. Check console for details.");
      setShowPopup(true);
    }
  };

  return (
    <>
      <PatientNavbar />
      <br />
      <br />

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>{popupMessage.includes("successfully") ? "Success" : "Error"}</h3>
            <p>{popupMessage}</p>
            <button onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}

      <div className="booking-container">
        <div className="booking-card">
          <h2>Book an Appointment for</h2>
          <p><strong>Dr. {doctorName}</strong></p>
          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]} 
              />
            </div>

            <div className="form-group">
              <label>Time:</label>
              <div className="time-slot-container">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setAppointmentTime(slot)}
                      className={`time-slot-button ${appointmentTime === slot ? "selected" : ""}`}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <p>No available slots</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Symptoms:</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="book-btn">
              Book Appointment
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BookAppointments;
