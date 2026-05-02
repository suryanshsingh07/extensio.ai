const Subscription = require('../models/Subscription');
const requirePremium = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assumes auth middleware ran first
    const sub = await Subscription.findOne({ userId });

    if (!sub || sub.plan === 'FREE') {
      return res.status(403).json({
        error: 'Premium Feature Locked',
        message: 'This feature requires a Professional or Enterprise subscription.'
      });
    }

    if (sub.status !== 'active') {
      return res.status(402).json({
        error: 'Payment Required',
        message: 'Your subscription is past due. Please update your billing information.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify subscription status.' });
  }
};

module.exports = requirePremium;
