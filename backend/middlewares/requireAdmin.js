const mongoose = require('mongoose');
const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    // In detached (in-memory) mode, deny admin access since there's no
    // reliable way to verify admin status without a database.
    if (mongoose.connection.readyState !== 1) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access is not available in detached mode.'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges are required to access this resource.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify admin status.' });
  }
};

module.exports = requireAdmin;
