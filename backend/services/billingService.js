const Subscription = require('../models/Subscription');

// Mock Stripe integration for Phase 11
class BillingService {
  static async initializeUser(userId) {
    const sub = new Subscription({ userId, plan: 'FREE' });
    await sub.save();
    return sub;
  }

  static async upgradePlan(userId, targetPlan) {
    // In production, this verifies Stripe webhook success before updating DB
    const sub = await Subscription.findOne({ userId });
    if (!sub) throw new Error('Subscription record not found');

    sub.plan = targetPlan;
    sub.status = 'active';
    // Mock 30-day billing cycle
    sub.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
    
    await sub.save();
    return sub;
  }

  static async checkUsageLimits(userId) {
    const sub = await Subscription.findOne({ userId });
    if (!sub) throw new Error('No subscription found');

    const limits = {
      FREE: 5,           // 5 generations per month
      PROFESSIONAL: 100, // 100 generations per month
      ENTERPRISE: 99999  // Unlimited
    };

    const maxAllowed = limits[sub.plan];
    if (sub.usageMetrics.generationsThisMonth >= maxAllowed) {
      throw new Error(`Usage limit reached for ${sub.plan} plan. Please upgrade.`);
    }

    return true;
  }

  static async incrementUsage(userId) {
    await Subscription.updateOne(
      { userId },
      { $inc: { 'usageMetrics.generationsThisMonth': 1 } }
    );
  }
}

module.exports = BillingService;
