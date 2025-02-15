const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true, // Ensure that patientName is required
    },
    patientEmail: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true, // Ensure that doctorName is required
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
      required: true, // Description of symptoms
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'PCancelled','DCancelled'],
      default: 'Pending', // Default status is pending
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', BookingSchema);
