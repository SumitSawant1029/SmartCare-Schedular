const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const fetchuser = require('../middleware/fetchuser'); // Admin authentication middleware

// ROUTE 1: Register a new Doctor using: POST "/api/doctor/register"
router.post(
  '/register',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('specialization', 'Specialization is required').notEmpty(),
    body('licenseNumber', 'License number is required').notEmpty(),
    body('hospital', 'Hospital is required').notEmpty(),
    body('yearsOfExperience', 'Years of experience is required').isNumeric(),
    body('availability', 'Availability is required').isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, specialization, licenseNumber, hospital, yearsOfExperience, availability, profilePicture } = req.body;

      let doctor = await Doctor.findOne({ email });
      if (doctor) {
        return res.status(400).json({ error: 'Doctor already registered with this email' });
      }

      // Create a new doctor
      doctor = new Doctor({
        email,
        specialization,
        licenseNumber,
        hospital,
        yearsOfExperience,
        availability,
        profilePicture,
      });

      await doctor.save();
      res.status(201).json({
        success: true,
        message: 'Doctor registered successfully. Await admin approval.',
        data: {
          email: doctor.email,
          specialization: doctor.specialization,
          createdAt: doctor.createdAt, // Return the createdAt timestamp
        },
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  }
);

// ROUTE 2: Get Doctor Details using: GET "/api/doctor/:email"
router.get('/details/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({
      success: true,
      data: {
        email: doctor.email,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        hospital: doctor.hospital,
        yearsOfExperience: doctor.yearsOfExperience,
        availability: doctor.availability,
        profilePicture: doctor.profilePicture,
        createdAt: doctor.createdAt,
        isApproved: doctor.isApproved,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 3: Get All Doctors using: GET "/api/doctor/all"
router.get('/all', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 4: Approve Doctor by Admin using: PUT "/api/doctor/approve/:email"
router.put('/approve/:email', fetchuser, async (req, res) => {
  const { email } = req.params;

  try {
    // Check if the user is an admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Approve the doctor
    doctor.isApproved = true;
    await doctor.save();

    res.json({ success: true, message: 'Doctor approved successfully', data: doctor });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 5: Update Doctor Details using: PUT "/api/doctor/update/:email"
router.put('/update/:email', fetchuser, async (req, res) => {
  const { email } = req.params;
  const { specialization, licenseNumber, hospital, yearsOfExperience, availability, profilePicture } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Update the doctor details
    doctor.specialization = specialization || doctor.specialization;
    doctor.licenseNumber = licenseNumber || doctor.licenseNumber;
    doctor.hospital = hospital || doctor.hospital;
    doctor.yearsOfExperience = yearsOfExperience || doctor.yearsOfExperience;
    doctor.availability = availability || doctor.availability;
    doctor.profilePicture = profilePicture || doctor.profilePicture;

    await doctor.save();
    res.json({ success: true, message: 'Doctor details updated successfully', data: doctor });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// ROUTE 6: Delete Doctor by Admin using: DELETE "/api/doctor/delete/:email"
router.delete('/delete/:email', fetchuser, async (req, res) => {
  const { email } = req.params;

  try {
    // Check if the user is an admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await doctor.remove();
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post("/check-status", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Checking doctor status for: ${email}`);

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: false });
    }

    if (!doctor.isApproved) {
      return res.json({ success: true, message: false });
    }

    res.json({ success: true, message:true  });
  } catch (error) {
    console.error("Error checking doctor status:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
