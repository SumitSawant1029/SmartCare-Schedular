const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  gender: { type: String, required: true },
  mob: { type: String, required: true },
  DOB: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Patient' },
  isEmailVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
