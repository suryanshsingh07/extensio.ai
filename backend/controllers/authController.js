const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const BillingService = require('../services/billingService');
const OrganizationService = require('../services/organizationService');

const JWT_SECRET = process.env.JWT_SECRET;



class AuthController {
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required' });
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Validation Error', message: 'Malformed email address' });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'
        });
      }



      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Conflict', message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, name });
      await user.save();

      // Initialize billing and organization services
      try {
        await BillingService.initializeUser(user._id);
        await OrganizationService.createOrganization(
          user._id,
          `${user.name || 'Personal'}'s Workspace`,
          user.email
        );
      } catch (serviceErr) {
        console.error('Error initializing services on registration:', serviceErr);
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ error: 'Server Error', message: 'Failed to initialize user services' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ error: 'Server Error', message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required' });
      }



      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ error: 'Server Error', message: error.message });
    }
  }

  static async me(req, res) {
    try {


      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'Not Found', message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server Error', message: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Validation Error', message: 'Name and email are required' });
      }



      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Not Found', message: 'User not found' });
      }

      // Check email conflict
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Conflict', message: 'Email already in use' });
        }
      }

      user.name = name;
      user.email = email;
      await user.save();

      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Server Error', message: error.message });
    }
  }
}

module.exports = AuthController;
