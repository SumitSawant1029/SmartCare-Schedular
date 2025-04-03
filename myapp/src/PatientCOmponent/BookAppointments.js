import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
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
        let slots = data.availableSlots;

        // Get the current time
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeInMinutes = currentHours * 60 + currentMinutes; // Convert to minutes

        // Calculate the threshold time (current time + 2 hours)
        const minBookingTime = currentTimeInMinutes + 120;

        // Convert 12-hour format slots to 24-hour format and filter
        if (appointmentDate === new Date().toISOString().split("T")[0]) {
          slots = slots.filter((slot) => {
            const [hours, minutes] = slot.split(":").map(Number);
            const slotTimeInMinutes = hours * 60 + minutes; // Convert slot to minutes
            return slotTimeInMinutes >= minBookingTime; // Keep slots 2+ hours ahead
          });
        }

        console.log("Filtered Slots:", slots);
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
    }
  }, [doctorEmail, appointmentDate]);

  useEffect(() => {
    if (doctorEmail && appointmentDate) {
      fetchAvailableSlots();
    }
  }, [appointmentDate, doctorEmail, fetchAvailableSlots]);

// Inside handleBooking function (updated section only)

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

  // 🧠 Pad time to HH:mm
  const [hour, minute] = appointmentTime.split(":");
  const paddedHour = hour.padStart(2, "0");
  const paddedTime = `${paddedHour}:${minute}`;

  let combinedDateTime;
  try {
    combinedDateTime = new Date(`${appointmentDate}T${paddedTime}:00`);
    if (isNaN(combinedDateTime.getTime())) {
      throw new Error("Invalid combined datetime");
    }
  } catch (err) {
    console.error("Error creating datetime:", err);
    alert("Invalid date or time selected. Please try again.");
    return;
  }

  const bookingData = {
    patientName,
    patientEmail,
    doctorEmail,
    doctorName,
    appointmentDate: combinedDateTime,
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
