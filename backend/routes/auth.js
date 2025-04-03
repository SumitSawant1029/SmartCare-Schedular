const express = require('express');
const User = require('../models/User');
const OTP = require('../models/otp'); // Import OTP model
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');

const JWT_SECRET = 'GamingEc$mmerce';

// Generate OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString(); // Generates a 6-digit OTP
}

// Create transporter for Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sumitsawant1029@gmail.com',
    pass: 'oscq nkbq lvja tkqd',  // Use environment variables for better security
  },
});

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No OTP required
// Add this route to fetch user details using authtoken
router.post('/getuserdetails', fetchuser, async (req, res) => {
  try {
    // Fetch the user ID from the token (set in the middleware)
    const userId = req.user.id;

    // Find the user in the database by ID
    const user = await User.findById(userId).select('-password'); // Exclude the password

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return user details
    res.status(200).json({
      success: true,
      data: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        mob: user.mob,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
// Update user creation route to generate and return authtoken
router.post('/createuser',
  [
    body('firstname', 'Enter a valid first name').isLength({ min: 3 }),
    body('lastname', 'Enter a valid last name').isLength({ min: 3 }),
    body('gender', 'Enter a valid gender').isIn(['Male', 'Female', 'Other']),
    body('mob', 'Enter a valid mobile number').isNumeric().isLength({ min: 10, max: 10 }),
    body('DOB', 'Enter a valid date of birth').isDate(),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
    body('role').optional().isIn(['Admin', 'Doctor', 'Patient']),
    body('latitude', 'Enter a valid latitude').isFloat(),
    body('longitude', 'Enter a valid longitude').isFloat(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Set a default role if none is provided
      req.body.role = req.body.role || 'Patient';

      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ error: 'Sorry, a user with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create the user (without OTP verification)
      user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        gender: req.body.gender,
        mob: req.body.mob,
        DOB: req.body.DOB,
        email: req.body.email,
        password: secPass,
        role: req.body.role,
        isEmailVerified: false, // Initially set email verification to false
        location: {
          type: 'Point',
          coordinates: [req.body.longitude, req.body.latitude],  // Store longitude and latitude
        },
      });

      await user.save();

      // Generate authtoken
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({ success: true, authtoken, message: 'User created successfully! Please verify your email.' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  }
);
// ROUTE 2: Send OTP to email using: POST "/api/auth/sendotp"
router.post('/sendotp', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email already exists in the database
    let user = await User.findOne({ email: email.toLowerCase() });

    // If the email already exists, return an error message
    if (user) {
      return res.status(400).json({ error: 'User already exists, please login' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiration = new Date(Date.now() + 10 * 60 * 1000);  // OTP expires in 10 minutes

    // Save OTP to OTP collection
    const otpRecord = new OTP({
      email: email,
      otp: otp,
      expiration: expiration,
    });

    await otpRecord.save();

    // Send OTP to the email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Your OTP for Email Verification',
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Error sending OTP email');
      }

      res.json({ success: true, message: 'OTP sent to your email!' });
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/verifyotp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if the OTP document exists for the given email
    let user = await OTP.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'No OTP found for this email' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if OTP has expired
    if (Date.now() > user.otpExpiration) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // OTP is valid, just return success response
    res.json({ success: true, message: 'OTP verified successfully!' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});
// ROUTE 4: Authenticate a User using: POST "/api/auth/login". No OTP required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false;
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }


    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false;
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    // Get the role from the user object
    const role = user.role; 

    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken, role }); // Include role in the response

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
// ROUTE 5: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.get('/getallusers', async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});



router.get("/user", async (req, res) => {
  const { email } = req.query; // Extract email from query parameters

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // Find the user in the database by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Return user data (excluding sensitive information like password)
    res.status(200).json({
      success: true,
      data: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        mob: user.mob,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ROUTE 6: Get all Doctors using: GET "/api/auth/getalldoctors". Login not required
router.get('/getalldoctors', async (req, res) => {
  try {
    // Find all users with the role "Doctor"
    const doctors = await User.find({ role: 'Doctor' }).select('-password'); // Exclude passwords for security

    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'No doctors found' });
    }

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


router.delete('/deleteuser/:email', async (req, res) => {
  const userEmail = req.params.email;
  console.log("Received delete request for Email:", userEmail);

  try {
    // Query user by email
    const user = await User.findOne({ email: userEmail });
    console.log("Queried User:", user);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findOneAndDelete({ email: userEmail });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


router.put('/updateuserrole', async (req, res) => {
  const { email, newRole } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update the user's role
    user.role = newRole;
    await user.save();

    res.json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


module.exports = router;
