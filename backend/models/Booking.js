const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID

const BookingSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true, // Ensure uniqueness
      default: uuidv4, // Automatically generate a unique ID
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorEmail: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'PCancelled', 'DCancelled', 'Completed'],
      default: 'Confirmed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', BookingSchema);
