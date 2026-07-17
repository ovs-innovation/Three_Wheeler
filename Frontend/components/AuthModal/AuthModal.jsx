'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, User, Phone, MapPin, Check, Eye, EyeOff, ShieldCheck, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthModal() {
  const { authModal, closeAuthModal, setAuthModal, loginUser } = useApp();
  const { isOpen, tab } = authModal;

  // Active step inside tab
  // tab: 'login', 'register', 'forgot'
  // register sub-steps: 'form', 'otp', 'success'
  // forgot sub-steps: 'email', 'otp', 'newpwd', 'success'
  const [subStep, setSubStep] = useState('form');

  // Input states
  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: false });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    agree: false
  });
  const [forgotForm, setForgotForm] = useState({ email: '', password: '', confirmPassword: '' });

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Form Validation & Strength checking
  const [pwdStrength, setPwdStrength] = useState({ score: 0, label: 'Weak', color: 'bg-red-500' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset states on tab/visibility change
  useEffect(() => {
    if (isOpen) {
      if (tab === 'login') setSubStep('form');
      if (tab === 'register') setSubStep('form');
      if (tab === 'forgot') setSubStep('email');
      setErrors({});
      setTouched({});
      setOtpDigits(['', '', '', '', '', '']);
    }
  }, [isOpen, tab]);

  // Handle countdown timer for OTP screen
  useEffect(() => {
    let timer;
    if (isOpen && (subStep === 'otp' || (tab === 'forgot' && subStep === 'otp'))) {
      setOtpTimer(30);
      setCanResend(false);
      timer = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, subStep]);

  if (!isOpen) return null;

  // Handle password strength calculation
  const calculatePasswordStrength = (val) => {
    if (!val) {
      setPwdStrength({ score: 0, label: 'Weak', color: 'bg-red-500' });
      return;
    }
    let score = 0;
    if (val.length >= 6) score += 1;
    if (val.length >= 10) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;

    let label = 'Weak';
    let color = 'bg-red-500';
    if (score >= 4) {
      label = 'Strong';
      color = 'bg-green-500';
    } else if (score >= 2) {
      label = 'Medium';
      color = 'bg-yellow-500';
    }
    setPwdStrength({ score, label, color });
  };

  // Validation functions
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  // Handle Touched & Inputs
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Authentication check failed.');
      }

      loginUser({ ...result.data.user, token: result.data.token });
      toast.success('Successfully logged in!');
      closeAuthModal();
    } catch (err) {
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Perform validation checks
    const valErrors = {};
    if (!registerForm.firstName.trim()) valErrors.firstName = 'First Name is required';
    if (!registerForm.lastName.trim()) valErrors.lastName = 'Last Name is required';
    if (!validateEmail(registerForm.email)) valErrors.email = 'Enter a valid email address';
    if (!validatePhone(registerForm.phone)) valErrors.phone = 'Enter a 10-digit mobile number';
    if (registerForm.password.length < 6) valErrors.password = 'Password must be at least 6 characters';
    if (registerForm.password !== registerForm.confirmPassword) valErrors.confirmPassword = 'Passwords do not match';
    if (!registerForm.city.trim()) valErrors.city = 'City is required';
    if (!registerForm.state.trim()) valErrors.state = 'State is required';
    if (!registerForm.agree) valErrors.agree = 'You must accept the terms';

    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      // Mark all as touched
      const allTouched = {};
      Object.keys(registerForm).forEach(k => allTouched[k] = true);
      setTouched(allTouched);
      toast.error('Please correct all validation errors.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${registerForm.firstName} ${registerForm.lastName}`,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
          city: registerForm.city,
          state: registerForm.state
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Registration failed');
      }

      // Transition to simulated OTP step
      setSubStep('otp');
      toast.success('Registration data saved! Verify mobile OTP to activate.');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // OTP inputs auto-advance
  const handleOtpInput = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Focus next
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // OTP verification handler
  const handleVerifyOtp = () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      toast.error('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubStep('success');
      toast.success('Identity verified successfully!');
      
      // Auto login after success
      setTimeout(async () => {
        try {
          const emailForLogin = tab === 'register' ? registerForm.email : forgotForm.email;
          const pwdForLogin = tab === 'register' ? registerForm.password : forgotForm.password;
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailForLogin, password: pwdForLogin }),
          }).then(r => r.json());

          if (res.success && res.data) {
            loginUser({ ...res.data.user, token: res.data.token });
            closeAuthModal();
          } else {
            setAuthModal({ isOpen: true, tab: 'login' });
          }
        } catch (e) {
          setAuthModal({ isOpen: true, tab: 'login' });
        }
      }, 2500);
    }, 1500);
  };

  // Forgot Password verification handler
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(forgotForm.email)) {
      setErrors({ email: 'Enter a valid email address' });
      setTouched({ email: true });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotForm.email }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Forgot password failed.');
      }

      setSubStep('otp');
      toast.success('Simulation OTP code sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Reset check failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password update handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotForm.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (forgotForm.password !== forgotForm.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotForm.email, password: forgotForm.password }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Password update failed.');
      }

      setSubStep('success');
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 border border-[#E5E7EB] w-full max-w-lg rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col p-6 md:p-8 animate-scale-up text-brand-dark">
        {/* Top Header with Cancel */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGO AND BRANDING */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <img src="/images/logo.png" alt="3Pahia Logo" className="h-10 w-auto object-contain mb-1.5" />
          <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400">
            Premium Automotive Portal
          </span>
        </div>

        {/* ---------------------------------------------------- */}
        {/* LOGIN SCREEN */}
        {/* ---------------------------------------------------- */}
        {tab === 'login' && subStep === 'form' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-black text-brand-dark">Welcome Back</h3>
              <p className="text-xs text-gray-400 font-medium">Log in to manage your commercial fleets, quotes, and leads.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="name@fleetowner.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthModal({ isOpen: true, tab: 'forgot' })}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-[#E5E7EB] rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                    className="w-4 h-4 accent-primary border-[#E5E7EB] rounded"
                  />
                  Remember Me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C2410C] hover:bg-[#EA580C] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Sign In to Account <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </form>

            <div className="relative flex py-2 items-center text-xs font-bold text-gray-400 uppercase">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4">or connect with</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toast.success('Google login simulated (Frontend only).')}
                className="border border-[#E5E7EB] hover:bg-gray-50 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 0 12 0 7.35 0 3.37 2.67 1.39 6.56l3.86 3c.96-2.88 3.66-4.96 6.75-4.96z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.86 3c2.26-2.09 3.57-5.16 3.57-8.73z"/>
                  <path fill="#FBBC05" d="M5.25 14.44c-.25-.75-.39-1.56-.39-2.44s.14-1.69.39-2.44l-3.86-3C.56 8.12 0 9.99 0 12s.56 3.88 1.39 5.44l3.86-3z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.86-3c-1.08.72-2.48 1.16-4.1 1.16-3.09 0-5.79-2.08-6.75-4.96l-3.86 3C3.37 21.33 7.35 24 12 24z"/>
                </svg>
                Google
              </button>
              <button
                onClick={() => toast.success('OTP Login simulated.')}
                className="border border-[#E5E7EB] hover:bg-gray-50 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-gray-400" />
                Phone Number
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-gray-500 font-medium">Don't have an account? </span>
              <button
                onClick={() => setAuthModal({ isOpen: true, tab: 'register' })}
                className="text-xs text-primary font-black hover:underline"
              >
                Create one
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REGISTRATION SCREEN */}
        {/* ---------------------------------------------------- */}
        {tab === 'register' && subStep === 'form' && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div>
              <h3 className="text-xl font-black text-brand-dark">Create Account</h3>
              <p className="text-xs text-gray-400 font-medium font-display">Join India's leading Three-Wheeler logistics marketplace.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={registerForm.firstName}
                    onBlur={() => handleBlur('firstName')}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    placeholder="e.g. Saurabh"
                    className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                      touched.firstName && !registerForm.firstName.trim() ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                    }`}
                  />
                  {touched.firstName && !registerForm.firstName.trim() && (
                    <span className="text-[9.5px] text-red-500 font-bold mt-1 block">First Name is required</span>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={registerForm.lastName}
                    onBlur={() => handleBlur('lastName')}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    placeholder="e.g. Kumar"
                    className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                      touched.lastName && !registerForm.lastName.trim() ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                    }`}
                  />
                  {touched.lastName && !registerForm.lastName.trim() && (
                    <span className="text-[9.5px] text-red-500 font-bold mt-1 block">Last Name is required</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onBlur={() => handleBlur('email')}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="name@fleetcompany.com"
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                      touched.email && !validateEmail(registerForm.email) ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                    }`}
                  />
                </div>
                {touched.email && !validateEmail(registerForm.email) && (
                  <span className="text-[9.5px] text-red-500 font-bold mt-1 block">Enter a valid email address</span>
                )}
                {touched.email && validateEmail(registerForm.email) && (
                  <span className="text-[9.5px] text-green-600 font-bold mt-1 block">✓ Email address is valid</span>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    required
                    value={registerForm.phone}
                    onBlur={() => handleBlur('phone')}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="10-digit phone number"
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                      touched.phone && !validatePhone(registerForm.phone) ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                    }`}
                  />
                </div>
                {touched.phone && !validatePhone(registerForm.phone) && (
                  <span className="text-[9.5px] text-red-500 font-bold mt-1 block">Mobile must be exactly 10 digits</span>
                )}
                {touched.phone && validatePhone(registerForm.phone) && (
                  <span className="text-[9.5px] text-green-600 font-bold mt-1 block">✓ Mobile format verified</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={registerForm.password}
                      onBlur={() => handleBlur('password')}
                      onChange={(e) => {
                        setRegisterForm({ ...registerForm, password: e.target.value });
                        calculatePasswordStrength(e.target.value);
                      }}
                      placeholder="Min 6 chars"
                      className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                        touched.password && registerForm.password.length < 6 ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {/* Strength Indicator */}
                  {registerForm.password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${pwdStrength.color} transition-all`} style={{ width: `${(pwdStrength.score / 5) * 100}%` }}></div>
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 block">Strength: <strong className="text-slate-700">{pwdStrength.label}</strong></span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={registerForm.confirmPassword}
                    onBlur={() => handleBlur('confirmPassword')}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold transition-colors ${
                      touched.confirmPassword && registerForm.password !== registerForm.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-[#E5E7EB] focus:border-primary'
                    }`}
                  />
                  {touched.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                    <span className="text-[9.5px] text-red-500 font-bold mt-1 block">Passwords do not match</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input
                      type="text"
                      required
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] focus:border-primary rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={registerForm.state}
                    onChange={(e) => setRegisterForm({ ...registerForm, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 border border-[#E5E7EB] focus:border-primary rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-gray-500 font-semibold cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={registerForm.agree}
                  onChange={(e) => setRegisterForm({ ...registerForm, agree: e.target.checked })}
                  className="w-4.5 h-4.5 mt-0.5 accent-primary border-[#E5E7EB] rounded"
                />
                <span>I agree to the Terms & Privacy Policy</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C2410C] hover:bg-[#EA580C] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Create Account <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-gray-500 font-medium font-display">Already have an account? </span>
              <button
                onClick={() => setAuthModal({ isOpen: true, tab: 'login' })}
                className="text-xs text-primary font-black hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* OTP VERIFICATION CONTAINER */}
        {/* ---------------------------------------------------- */}
        {(subStep === 'otp' && (tab === 'register' || tab === 'forgot')) && (
          <div className="text-center space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-brand-dark">OTP Verification</h3>
              <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                We've sent a 6-digit security code to your registered mobile and email. Please verify code to continue.
              </p>
            </div>

            {/* Simulated default value banner for easy testing */}
            <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-[10px] text-gray-500 font-semibold tracking-wide inline-block">
              Simulated OTP: <strong className="text-primary font-extrabold text-xs ml-1">123456</strong>
            </div>

            {/* OTP Boxes Grid */}
            <div className="flex justify-center gap-2 md:gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpRefs[idx]}
                  type="text"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-12 border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl text-center font-black text-lg outline-none bg-gray-50 transition-all focus:bg-white"
                />
              ))}
            </div>

            {/* Resend details */}
            <div className="text-xs font-semibold text-gray-400">
              {otpTimer > 0 ? (
                <span>Resend code in <strong className="text-brand-dark">{otpTimer}s</strong></span>
              ) : (
                <button
                  onClick={() => {
                    setOtpTimer(30);
                    toast.success('Simulation OTP sent again.');
                  }}
                  className="text-primary hover:underline font-extrabold"
                >
                  Resend OTP Code
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSubStep('form')}
                className="flex-1 border border-brand-border hover:bg-gray-50 py-3 rounded-xl text-xs font-extrabold transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="flex-grow bg-[#C2410C] hover:bg-[#EA580C] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Verify & Continue'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUCCESS CHECK SCREEN */}
        {/* ---------------------------------------------------- */}
        {subStep === 'success' && (
          <div className="text-center py-10 space-y-6">
            {/* Animated Success Ring */}
            <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 text-brand-green flex items-center justify-center mx-auto shadow-inner text-3xl animate-bounce-short">
              <Check className="w-10 h-10 text-green-600 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-brand-dark">
                {tab === 'register' ? 'Registration Complete' : 'Password Updated'}
              </h3>
              <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                {tab === 'register'
                  ? 'Your 3Pahia account has been successfully verified. Logging you in...'
                  : 'Your account security credentials were successfully modified. You may sign in.'}
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* FORGOT PASSWORD MODALS */}
        {/* ---------------------------------------------------- */}
        {tab === 'forgot' && subStep === 'email' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-black text-brand-dark">Account Recovery</h3>
              <p className="text-xs text-gray-400 font-medium font-display">Enter your email address to recover your 3Pahia account credentials.</p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={forgotForm.email}
                    onBlur={() => handleBlur('email')}
                    onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                    placeholder="name@fleetcompany.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] focus:border-primary rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold"
                  />
                </div>
                {touched.email && !validateEmail(forgotForm.email) && (
                  <span className="text-[9.5px] text-red-500 font-bold mt-1 block">Enter a valid email address</span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAuthModal({ isOpen: true, tab: 'login' })}
                  className="flex-1 border border-brand-border hover:bg-gray-50 py-3 rounded-xl text-xs font-extrabold transition-colors"
                >
                  Return to Login
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow bg-[#C2410C] hover:bg-[#EA580C] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Send Recovery OTP <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === 'forgot' && subStep === 'otp' && (
          <div className="text-center space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-brand-dark">Verification OTP</h3>
              <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                Please enter the 6-digit code sent to <strong>{forgotForm.email}</strong> to verify recovery ownership.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-[10px] text-gray-500 font-semibold tracking-wide inline-block">
              Simulated OTP: <strong className="text-primary font-extrabold text-xs ml-1">123456</strong>
            </div>

            <div className="flex justify-center gap-2 md:gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpRefs[idx]}
                  type="text"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-12 border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl text-center font-black text-lg outline-none bg-gray-50 transition-all focus:bg-white"
                />
              ))}
            </div>

            <div className="text-xs font-semibold text-gray-400">
              {otpTimer > 0 ? (
                <span>Resend code in <strong className="text-brand-dark">{otpTimer}s</strong></span>
              ) : (
                <button
                  onClick={() => {
                    setOtpTimer(30);
                    toast.success('Simulation OTP sent again.');
                  }}
                  className="text-primary hover:underline font-extrabold"
                >
                  Resend OTP Code
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSubStep('email')}
                className="flex-1 border border-brand-border hover:bg-gray-50 py-3 rounded-xl text-xs font-extrabold transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  const fullOtp = otpDigits.join('');
                  if (fullOtp.length < 6) {
                    toast.error('Please enter the full 6-digit OTP code.');
                    return;
                  }
                  // Proceed to set new password
                  setSubStep('newpwd');
                  setOtpDigits(['', '', '', '', '', '']);
                }}
                className="flex-grow bg-[#C2410C] hover:bg-[#EA580C] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center"
              >
                Verify Code
              </button>
            </div>
          </div>
        )}

        {tab === 'forgot' && subStep === 'newpwd' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-black text-brand-dark">Set New Password</h3>
              <p className="text-xs text-gray-400 font-medium">Please enter a new strong password for your verified account.</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={forgotForm.password}
                    onChange={(e) => {
                      setForgotForm({ ...forgotForm, password: e.target.value });
                      calculatePasswordStrength(e.target.value);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-[#E5E7EB] focus:border-primary rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength Meter */}
                {forgotForm.password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${pwdStrength.color} transition-all`} style={{ width: `${(pwdStrength.score / 5) * 100}%` }}></div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 block">Strength: <strong className="text-slate-700">{pwdStrength.label}</strong></span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    required
                    value={forgotForm.confirmPassword}
                    onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-[#E5E7EB] focus:border-primary rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C2410C] hover:bg-[#EA580C] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Update Security Password <Check className="w-3.5 h-3.5" /></>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
