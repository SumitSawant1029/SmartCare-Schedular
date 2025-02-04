const mongoose = require('mongoose');

const DoctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorEmail: {
      type: String,
      required: true, // Doctor's email (unique identifier)
      ref: 'Doctor',
      unique : true,
    },
    '09:00 AM': {
      type: {
        booked: {
          type: Boolean,
          default: false, // Whether this slot is booked or not
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '09:30 AM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '10:00 AM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '10:30 AM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '11:00 AM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '11:30 AM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '12:00 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '12:30 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '01:00 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '01:30 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '02:00 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '02:30 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '03:00 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '03:30 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '04:00 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '04:30 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '05:00 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '05:30 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '06:00 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
    '06:30 PM': {
      type: {
        booked: {
          type: Boolean,
          default: false,
        },
        doctorAllowed: {
          type: Boolean,
          default: false, // Default set to false
        },
        email: {
          type: String,
          default: null, // Patient's email who booked the slot (default is null)
        },
      },
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorAvailability', DoctorAvailabilitySchema);
