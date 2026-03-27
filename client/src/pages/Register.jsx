import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Mail, Lock, User, AlertCircle, Eye, EyeOff, Loader2, HeartHandshake, Package, Truck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Logo from '../components/common/Logo';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Receiver');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { id: 'Donor', title: 'Donor', description: 'Share surplus food', icon: Package },
    { id: 'Receiver', title: 'Receiver', description: 'Receive food donations', icon: HeartHandshake },
    { id: 'Volunteer', title: 'Volunteer', description: 'Help transport food', icon: Truck },
    { id: 'Farmer', title: 'Farmer', description: 'Collect compost from expired food', icon: Package },
  ];

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return false;
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      setSuccess('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        login(data);
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden flex-col">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-green-600 transition-colors group bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 shadow-sm hover:shadow hover:bg-white">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-full h-[30vh] bg-gradient-to-b from-green-50/80 to-transparent -z-10" />
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-green-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[500px] bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-gray-900/5 relative z-10 my-4"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, rotate: 10 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Logo width={64} height={64} className="mb-5" />
          </motion.div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Create an Account
          </h2>
          <p className="text-center text-sm text-gray-500 font-medium">
            Join FoodLink to make a difference in your community.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="flex items-start space-x-3 text-red-600 bg-red-50/80 px-4 py-3.5 rounded-2xl border border-red-100">
                <AlertCircle size={18} className="shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm font-medium leading-relaxed">{error}</span>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="flex items-start space-x-3 text-green-700 bg-green-50/80 px-4 py-3.5 rounded-2xl border border-green-200">
                <Loader2 size={18} className="shrink-0 mt-0.5 animate-spin" strokeWidth={2.5} />
                <span className="text-sm font-bold leading-relaxed">{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-3.5 rounded-2xl border-gray-200 border bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-900 placeholder-gray-400 shadow-sm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 mt-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">I want to join as a...</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roleOptions.map((option) => (
                  <label 
                    key={option.id}
                    className={`relative flex cursor-pointer rounded-2xl border p-4 shadow-sm focus:outline-none transition-all duration-200 ${
                      role === option.id 
                        ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500' 
                        : 'border-gray-200 bg-white hover:border-green-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.id}
                      checked={role === option.id}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center justify-center w-full space-y-2 text-center">
                      <option.icon 
                        size={24} 
                        className={role === option.id ? 'text-green-600' : 'text-gray-400'} 
                        strokeWidth={2}
                      />
                      <div>
                        <p className={`text-sm font-bold ${role === option.id ? 'text-green-900' : 'text-gray-900'}`}>
                          {option.title}
                        </p>
                        <p className={`text-xs mt-0.5 line-clamp-1 ${role === option.id ? 'text-green-700' : 'text-gray-500'}`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success.length > 0}
            className="mt-8 flex w-full items-center justify-center space-x-2 rounded-2xl border border-transparent bg-green-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/30 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
            ) : (
              <span>Create Account</span>
            )}
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
