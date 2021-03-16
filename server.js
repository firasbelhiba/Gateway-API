const express = require('express');
const connectDB = require('./config/db');

//Connect Database 
connectDB();

const app = express();

app.get('/', async (req, res) => {
    console.log('API is running');
});


// Define routes
app.use('/api/users', require('./routes/api/users'));






const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
