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
    profilePicture: {
      type: String, // URL or path to the doctor's profile picture
      default: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png', // Default image if none is provided
    },
    isApproved: {
      type: Boolean,
      default: false, // Default to false, meaning not approved by the admin yet
    },
    review: {
      type: Number,
      min: 0,
      max: 5,
      default: 0, // You can change this default as needed
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
