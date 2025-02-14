const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Booking = require("../models/Booking");
const User = require("../models/User"); // Single User model for both Patients and Doctors

const router = express.Router();

// Create transporter for Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sumitsawant1029@gmail.com",
    pass: "oscq nkbq lvja tkqd", // For security, store credentials in environment variables
  },
});

// ==================================================================
// API to create a booking
// ==================================================================
router.post("/bookings", async (req, res) => {
  try {
    const { patientEmail, doctorEmail, appointmentDate, symptoms } = req.body;

    // 1. Validate that appointmentDate exists and is valid.
    if (!appointmentDate) {
      return res
        .status(400)
        .json({ message: "Appointment date is required." });
    }
    const parsedDate = new Date(appointmentDate);
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid appointment date provided." });
    }

    // 2. Normalize the appointment date to compute the UTC start and end of that day.
    const startOfDayUTC = new Date(
      Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate()
      )
    );
    const endOfDayUTC = new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000);
    console.log("Parsed Appointment Date:", parsedDate);
    console.log("UTC Start of Day:", startOfDayUTC);
    console.log("UTC End of Day:", endOfDayUTC);

    // 3. Check for conflict #1: One appointment per day.
    const existingSameDayBooking = await Booking.findOne({
      patientEmail,
      appointmentDate: {
        $gte: startOfDayUTC,
        $lt: endOfDayUTC,
      },
      status: { $ne: "cancelled" },
    });
    if (existingSameDayBooking) {
      return res
        .status(400)
        .json({ message: "You already have an appointment on this date." });
    }

    // 4. Check for conflict #2: One appointment per doctor.
    const existingBookingForDoctor = await Booking.findOne({
      patientEmail,
      doctorEmail,
      status: { $ne: "cancelled" },
    });
    if (existingBookingForDoctor) {
      return res
        .status(400)
        .json({ message: "You already have an appointment with this doctor." });
    }

    // 5. Verify that the patient exists.
    const patient = await User.findOne({ email: patientEmail, role: "Patient" });
    if (!patient) {
      return res.status(400).json({ message: "Patient email not found." });
    }
    const patientName = `${patient.firstname} ${patient.lastname}`;
    console.log("Patient found:", patient);
    console.log("Patient Name:", patientName);

    // 6. Verify that the doctor exists.
    const doctor = await User.findOne({ email: doctorEmail, role: "Doctor" });
    if (!doctor) {
      return res.status(400).json({ message: "Doctor email not found." });
    }
    const doctorName = `${doctor.firstname} ${doctor.lastname}`;
    console.log("Doctor found:", doctor);
    console.log("Doctor Name:", doctorName);

    // 7. Create and save the new booking.
    const newBooking = new Booking({
      patientName,
      patientEmail,
      doctorName,
      doctorEmail,
      appointmentDate: parsedDate, // Use the original date (which may include time)
      symptoms,
      // Optionally, set a default status like "pending" if your model requires it
    });

    await newBooking.save();

    // Configure email options for appointment confirmation
    const mailOptions = {
      from: "sumitsawant1029@gmail.com",
      to: newBooking.patientEmail,
      subject: "Appointment Scheduled",
      text: `Dear ${newBooking.patientName},\n\nYour appointment is scheduled on ${newBooking.appointmentDate.toLocaleString()}.\n\nRegards,\nSmartCare Scheduler`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending appointment confirmation email:", error);
      } else {
        console.log("Appointment confirmation email sent:", info.response);
      }
    });

    console.log("New booking created:", newBooking);
    return res.status(201).json({
      message: "Appointment booked successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({
      message: "Error booking appointment",
      error: error.message,
    });
  }
});

// ==================================================================
// API to cancel an appointment and notify the patient via email
// ==================================================================
router.post("/bookings/cancel", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ message: "Appointment ID is required." });
    }

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid appointment ID." });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Update the status to "cancelled"
    booking.status = "cancelled";
    await booking.save();

    // Send cancellation email to the patient
    const mailOptions = {
      from: "sumitsawant1029@gmail.com",
      to: booking.patientEmail,
      subject: "Appointment Cancelled",
      text: `Dear ${booking.patientName},\n\nYour appointment scheduled on ${booking.appointmentDate.toLocaleString()} has been cancelled.\n\nRegards,\nSmartCare Scheduler`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending cancellation email:", error);
      } else {
        console.log("Cancellation email sent:", info.response);
      }
    });

    console.log("Appointment cancelled:", booking);
    return res.status(200).json({
      message: "Appointment cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return res.status(500).json({
      message: "Error cancelling appointment",
      error: error.message,
    });
  }
});

// ==================================================================
// API to confirm an appointment and notify the patient via email
// ==================================================================
router.post("/bookings/confirm", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ message: "Appointment ID is required." });
    }

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid appointment ID." });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Update the status to "confirmed"
    booking.status = "confirmed";
    await booking.save();

    // Send confirmation email to the patient
    const mailOptions = {
      from: "sumitsawant1029@gmail.com",
      to: booking.patientEmail,
      subject: "Appointment Confirmed",
      text: `Dear ${booking.patientName},\n\nYour appointment scheduled on ${booking.appointmentDate.toLocaleString()} has been confirmed.\n\nRegards,\nSmartCare Scheduler`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending confirmation email:", error);
      } else {
        console.log("Confirmation email sent:", info.response);
      }
    });

    console.log("Appointment confirmed:", booking);
    return res.status(200).json({
      message: "Appointment confirmed successfully",
      booking,
    });
  } catch (error) {
    console.error("Confirm appointment error:", error);
    return res.status(500).json({
      message: "Error confirming appointment",
      error: error.message,
    });
  }
});

// ==================================================================
// API to fetch available slots for a doctor on a given date (Using Request Body)
// ==================================================================
const generateTimeSlots = () => {
  let timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push(`${hour}:00`);
  }
  timeSlots[timeSlots.length - 1] = "18:00"; // Last slot is 6:00 PM
  return timeSlots;
};

router.post("/available-slots", async (req, res) => {
  try {
    const { doctorEmail, date } = req.body;

    if (!doctorEmail || !date) {
      return res.status(400).json({ message: "Doctor email and date are required" });
    }

    // Convert date to a start-of-day Date object (normalize to UTC 00:00:00)
    const appointmentDate = new Date(date);
    appointmentDate.setUTCHours(0, 0, 0, 0);

    // Fetch booked slots for the doctor on the given date, excluding cancelled appointments
    const bookedAppointments = await Booking.find({
      doctorEmail,
      appointmentDate: {
        $gte: appointmentDate, // Start of the day (00:00:00 UTC)
        $lt: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000), // End of the day
      },
      status: { $ne: "cancelled" }
    });

    // Extract booked time slots properly in HH:MM format
    const bookedSlots = bookedAppointments.map((appointment) => {
      const bookedTime = new Date(appointment.appointmentDate);
      return `${bookedTime.getUTCHours()}:00`; // Ensuring UTC-based extraction
    });

    // Generate full list of available time slots and filter out booked slots
    const allTimeSlots = generateTimeSlots();
    const availableSlots = allTimeSlots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({ availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Error fetching available slots", error: error.message });
  }
});

// ==================================================================
// API to fetch patient appointments (excluding cancelled)
// ==================================================================
router.post("/appointments/patient", async (req, res) => {
  try {
    const { patientEmail } = req.body;

    if (!patientEmail) {
      return res.status(400).json({ message: "Patient email is required" });
    }

    // Exclude cancelled appointments
    const appointments = await Booking.find({
      patientEmail,
      status: { $ne: "cancelled" }
    });

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
});

// ==================================================================
// API to fetch doctor appointments (excluding cancelled)
// ==================================================================
router.post("/appointments/doctor", async (req, res) => {
  try {
    const { doctorEmail } = req.body;

    if (!doctorEmail) {
      return res.status(400).json({ message: "Doctor email is required" });
    }

    // Exclude cancelled appointments
    const appointments = await Booking.find({
      doctorEmail,
      status: { $ne: "cancelled" }
    });

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
});

// ==================================================================
// API to fetch appointment counts by month (excluding cancelled)
// ==================================================================
router.post('/appointments-count-by-month', async (req, res) => {
  try {
    const { doctorEmail, month, year } = req.body;

    if (!doctorEmail || !month || !year) {
      return res.status(400).json({ success: false, message: 'Doctor email, month, and year are required' });
    }

    // Create start and end dates for the given month
    // Note: JavaScript months are 0-indexed (0 = January)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Find appointments for the doctor within the date range, excluding cancelled appointments
    const appointments = await Booking.find({
      doctorEmail,
      appointmentDate: { $gte: startDate, $lt: endDate },
      status: { $ne: "cancelled" }
    });

    // Group appointments by date (formatted as YYYY-MM-DD)
    const counts = {};
    appointments.forEach((appointment) => {
      const dateStr = appointment.appointmentDate.toISOString().split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    res.json({ success: true, data: counts });
  } catch (error) {
    console.error('Error fetching appointment counts by month:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
