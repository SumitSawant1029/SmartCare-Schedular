import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import PatientNavbar from "./PatientNavbar";
import Footer from "../CommonComponent/Footer";
import "./BookAppointments.css";

const BookAppointments = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorName, setDoctorName] = useState("Unknown Doctor");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Fetch patient details from local storage
  const patientEmail = localStorage.getItem("email");
  const patientName = localStorage.getItem("name") || "Unknown Patient";

  // Set doctor email and name from URL params
  useEffect(() => {
    const email = params.get("email");
    const name = params.get("name");
    console.log("URL Params - doctorEmail:", email, "doctorName:", name);
    setDoctorEmail(email || "No Email Provided");
    setDoctorName(name || "Unknown Doctor");
  }, [location.search]);

  // Fetch available slots when a valid date is selected and doctorEmail exists
  useEffect(() => {
    if (doctorEmail && appointmentDate) {
      console.log(
        "Fetching available slots for doctorEmail:",
        doctorEmail,
        "and appointmentDate:",
        appointmentDate
      );
      fetchAvailableSlots();
    }
  }, [appointmentDate, doctorEmail]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/book/available-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorEmail, date: appointmentDate }),
      });
      const data = await response.json();
      console.log("Available slots response:", data);
      if (response.ok) {
        setAvailableSlots(data.availableSlots);
      } else {
        console.error("Error fetching slots:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
    }
  };

  // Helper function to convert 12-hour time (e.g., "09:30 AM") to 24-hour format ("09:30")
  const convertTime12to24 = (time12h) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }
    const convertedTime = `${hours.padStart(2, "0")}:${minutes}`;
    console.log("Converted time:", time12h, "->", convertedTime);
    return convertedTime;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    console.log("----- Handle Booking -----");
    console.log("Patient Email:", patientEmail);
    console.log("Doctor Email:", doctorEmail);
    console.log("Appointment Date (raw):", appointmentDate);
    console.log("Appointment Time (raw):", appointmentTime);
    console.log("Symptoms:", symptoms);

    if (!appointmentDate || !appointmentTime || !symptoms) {
      alert("Please fill all fields");
      return;
    }

    // Prevent booking for past dates
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      alert("You cannot select a past date.");
      return;
    }

    // Convert appointmentTime to 24-hour format
    const appointmentTime24 = convertTime12to24(appointmentTime);
    // Construct the ISO date string (e.g., "2025-02-15T09:30:00.000Z")
    const bookingDateTime = `${appointmentDate}T${appointmentTime24}:00.000Z`;
    console.log("Constructed Booking DateTime:", bookingDateTime);

    const bookingData = {
      patientName,
      patientEmail,
      doctorEmail,
      doctorName,
      appointmentDate: bookingDateTime,
      symptoms,
    };
    console.log("Booking Data:", bookingData);

    try {
      const response = await fetch("http://localhost:5000/api/book/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      const data = await response.json();
      console.log("Booking API Response:", data);
      if (response.ok) {
        alert("Appointment booked successfully!");
      } else {
        // Adjust message based on the backend response
        if (data.message === "You already have an appointment on this date.") {
          setPopupMessage("You already have an appointment on this date.");
        } else {
          setPopupMessage(`Error: ${data.message}`);
        }
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      setPopupMessage("Failed to book appointment. Check console for details.");
      setShowPopup(true);
    }
  };

  return (
    <>
      <PatientNavbar />
      <br />
      <br />
      <div className="booking-container">
        <div className="booking-card">
          <h2>Book an Appointment for</h2>
          <p>
            <strong>Dr. {doctorName}</strong>
          </p>
          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => {
                  console.log("Selected date:", e.target.value);
                  setAppointmentDate(e.target.value);
                }}
                required
                min={new Date().toISOString().split("T")[0]} // Restrict past dates
              />
            </div>

            <div className="form-group">
              <label>Time:</label>
              <div className="time-slot-container">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      console.log("Selected time slot:", slot);
                      setAppointmentTime(slot);
                    }}
                    className={`time-slot-button ${appointmentTime === slot ? "selected" : ""}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Symptoms:</label>
              <textarea
                value={symptoms}
                onChange={(e) => {
                  console.log("Symptoms input:", e.target.value);
                  setSymptoms(e.target.value);
                }}
                required
              />
            </div>

            <button type="submit" className="book-btn">
              Book Appointment
            </button>
          </form>
        </div>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Error</h3>
            <p>{popupMessage}</p>
            <Link to="/Alldoctors">
              <button onClick={() => setShowPopup(false)}>OK</button>
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default BookAppointments;
