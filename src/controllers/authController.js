// src/controllers/authController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const lipseyService = require('../services/lipseyService');
const bcryptjs = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user: { email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const lipseyLogin = async (req, res) => {
  console.log('lipsey login', req.body);
  try {
    const response = await lipseyService.authLogin(req.body);
    console.log('lipseys response', response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.response.data, error_details: error });
  }
}

module.exports = { register, login, lipseyLogin };
