const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    doctorEmail: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Review', ReviewSchema);
