const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiration: { type: Date, required: true },
}, { timestamps: true });

// TTL index for automatic expiration after 10 minutes
otpSchema.index({ expiration: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('Otp', otpSchema);

module.exports = OTP;
