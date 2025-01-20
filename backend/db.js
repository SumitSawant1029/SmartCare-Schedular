const mongoose = require('mongoose');
const mongoURI ="mongodb+srv://1029sumitsawant:FBEbUrTOaedV9clE@cluster0.l10gu.mongodb.net/";

const connectToMongo = () => {
    mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected Successfully");
    })
    .catch(error => {
        console.error("Error connecting to MongoDB:", error);
    });
}

module.exports = connectToMongo;