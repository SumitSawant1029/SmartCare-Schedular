
const express = require("express");
const Doctor = require("../models/Doctor");
const { authAdmin } = require("./admin"); // Import admin authentication middleware
const router = express.Router();
const User = require("../models/User");
// Get all pending doctors (doctors whose `isApproved` is false)
router.get("/pending", async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: false });
    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error("Error fetching pending doctors:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});



// Approve a doctor (change their `isApproved` status to true)
router.post("/approve", async (req, res) => {
  const { email } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (doctor.isApproved) {
      return res.status(400).json({ success: false, message: "Doctor is already approved" });
    }

    doctor.isApproved = true; // Mark as approved
    await doctor.save(); // Save the changes

    return res.status(200).json({ success: true, message: "Doctor approved successfully" });
  } catch (error) {
    console.error("Error approving doctor:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Switch Patient to Admin 
router.post('/changerole',async(req,res)=>{
  const { email } = req.body;

  try {
   const user = await User.findOne({email}); 

   if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

    if(user.role=="Patient"){
      user.role = "Doctor";
    }else{
      user.role="Patient";
    }

    await user.save();
    return res.status(200).json({ success: true, message: "Role Changed successfully" });
  } catch (error) {
    console.error("Error Changing role:",error);
    return res.json({message:"Not Able to Change Role"});
  }
})
module.exports = router;
