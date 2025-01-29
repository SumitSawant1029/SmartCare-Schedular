
const express = require("express");
const Doctor = require("../models/Doctor");
const { authAdmin } = require("./admin"); // Import admin authentication middleware
const router = express.Router();

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

module.exports = router;
