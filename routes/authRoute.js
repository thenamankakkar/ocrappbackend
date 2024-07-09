const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const  User  = require('../models/user.model');


router.post('/register', async (req, res) => {
  try {


    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("iamhere",req.body);

    const user = new User({ email, password: hashedPassword });
    
    await user.save();

    res.send({msg : 'User registered successfully'});
  } catch (error) {
    
    res.status(500).send(error.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({"message":'Invalid password or email',});
    }

    const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
