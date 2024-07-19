const express = require('express');

const app = express();
const db = require('./db'); 
const authRoutes = require('./routes/authRoute');
const uploadRoutes = require('./routes/uploadRoutes')

const cors = require('cors');

app.use(cors());



app.use(express.json());
app.use('/api/auth', authRoutes);
//app.use('/api/file', uploadRoutes);


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
