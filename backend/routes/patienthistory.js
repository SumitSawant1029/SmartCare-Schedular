const express = require('express');
const router = express.Router();
const PatientHistory = require('../models/PatientHistory');
const Booking = require('../models/Booking'); // Import Booking model
const axios = require("axios");
const HUGGINGFACE_API_KEY = "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";

router.post('/addhistory', async (req, res) => {
  try {
    const { appointmentId, patientEmail, prescription, report, notes } = req.body;

    // Check if all required fields are provided
    if (!appointmentId || !patientEmail || !prescription || !report || !notes) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if a record already exists for this appointmentId
    const existingRecord = await PatientHistory.findOne({ appointmentId });
    if (existingRecord) {
      return res.status(400).json({ message: 'Patient history already exists for this appointment' });
    }

    // Create a new patient history record
    const newPatientHistory = new PatientHistory({
      appointmentId,
      patientEmail,
      prescription,
      report,
      notes,
    });

    // Save the patient history record
    await newPatientHistory.save();

    // Update the booking status to 'Completed'
    const updatedBooking = await Booking.findOneAndUpdate(
      { appointmentId }, 
      { status: 'Completed' }, 
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(201).json({ message: 'Patient history added and appointment marked as Completed' });

  } catch (error) {
    console.error('Error adding patient history:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Ids of History based on email
router.post('/getHistoryIds', async (req, res) => {
  try {
    const { patientEmail } = req.body;

    if (!patientEmail) {
      return res.status(400).json({ message: 'Patient email is required' });
    }

    // Fetch appointment history with appointmentId and timestamp
    const histories = await PatientHistory.find({ patientEmail })
      .select('appointmentId createdAt -_id'); // createdAt serves as timestamp

    if (!histories || histories.length === 0) {
      return res.status(404).json({ message: 'No history found for this patient' });
    }

    // Extract appointment IDs
    const appointmentIds = histories.map(history => history.appointmentId);

    // Fetch appointment details (appointmentDate) from Booking model
    const bookings = await Booking.find({ appointmentId: { $in: appointmentIds } })
      .select('appointmentId appointmentDate -_id');

    // Merge histories with their corresponding appointment dates
    const appointmentData = histories.map(history => {
      const booking = bookings.find(b => b.appointmentId === history.appointmentId);
      return {
        appointmentId: history.appointmentId,
        timestamp: history.createdAt, // Timestamp from PatientHistory
        appointmentDate: booking ? booking.appointmentDate : null, // Get date if found
      };
    });

    res.status(200).json({ appointmentData });

  } catch (error) {
    console.error('Error fetching history IDs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// History by id
router.post('/getHistoryById', async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    // Fetch patient history details
    const history = await PatientHistory.findOne({ appointmentId });

    if (!history) {
      return res.status(404).json({ message: 'Patient history not found' });
    }

    res.status(200).json({ history });

  } catch (error) {
    console.error('Error fetching history details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post("/getNotesSummary", async (req, res) => {
  try {
    const { patientEmail } = req.body;

    if (!patientEmail) {
      return res.status(400).json({ message: "Patient email is required" });
    }

    const histories = await PatientHistory.find({ patientEmail }).select("notes -_id");

    if (!histories || histories.length === 0) {
      return res.status(404).json({ message: "No notes found for this patient" });
    }

    const notesText = histories.map((history) => history.notes).join(" ");

    // Hugging Face API Request
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      { inputs: notesText },
      {
        headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` },
      }
    );

    // Extract summary from response
    const summary = response.data[0]?.summary_text || "Summary generation failed.";

    res.status(200).json({ summary });

  } catch (error) {
    console.error("Error generating notes summary:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
