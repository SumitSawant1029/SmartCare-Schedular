const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    doctorEmail: {
      type: String,
      required: true, // Doctor's email (linked to the DoctorAvailability)
      ref: "Doctor",
    },
    patientEmail: {
      type: String,
      required: true, // Patient's email
    },
    date: {
      type: Date,
      required: true, // Appointment date
    },
    time: {
      type: String,
      required: true, // Appointment time slot
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending", // Appointment status
    },
  },
  { timestamps: true }
);

// Ensure unique combination of patient, doctor, date, and time
AppointmentSchema.index(
  { patientEmail: 1, doctorEmail: 1, date: 1, time: 1 },
  { unique: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
