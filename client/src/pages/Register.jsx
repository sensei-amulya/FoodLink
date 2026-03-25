import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Mail, Phone, Lock, User, ArrowRight, AlertCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const Register = () => {
  const [registerMethod, setRegisterMethod] = useState('email'); // 'email' or 'phone'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Receiver');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      if (phone && otp && name && password) {
         setError('Phone registration is currently mocked. Use email instead for full functionality.');
      } else {
         setError('Please fill in all details and verify your phone number.');
      }
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'Receiver', label: 'Receiver', description: 'Looking for food' },
    { value: 'Donor', label: 'Donor', description: 'Sharing surplus food' },
    { value: 'Volunteer', label: 'Volunteer', description: 'Helping transport food' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[30vh] bg-gradient-to-b from-green-50/80 to-transparent -z-10" />
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-green-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] overflow-hidden bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-gray-900/5 relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div 
            initial={{ scale: 0.8, rotate: 10 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="h-14 w-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-green-100/50"
          >
            <Utensils size={28} strokeWidth={2.5} />
          </motion.div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Create an Account
          </h2>
          <p className="text-center text-sm text-gray-500 font-medium">
            Join FoodLink to share, receive, or transport food.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setRegisterMethod('email'); setError(''); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              registerMethod === 'email' 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <Mail size={16} strokeWidth={2.5} />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => { setRegisterMethod('phone'); setError(''); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              registerMethod === 'phone' 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <Phone size={16} strokeWidth={2.5} />
            <span>Phone OTP</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex items-start space-x-3 text-red-600 bg-red-50/80 px-4 py-3.5 rounded-2xl border border-red-100 mb-6 mt-[-4px]">
                <AlertCircle size={18} className="shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm font-medium leading-relaxed">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form 
          className="space-y-5" 
          onSubmit={registerMethod === 'email' ? handleEmailSubmit : handlePhoneSubmit}
        >
          {/* Dynamic Content Based on Tabs */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={registerMethod}
              initial={{ opacity: 0, x: registerMethod === 'email' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: registerMethod === 'email' ? 10 : -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {registerMethod === 'email' ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        required
                        className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">One-Time Password</label>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        className="block w-full text-center tracking-[0.5em] py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-mono text-lg text-gray-900 placeholder-gray-300 shadow-sm"
                        placeholder="------"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                      <button 
                        type="button"
                        className="px-5 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all whitespace-nowrap"
                      >
                        Get Code
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">I want to join as a...</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    required
                    className="block w-full pl-11 pr-10 py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-900 shadow-sm appearance-none cursor-pointer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                  {/* Custom Chevron for Select */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-green-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 flex w-full items-center justify-center space-x-2 rounded-2xl border border-transparent bg-green-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/30 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
            {!isLoading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" strokeWidth={2.5} />}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-green-600 hover:text-green-700 transition-colors">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
