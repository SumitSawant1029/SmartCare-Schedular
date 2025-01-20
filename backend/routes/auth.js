const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'GamingEc$mmerce';

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('firstname', 'Enter a valid first name').isLength({ min: 3 }),
    body('lastname', 'Enter a valid last name').isLength({ min: 3 }),
    body('gender', 'Enter a valid gender').isIn(['Male', 'Female', 'Other']), // Add valid gender values
    body('mob', 'Enter a valid mobile number').isNumeric(), // Change this to isNumeric
    body('DOB', 'Enter a valid date of birth'),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
  ], async (req, res) => {
    // If there are errors, return Bad request and the errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ error: 'Sorry, a user with this email already exists' });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
  
      // Create a new user
      user = await User.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        gender: req.body.gender,
        mob: req.body.mob,
        DOB: req.body.DOB,
        email: req.body.email,
        password: secPass
      });
  
      const data = {
        user: {
          id: user.id
        }
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success =true;
      res.json({ success , authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });
  


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});


// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser,  async (req, res) => {

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE 4: Check if Email is Taken: POST "/api/auth/isEmailTaken". Login required
router.post('/isEmailTaken',  async (req, res) => {
    try {
      const { email } = req.body;

  
      // Check if a user with the provided email exists in the database
      const user = await User.findOne({ email });
  
      if (user) {
        // If a user is found with the provided email, send a success response
        return res.json({ message: 'User exists' ,code:false});
      } else {
        // If no user is found with the provided email, send a failure response
        return res.json({ message: 'User does not exist', code:true });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });



router.post('/isPhoneTaken',  async (req, res) => {
    try {
      const { mob } = req.body;

  
      // Check if a user with the provided email exists in the database
      const user = await User.findOne({ mob });
  
      if (user) {
        // If a user is found with the provided email, send a success response
        return res.json({ message: 'Phone exists' ,code:false});
      } else {
        // If no user is found with the provided email, send a failure response
        return res.json({ message: 'Phone does not exist', code:true });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });
  


module.exports = router