const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true, // e.g., Cardiologist, Dermatologist, etc.
    },
    licenseNumber: {
      type: String,
      required: true, // Unique registration number for the doctor
      unique: true,
    },
    hospital: {
      type: String,
      required: true, // The hospital/clinic where the doctor practices
    },
    yearsOfExperience: {
      type: Number,
      required: true, // The number of years the doctor has been practicing
    },
    availability: {
      type: Array, // Array of available days/times (e.g., [{ day: 'Monday', time: '9:00 AM - 5:00 PM' }])
      required: true,
    },
    profilePicture: {
      type: String, // URL or path to the doctor's profile picture
      default: 'default.jpg', // Default image if none is provided
    },
    isApproved: {
      type: Boolean,
      default: false, // Default to false, meaning not approved by the admin yet
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
