const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
require("./jobs/scheduler");

connectToMongo();

const app = express();
const port = 5000;

app.use(cors());

// Increase the request size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doc', require('./routes/doctor'));
app.use('/api/adm', require('./routes/admin'));
app.use('/api/book', require('./routes/booking'));
app.use('/api/feedb', require('./routes/doctorfeedback'));
app.use('/api/phis', require('./routes/patienthistory'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
