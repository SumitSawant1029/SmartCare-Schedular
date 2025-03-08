const mongoose = require('mongoose');

const PatientRecordSchema = new mongoose.Schema(
  {
    patientEmail: {
      type: String,
      required: true,
    },
    doctorEmail: {
      type: String,
      required: true,
    },
    appointmentDateTime: {
      type: Date,
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    doctorExplanation: {
      type: String,
      required: true, // Doctor's assessment & treatment details
    },
    prescriptions: [
      {
        medicineName: String,
        dosage: String, // e.g., "1 tablet twice a day"
        duration: String, // e.g., "5 days"
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('PatientRecord', PatientRecordSchema);

