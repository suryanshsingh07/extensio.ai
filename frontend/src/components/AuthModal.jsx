import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const navigate = useNavigate();
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setError('');
      setEmail('');
      setPassword('');
      setName('');
      setIsReset(false);
      setResetSuccess(false);
      setShowPassword(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isReset) {
      try {
        // Simulate sending a reset link via mock SMTP server
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResetSuccess(true);
      } catch (err) {
        setError('Failed to send reset link.');
      } finally {
        setLoading(false);
      }
      return;
    }

    let res;
    if (isLogin) {
      res = await login(email, password);
    } else {
      res = await register(name, email, password);
    }

    setLoading(false);
    if (res.success) {
      navigate('/workspace');
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const toggleMode = () => {
    setAuthModalMode(isLogin ? 'register' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setIsReset(false);
    setResetSuccess(false);
    setShowPassword(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
          className="absolute inset-0 backdrop-blur-sm transition-colors duration-500"/>
        {/* Modal */}
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
          className="relative w-full max-w-md glass-panel p-8 rounded-3xl border shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden transition-all duration-500">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-[60px] pointer-events-none" />
          <button onClick={closeAuthModal}
            className="absolute top-5 right-5 text-gray-400 hover:text-primary transition-colors z-10">
            <X className="w-5 h-5" />
          </button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.png" className="h-10 w-10 object-contain"/>
              <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl font-bold transition-colors duration-500">
                {isReset ? 'Reset password' : isLogin ? 'Welcome back' : 'Create account'}
              </h2>
            </div>
            <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm mb-6 transition-colors duration-500">
              {isReset
                ? 'Enter your email address and we will send you a recovery link.'
                : isLogin
                ? 'Log in to access your projects and continue building amazing extensions'
                : 'Join Extensio.ai to build, package and publish extensions with AI'}
            </p>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {isReset ? (
              resetSuccess ? (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-400">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-semibold mb-2 transition-colors duration-500">Check your email</h3>
                    <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm leading-relaxed transition-colors duration-500">
                      We've simulated SMTP email delivery and sent a recovery link to <span className="text-primary font-medium">{email}</span>.
                    </p>
                  </div>
                  <button type="button" onClick={() => { setIsReset(false); setResetSuccess(false); }}
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      color: isDark ? '#ffffff' : '#111827',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }}
                    className="w-full font-medium py-2.5 rounded-xl border transition-colors hover:bg-black/5 dark:hover:bg-white/10">
                    Back to Log In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="block text-xs font-medium mb-1.5 uppercase tracking-wider transition-colors duration-500">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <input type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          color: isDark ? '#ffffff' : '#111827'
                        }}
                        className="block w-full pl-10 pr-3 py-2.5 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500"
                        placeholder="you@example.com"
                        required/>
                    </div>
                  </div>
                  <button type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Sending . . .
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                  <div className="pt-2 text-center">
                    <button type="button" onClick={() => setIsReset(false)}
                      className={`text-xs text-gray-400 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>
                      Back to Log In
                    </button>
                  </div>
                </form>
              )
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="block text-xs font-medium mb-1.5 uppercase tracking-wider transition-colors duration-500">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          style={{ 
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            color: isDark ? '#ffffff' : '#111827'
                          }}
                          className="block w-full pl-10 pr-3 py-2.5 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500"
                          placeholder="John Doe"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="block text-xs font-medium mb-1.5 uppercase tracking-wider transition-colors duration-500">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <input type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          color: isDark ? '#ffffff' : '#111827'
                        }}
                        className="block w-full pl-10 pr-3 py-2.5 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500"
                        placeholder="you@example.com"
                        required/>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="block text-xs font-medium uppercase tracking-wider transition-colors duration-500">Password</label>
                      {isLogin && <button type="button" onClick={() => { setIsReset(true); setResetSuccess(false); setError(''); }} className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</button>}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-500" />
                      </div>
                      <input type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          color: isDark ? '#ffffff' : '#111827'
                        }}
                        className="block w-full pl-10 pr-10 py-2.5 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                        placeholder="••••••••"
                        required/>
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        {isLogin ? 'Logging in . . .' : 'Creating account . . .'}
                      </>
                    ) : (
                      isLogin ? 'Log In' : 'Create Account'
                    )}
                  </button>
                </form>
                <div style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="mt-6 text-center text-sm transition-colors duration-500">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={toggleMode}
                    className={`font-medium transition-colors cursor-pointer ${isDark ? 'text-white hover:text-primary' : 'text-gray-900 hover:text-primary'}`}>
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
