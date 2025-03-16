const mongoose = require('mongoose');

const PatientHistorySchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true, // Ensures one history record per appointment
      ref: 'Booking', // Links to Booking model
    },
    patientEmail: {
      type: String,
      required: true, // Enables easy retrieval of a patient's history
      index: true, // Improves query performance
    },
    prescription: {
      type: String, // Base64 string of the PDF
      required: true,
    },
    report: {
      type: String, // Base64 string of the PDF
      required: true,
    },
    notes: {
      type: String, // Doctor's observations and recommendations
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('PatientHistory', PatientHistorySchema);
