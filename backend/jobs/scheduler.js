const cron = require("node-cron");
const mongoose = require("mongoose");
const Booking = require("../models/Booking"); // Ensure the path is correct

console.log("Scheduler is starting...");

// Schedule job to run every 30 seconds (for testing)
cron.schedule("*/30 * * * *", async () => {
  console.log("Running cron job to check expired confirmed appointments...");

  try {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    console.log("Current time:", now);
    console.log("Cutoff time:", cutoffTime);

    const updatedAppointments = await Booking.updateMany(
      {
        status: "Confirmed",
        appointmentDate: { $lt: cutoffTime },
      },
      { $set: { status: "PCancelled" } }
    );

    console.log("Updated Appointments:", updatedAppointments);
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});

console.log("Cron job scheduled to run every 30 seconds.");
