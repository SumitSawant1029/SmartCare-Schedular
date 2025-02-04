const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const fetchuser = require('../middleware/fetchuser'); // Admin authentication middleware
const DoctorAvailability = require('../models/DoctorAvailability');

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


// API to create or update doctor's availability
router.post('/availability', async (req, res) => {
  try {
      const { doctorEmail, selectedSlots } = req.body;

      if (!doctorEmail || !selectedSlots || selectedSlots.length === 0) {
          return res.status(400).json({ message: 'Doctor email and slots are required' });
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const formattedSlots = selectedSlots.map((slot) => ({ time: slot, booked: false }));

      let availability = await DoctorAvailability.findOne({ doctorEmail, 'availableSlots.date': tomorrow });

      if (availability) {
          // Update existing availability
          await DoctorAvailability.updateOne(
              { doctorEmail, 'availableSlots.date': tomorrow },
              { $set: { 'availableSlots.$.slots': formattedSlots } }
          );
      } else {
          // Create new availability
          await DoctorAvailability.findOneAndUpdate(
              { doctorEmail },
              { $push: { availableSlots: { date: tomorrow, slots: formattedSlots } } },
              { upsert: true, new: true }
          );
      }

      res.status(200).json({ message: 'Availability saved successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


// Fetch doctor's availability (GET)
router.post('/availability/fetch', async (req, res) => {
  try {
    const { doctorEmail } = req.body;

    if (!doctorEmail) {
      return res.status(400).json({ message: 'Doctor email is required' });
    }

    const availability = await DoctorAvailability.findOne({ doctorEmail });

    if (!availability) {
      return res.status(200).json({ availableSlots: [] });
    }

    res.status(200).json({ availableSlots: availability.availableSlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update or create availability (POST)
router.post('/availability/update', async (req, res) => {
  try {
    const { doctorEmail, date, selectedSlots } = req.body;

    if (!doctorEmail || !date || !Array.isArray(selectedSlots)) {
      return res.status(400).json({ message: 'Doctor email, date, and valid slots array are required' });
    }

    let availability = await DoctorAvailability.findOne({ doctorEmail });

    if (!availability) {
      availability = new DoctorAvailability({ doctorEmail, availableSlots: [] });
    }

    // Check if availability for the given date already exists
    let dateEntry = availability.availableSlots.find((entry) =>
      entry.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (!dateEntry) {
      dateEntry = { date: new Date(date), slots: [] };
      availability.availableSlots.push(dateEntry);
    }

    // Convert selectedSlots to the correct format
    dateEntry.slots = selectedSlots.map((time) => ({
      time: String(time),
      booked: false, // Newly added slots are available by default
    }));

    await availability.save();
    res.status(200).json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Remove a specific slot (DELETE)
router.post('/availability/remove', async (req, res) => {
  try {
    const { doctorEmail, date, slotToRemove } = req.body;

    if (!doctorEmail || !date || !slotToRemove) {
      return res.status(400).json({ message: 'Doctor email, date, and slot to remove are required' });
    }

    const availability = await DoctorAvailability.findOne({ doctorEmail });

    if (!availability) {
      return res.status(404).json({ message: 'No availability found' });
    }

    const dateEntry = availability.availableSlots.find((entry) =>
      entry.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (!dateEntry) {
      return res.status(404).json({ message: 'No available slots for this date' });
    }

    // Remove the specified slot
    dateEntry.slots = dateEntry.slots.filter(slot => slot.time !== String(slotToRemove));

    await availability.save();
    res.status(200).json({ message: 'Slot removed successfully' });
  } catch (error) {
    console.error('Error removing slot:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/availability/check', async (req, res) => {
  try {
    const { doctorEmail, date } = req.body;

    if (!doctorEmail || !date) {
      return res.status(400).json({ message: 'Doctor email and date are required' });
    }

    const availability = await DoctorAvailability.findOne({ doctorEmail });

    if (!availability) {
      return res.status(404).json({ message: 'No availability found' });
    }

    const dateEntry = availability.availableSlots.find((entry) =>
      entry.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (!dateEntry) {
      return res.status(404).json({ message: 'No available slots for this date' });
    }

    res.status(200).json({ availableSlots: dateEntry.slots });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/getallusers/doctor', async (req, res) => {
  try {
    const users = await Doctor.find().select("-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/approve', async (req, res) => {
  try {
    const { doctorId } = req.body; // Extract doctor ID from body

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.isApproved = true;
    await doctor.save();

    res.status(200).json({ message: 'Doctor approved successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Route 1: Initially to generate doctor appointment 
router.post('/setAvailability', async (req, res) => {
  const { doctorEmail } = req.body;

  if (!doctorEmail) {
    return res.status(400).json({ message: 'Doctor email is required' });
  }

  try {
    // Check if the availability already exists
    const existingAvailability = await DoctorAvailability.findOne({ doctorEmail });
    if (existingAvailability) {
      return res.status(400).json({ message: 'Availability already set for this doctor' });
    }

    // Default slots data
    const defaultSlots = {
      '09:00 AM': {},
      '09:30 AM': {},
      '10:00 AM': {},
      '10:30 AM': {},
      '11:00 AM': {},
      '11:30 AM': {},
      '12:00 PM': {},
      '12:30 PM': {},
      '01:00 PM': {},
      '01:30 PM': {},
      '02:00 PM': {},
      '02:30 PM': {},
      '03:00 PM': {},
      '03:30 PM': {},
      '04:00 PM': {},
      '04:30 PM': {},
      '05:00 PM': {},
      '05:30 PM': {},
      '06:00 PM': {},
      '06:30 PM': {},
    };

    // Create new availability document
    const newAvailability = new DoctorAvailability({
      doctorEmail,
      ...defaultSlots,
    });

    await newAvailability.save();
    res.status(201).json({ message: 'Availability set successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Allow Slots API
router.post('/allow-slots', async (req, res) => {
  const { doctorEmail, slots } = req.body;

  try {
      // Check if the doctor exists in the database
      const doctor = await DoctorAvailability.findOne({ doctorEmail });
      if (!doctor) {
          return res.status(404).json({ error: "Doctor not found" });
      }

      // Update the slots to allow them
      slots.forEach(slot => {
          if (doctor[slot] !== undefined) {
              doctor[slot].doctorAllowed = true;
          }
      });

      await doctor.save();
      res.json({ message: "Slots allowed successfully" });

  } catch (error) {
      res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Disallow Slots API
router.post('/disallow-slots', async (req, res) => {
  const { doctorEmail, slots } = req.body;

  try {
      // Check if the doctor exists in the database
      const doctor = await DoctorAvailability.findOne({ doctorEmail });
      if (!doctor) {
          return res.status(404).json({ error: "Doctor not found" });
      }

      // Update the slots to disallow them
      slots.forEach(slot => {
          if (doctor[slot] !== undefined) {
              doctor[slot].doctorAllowed = false;
          }
      });

      await doctor.save();
      res.json({ message: "Slots disallowed successfully" });

  } catch (error) {
      res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ Get Allowed and Not Allowed Slots API
router.post('/get-slots', async (req, res) => {
  const { doctorEmail } = req.body;

  try {
      // Check if the doctor exists in the database
      const doctor = await DoctorAvailability.findOne({ doctorEmail });
      if (!doctor) {
          return res.status(404).json({ error: "Doctor not found" });
      }

      const allowedSlots = [];
      const notAllowedSlots = [];

      // Loop through the slots to categorize them into allowed and not allowed
      const slots = [
          '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
          '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
          '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
          '06:00 PM', '06:30 PM'
      ];

      slots.forEach(slot => {
          if (doctor[slot] && doctor[slot].doctorAllowed) {
              allowedSlots.push(slot);
          } else {
              notAllowedSlots.push(slot);
          }
      });

      res.json({ allowedSlots, notAllowedSlots });

  } catch (error) {
      res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
