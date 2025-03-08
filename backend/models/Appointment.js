// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  doctorNotes: {
    type: String,
    required: true,
  },
  prescriptionFile: {
    type: String, // This will store the path or Base64 string for prescription file
    required: true,
  },
  reportFile: {
    type: String, // This will store the path or Base64 string for report file
    required: true,
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
