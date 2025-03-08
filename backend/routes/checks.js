const mongoose = require('mongoose');
const cron = require('node-cron');
const Booking = require('../models/Booking'); // Ensure correct path
const connectToMongo = require('../db'); // Import updated connectToMongo function

// Connect to MongoDB before starting the cron job
(async () => {
    await connectToMongo(); // Now it correctly waits for MongoDB connection

    // Schedule cron job to run every minute for testing
    cron.schedule('* * * * *', async () => {
        console.log(`\nCron job running at: ${new Date().toISOString()}`);
        const currentDateTime = new Date(); // Use JavaScript Date object

        try {
            const result = await Booking.updateMany(
                {
                    appointmentDate: { $lt: currentDateTime }, // Check past dates
                    status: 'Confirmed',
                },
                { $set: { status: 'PCancelled' } } // Update status
            );

            console.log(`Updated ${result.modifiedCount} booking(s) to PCancelled.`);
        } catch (error) {
            console.error('Error updating bookings:', error);
        }
    });

    console.log('Cron job scheduled to run every minute.');
})();
