const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretantigravitykey2026';

// In-memory fallback for detached mode
const memoryUsers = [];

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required' });
      }

      // Detached mode fallback
      if (mongoose.connection.readyState !== 1) {
        if (memoryUsers.find(u => u.email === email)) {
          return res.status(400).json({ error: 'Conflict', message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { _id: Date.now().toString(), email, password: hashedPassword, name };
        memoryUsers.push(newUser);
        
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });
        return res.status(201).json({ token, user: { id: newUser._id, email: newUser.email, name: newUser.name } });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Conflict', message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, name });
      await user.save();

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

      // Detached mode fallback
      if (mongoose.connection.readyState !== 1) {
        const memUser = memoryUsers.find(u => u.email === email);
        if (!memUser) {
          return res.status(400).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, memUser.password);
        if (!isMatch) {
          return res.status(400).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: memUser._id, email: memUser.email }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, user: { id: memUser._id, email: memUser.email, name: memUser.name } });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ error: 'Server Error', message: error.message });
    }
  }

  static async me(req, res) {
    try {
      // Detached mode fallback
      if (mongoose.connection.readyState !== 1) {
        const memUser = memoryUsers.find(u => u._id === req.user.id);
        if (!memUser) {
          return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        }
        const { password, ...userWithoutPassword } = memUser;
        return res.json(userWithoutPassword);
      }

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

      // Detached mode fallback
      if (mongoose.connection.readyState !== 1) {
        const memUserIndex = memoryUsers.findIndex(u => u._id === req.user.id);
        if (memUserIndex === -1) {
          return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        }
        
        // Check email conflict
        if (email !== memoryUsers[memUserIndex].email && memoryUsers.find(u => u.email === email)) {
          return res.status(400).json({ error: 'Conflict', message: 'Email already in use' });
        }

        memoryUsers[memUserIndex].name = name;
        memoryUsers[memUserIndex].email = email;
        
        const { password, ...userWithoutPassword } = memoryUsers[memUserIndex];
        return res.json(userWithoutPassword);
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
