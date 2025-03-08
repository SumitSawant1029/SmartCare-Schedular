const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const { Buffer } = require('buffer');

const router = express.Router();

router.put('/complete', async (req, res) => {
  try {
    const { appointmentId, doctorNotes, prescriptionFile, reportFile } = req.body;

    // Decode base64 to Buffer
    const decodedPrescription = Buffer.from(prescriptionFile, 'base64');
    const decodedReport = Buffer.from(reportFile, 'base64');

    // Save to local storage (you can change this to save in cloud or elsewhere)
    const prescriptionFilePath = `uploads/prescription_${appointmentId}.pdf`;
    const reportFilePath = `uploads/report_${appointmentId}.pdf`;

    // Save files to disk
    fs.writeFileSync(prescriptionFilePath, decodedPrescription);
    fs.writeFileSync(reportFilePath, decodedReport);

    // Update the appointment in the database
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { appointmentId },
      {
        doctorNotes,
        prescriptionFile: prescriptionFilePath,
        reportFile: reportFilePath
      },
      { new: true }
    );

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to complete the appointment.' });
  }
});

module.exports = router;
