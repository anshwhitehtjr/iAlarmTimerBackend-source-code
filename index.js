const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const connectToMongo = require('./db');
const cors = require('cors');

// Essentials
app.use(express.json());
app.use(cors());

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/alarm', require('./routes/alarm'))

// App listening
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${ port }`);
});

connectToMongo();
