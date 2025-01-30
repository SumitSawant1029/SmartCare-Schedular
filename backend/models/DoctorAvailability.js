const mongoose = require('mongoose');

const DoctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorEmail: {
      type: String,
      required: true, // Doctor's email (unique identifier)
      ref: 'Doctor', // Linking to the Doctor model
    },
    availableSlots: [
      {
        date: {
          type: Date,
          required: true, // The date for which availability is set
        },
        slots: [
          {
            time: {
              type: String,
              required: true, // Time slot (e.g., '9:00 AM - 10:00 AM')
            },
            booked: {
              type: Boolean,
              default: false, // Whether the slot is booked or not
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorAvailability', DoctorAvailabilitySchema);
