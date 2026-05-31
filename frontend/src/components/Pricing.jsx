import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Building, Sparkles } from 'lucide-react';
import BorderGlow from './BorderGlow';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '₹0',
      period: 'forever',
      icon: <Zap className="w-5 h-5 text-gray-400" />,
      features: ['5 Extensions / month', 'Manifest V3 Compliance', 'Basic Chrome Store Zip', 'Community Support'],
      buttonText: 'Current Plan',
      isPopular: false,
      color: 'gray'
    },
    {
      name: 'Professional',
      price: '₹299',
      period: 'per month',
      icon: <Sparkles className="w-5 h-5 text-primary" />,
      features: ['100 Extensions / month', 'Advanced AI Context Engine', 'One-Click Live Publishing', 'Version History & Restores', 'Priority Email Support'],
      buttonText: 'Upgrade to Pro',
      isPopular: true,
      color: 'indigo'
    },
    {
      name: 'Enterprise',
      price: '₹3999',
      period: 'per year',
      icon: <Building className="w-5 h-5 text-green-400" />,
      features: ['Unlimited Generations', 'Web App & API Output Formats', 'Team Collaboration (5 seats)', 'Custom SLA & API Access'],
      buttonText: 'Contact Sales',
      isPopular: false,
      color: 'green'
    }
  ];

  return (
    <section className="w-full max-w-7xl px-4 md:px-6 py-24 border-t border-white/5" id="pricing">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Start building for free, then upgrade when you need advanced models, team collaboration, and higher volume.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, idx) => (
          <motion.div initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            key={plan.name}
            className={`relative ${plan.isPopular ? 'md:-mt-4 md:mb-4 z-10' : 'mt-0'}`}>
            {plan.isPopular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-20">
                Most Popular
              </div>
            )}
            <BorderGlow
              edgeSensitivity={24}
              glowColor="40 80 80"
              borderRadius={50}
              glowRadius={80}
              glowIntensity={3}
              coneSpread={45}
              backgroundColor={plan.isPopular ? '#13131f' : 'rgba(19, 19, 31, 0.6)'}
              className={`p-8 ${plan.isPopular ? 'pt-12' : ''} h-full w-full relative ${plan.isPopular ? 'shadow-[0_0_40px_rgba(99,102,241,0.15)]' : ''}`}
            >
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${plan.isPopular ? 'bg-primary/20' : plan.name === 'Enterprise' ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400 text-sm ml-2">/{plan.period}</span>
              </div>
              
            <button onClick={() => alert("This facility is currently unavailable")}
              className={`w-full py-3 rounded-xl font-medium mb-8 transition-colors ${
                plan.isPopular
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-surface hover:bg-white/10 text-white border border-white/5'
              }`}>
              {plan.buttonText}
            </button>
                        
              <div className="space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 ${plan.isPopular ? 'text-primary' : plan.name === 'Enterprise' ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </BorderGlow>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
