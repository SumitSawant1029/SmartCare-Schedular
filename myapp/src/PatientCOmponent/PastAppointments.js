import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "./PastAppointments.css";
import PatientNavbar from "./PatientNavbar";

// Reusable Star component that renders an SVG star.
const Star = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    width="32"
    height="32"
    viewBox="0 0 24 24"
    style={{ cursor: "pointer" }}
  >
    <path
      fill={filled ? "gold" : "lightgray"}
      d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.738 1.466 8.316L12 18.896l-7.402 3.874 1.466-8.316L.001 9.306l8.332-1.151z"
    />
  </svg>
);

const PastAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState({}); // Store ratings and texts keyed by appointmentId
  const [hoverRating, setHoverRating] = useState({}); // For hover effect keyed by appointmentId
  const [reviewOpenFor, setReviewOpenFor] = useState(null); // Which appointment's review form is open
  const [canceling, setCanceling] = useState(null); // Store appointmentId that's being cancelled
  const patientEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/book/appointments/patient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientEmail }),
        });
        const data = await response.json();
        console.log("Fetched appointments:", data);
        if (data.appointments) {
          const sortedAppointments = data.appointments.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          setAppointments(sortedAppointments);
        } else {
          console.error("Failed to fetch appointments");
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [patientEmail]);

  // Update hover rating for an appointment (using appointmentId as key)
  const handleStarHover = (appointmentId, starValue) => {
    setHoverRating((prev) => ({
      ...prev,
      [appointmentId]: starValue,
    }));
  };

  // Clear hover rating when leaving
  const handleStarLeave = (appointmentId) => {
    setHoverRating((prev) => ({
      ...prev,
      [appointmentId]: undefined,
    }));
  };

  // Save the selected star rating
  const handleStarClick = (appointmentId, starValue) => {
    setReviews((prev) => ({
      ...prev,
      [appointmentId]: { ...prev[appointmentId], rating: starValue },
    }));
  };

  // Handle review text input changes
  const handleReviewChange = (appointmentId, value) => {
    setReviews((prev) => ({
      ...prev,
      [appointmentId]: { ...prev[appointmentId], text: value },
    }));
  };

  // Submit the review with added debugging steps
  const submitReview = async (appointmentId, doctorEmail, patientEmailParam) => {
    const { rating, text } = reviews[appointmentId] || {};
    if (!rating) {
      alert("Please select a star rating.");
      return;
    }

    const payload = {
      appointmentId,
      doctorEmail,
      rating,
      text,
      patientEmail: patientEmailParam,
    };

    console.log("Submitting review with payload:", payload);

    try {
      const response = await fetch(`${API_URL}/api/doc/reviews/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Response data:", responseData);
        alert("Review submitted successfully!");
        setReviewOpenFor(null);
      } else {
        const errorData = await response.text();
        console.error("Failed to submit review. Response:", errorData);
        alert("Failed to submit review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review.");
    }
  };

  // Cancel appointment function for frontend
  const handleCancel = async (appointmentMongoId) => {
    setCanceling(appointmentMongoId);
    try {
      const response = await fetch(`${API_URL}/api/book/bookings/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointmentMongoId }),
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        // Update the appointment's status locally
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentMongoId
              ? { ...appt, status: "Cancelled" }
              : appt
          )
        );
      } else {
        const errorText = await response.text();
        alert("Error cancelling appointment: " + errorText);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Error cancelling appointment.");
    } finally {
      setCanceling(null);
    }
  };

  return (
    <>
      <PatientNavbar />
      <div className="appointments-container">
        <h2>Your Appointments</h2>
        <ul>
          {appointments.length === 0 ? (
            <li>No appointments scheduled</li>
          ) : (
            appointments.map((appointment) => {
              // Use appointment.appointmentId for display, but use _id for cancellation
              const id = appointment.appointmentId;
              const doctorEmail = appointment.doctorEmail;
              const patientEmailFromAppointment = appointment.patientEmail;
              const doctorName =
                appointment.doctorName ||
                (appointment.userDetails &&
                  `${appointment.userDetails.firstname} ${appointment.userDetails.lastname}`) ||
                "Unknown Doctor";
              const appointmentTime = new Date(appointment.appointmentDate);
              const currentTime = new Date();
              const hoursDifference =
                (appointmentTime - currentTime) / (1000 * 60 * 60);
              
              // Conditions for showing the Cancel button:
              const canCancel =
                appointment.status === "Confirmed" && hoursDifference >= 24;

              return (
                <li key={id} className={`appointment-card ${appointment.status}`}>
                  <span className="updated-at">
                    Updated: {new Date(appointment.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="appointment-details">
                    <strong>Doctor:</strong> Dr. {doctorName} <br />
                    <strong>Date:</strong>{" "}
                    {appointmentTime.toLocaleDateString()} <br />
                    <strong>Time:</strong>{" "}
                    {appointmentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    <br />
                    <strong>Symptoms:</strong> {appointment.symptoms} <br />
                    <strong>Status:</strong>{" "}
                    {appointment.status === "Completed" ? (
                      <span className="status-completed">Completed</span>
                    ) : (
                      <span>{appointment.status}</span>
                    )} 
                    <br />

                    {/* Show Cancel button if appointment is confirmed and at least 24 hours away */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(appointment._id)}
                        className="btn btn-secondary"
                        disabled={canceling === appointment._id}
                      >
                        {canceling === appointment._id ? "Cancelling..." : "Cancel Appointment"}
                      </button>
                    )}

                    {/* Review Section for Completed appointments */}
                    {appointment.status === "Completed" && !appointment.reviewed && (
                      <div className="review-section">
                        {reviewOpenFor !== id ? (
                          <button
                            onClick={() => setReviewOpenFor(id)}
                            className="btn btn-secondary"
                          >
                            Give Review
                          </button>
                        ) : (
                          <>
                            <div className="star-rating">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  filled={
                                    (hoverRating[id] || reviews[id]?.rating || 0) >= star
                                  }
                                  onMouseEnter={() => handleStarHover(id, star)}
                                  onMouseLeave={() => handleStarLeave(id)}
                                  onClick={() => handleStarClick(id, star)}
                                />
                              ))}
                            </div>
                            <textarea
                              placeholder="Write your feedback..."
                              value={reviews[id]?.text || ""}
                              onChange={(e) => handleReviewChange(id, e.target.value)}
                            />
                            <button
                              onClick={() =>
                                submitReview(
                                  id,
                                  doctorEmail,
                                  patientEmailFromAppointment || patientEmail
                                )
                              }
                              className="btn btn-primary"
                            >
                              Submit Review
                            </button>
                            <button
                              onClick={() => setReviewOpenFor(null)}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </>
  );
};

export default PastAppointments;
