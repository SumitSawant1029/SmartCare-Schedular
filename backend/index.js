const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors'); 
connectToMongo();

const app = express()
const port = 5000

app.use(cors());
app.use(express.json());

app.use('/api/auth',require('./routes/auth'));
app.use('/api/doc',require('./routes/doctor'));
app.use('/api/adm',require('./routes/admin'));
app.use('/api/book',require('./routes/booking'));
app.use('/api/feedb',require('./routes/doctorfeedback'));




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})