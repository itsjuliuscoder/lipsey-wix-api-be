// src/controllers/authController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const lipseyService = require('../services/lipseyService');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
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
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
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
