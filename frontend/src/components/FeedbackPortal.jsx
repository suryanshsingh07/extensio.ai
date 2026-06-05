import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Star, Send, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function FeedbackPortal() {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState('GENERAL_SATISFACTION');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setSubmitError(false);
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/intelligence/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, category, comment })
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        setSubmitError(true);
      }
    } catch (err) {
      setSubmitError(true);
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-5xl px-4 md:px-6 py-12 border-t border-white/5 mx-auto">
      <div className="flex items-center gap-3 mb-8 text-center justify-center flex-col md:flex-row">
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 md:mb-0">
          <MessageSquarePlus className="w-6 h-6" />
        </div>
        <div className="text-center md:text-left">
          <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-3xl font-bold transition-colors duration-500">Help Us Learn</h2>
          <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="transition-colors duration-500">Extensio.ai gets smarter with your feedback. Tell us how/what the Ai did</p>
        </div>
      </div>
      <div 
        style={{ 
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
        className="glass-panel p-8 rounded-3xl border max-w-2xl mx-auto relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.form key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="relative z-10">
              {/* Star Rating */}
              <div className="mb-8">
                <label style={{ color: isDark ? '#d1d5db' : '#374151' }} className="block text-sm font-medium mb-3 text-center transition-colors duration-500">Rate the generated code quality</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer">
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredRating || rating) 
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                            : isDark ? 'text-gray-600 hover:text-gray-500' : 'text-gray-300 hover:text-gray-400'
                        }`}/>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <button type="button"
                  onClick={() => setCategory('BUG_REPORT')}
                  style={category !== 'BUG_REPORT' ? {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    color: isDark ? '#9ca3af' : '#4b5563'
                  } : {}}
                  className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${category === 'BUG_REPORT' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'hover:bg-white/5'}`}>
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs font-medium">Report Bug</span>
                </button>
                <button type="button"
                  onClick={() => setCategory('GENERAL_SATISFACTION')}
                  style={category !== 'GENERAL_SATISFACTION' ? {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    color: isDark ? '#9ca3af' : '#4b5563'
                  } : {}}
                  className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${category === 'GENERAL_SATISFACTION' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'hover:bg-white/5'}`}>
                  <Star className="w-5 h-5" />
                  <span className="text-xs font-medium">General Rating</span>
                </button>
                <button type="button"
                  onClick={() => setCategory('FEATURE_REQUEST')}
                  style={category !== 'FEATURE_REQUEST' ? {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    color: isDark ? '#9ca3af' : '#4b5563'
                  } : {}}
                  className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${category === 'FEATURE_REQUEST' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'hover:bg-white/5'}`}>
                  <Lightbulb className="w-5 h-5" />
                  <span className="text-xs font-medium">Feature Idea</span>
                </button>
              </div>

              {/* Comment Box */}
              <div className="mb-6">
                <label htmlFor="comment" style={{ color: isDark ? '#d1d5db' : '#374151' }} className="block text-sm font-medium mb-2 transition-colors duration-500">
                  Additional Details (Optional)
                </label>
                <textarea id="comment"
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did the AI get right or wrong?"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                    color: isDark ? '#ffffff' : '#111827',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  }}
                  className="w-full border rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all duration-500"/>
              </div>
              {submitError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Failed to send feedback. Please try again.
                </div>
              )}
              <button type="submit"
                disabled={rating === 0 || isSubmitting}
                style={rating === 0 ? {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(243, 244, 246, 1)',
                  color: isDark ? '#4b5563' : '#9ca3af',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                } : {}}
                className={`w-full py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition-all ${
                  rating === 0 
                    ? 'cursor-not-allowed border' 
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] cursor-pointer'
                }`}>
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Submit to AI Intelligence <Send className="w-4 h-4" /></>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 relative z-10">
              <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl font-bold mb-2 transition-colors duration-500">Feedback Ingested</h3>
              <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="max-w-sm mx-auto transition-colors duration-500">
                Thank you! Your insights have been routed to our model training pipeline to improve future generations
              </p>
              <button onClick={() => { setIsSubmitted(false); setRating(0); setComment(''); setSubmitError(false); }}
                className="mt-8 text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                Submit another report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
