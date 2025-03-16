const express = require('express');
const router = express.Router();
const PatientHistory = require('../models/PatientHistory');
const Booking = require('../models/Booking'); // Import Booking model

// @route   POST /api/phis/addhistory
// @desc    Add patient history record & update booking status
// @access  Public

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

    // Fetch only appointment IDs from the PatientHistory collection
    const histories = await PatientHistory.find({ patientEmail }).select('appointmentId -_id');

    if (!histories || histories.length === 0) {
      return res.status(404).json({ message: 'No history found for this patient' });
    }

    // Extract appointment IDs from response
    const appointmentIds = histories.map(history => history.appointmentId);

    res.status(200).json({ appointmentIds });

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

module.exports = router;
