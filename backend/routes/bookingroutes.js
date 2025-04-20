// routes/bookingRoutes.js
const express = require('express');
const Booking = require('../models/Booking');
const router = express.Router();



router.get('/all-bookings', async (req, res) => {
    try {
      // Fetch all bookings from the database
      const bookings = await Booking.find({});
  
      // Log the total number of bookings found
      console.log(`🧪 Total bookings in DB: ${bookings.length}`);
      bookings.forEach((b, i) => {
        console.log(`#${i + 1} Email: ${b.patientEmail}, Status: ${b.status}`);
      });
  
      // Return the bookings data in the response
      res.json({ total: bookings.length, bookings });
    } catch (err) {
      console.error('❌ Error fetching all bookings:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
// API to get confirmed doctor emails for a given patient email
router.get('/confirmeddoctors', async (req, res) => {
  const { email } = req.query;

  console.log('➡️ Received request for confirmed doctor emails.');
  console.log('📧 Patient Email:', email);

  // Check if email parameter is missing
  if (!email) {
    console.warn('⚠️ No patient email provided in query.');
    return res.status(400).json({ error: 'Patient email is required' });
  }

  try {
    // Fetch confirmed bookings with the patientEmail from the query parameter
    const confirmedBookings = await Booking.find({
      patientEmail: email,
      status: "Confirmed",  // Add status filter to get only confirmed bookings
    });

    // Debugging output
    console.log(`🔍 Found ${confirmedBookings.length} confirmed bookings for patient: ${email}`);

    // If no bookings are found
    if (confirmedBookings.length === 0) {
      console.log(`⚠️ No confirmed bookings found for patient: ${email}`);
      return res.status(404).json({ message: 'No confirmed bookings found for the given patient email.' });
    }

    // Log the doctor emails
    confirmedBookings.forEach((booking, index) => {
      console.log(`  #${index + 1}: Doctor Email: ${booking.doctorEmail}`);
    });

    // Extract the doctor emails from confirmed bookings
    const doctorEmails = confirmedBookings.map(b => b.doctorEmail);

    // Return the doctor emails in the response
    res.json({ doctorEmails });
  } catch (err) {
    console.error('❌ Error while fetching confirmed bookings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
