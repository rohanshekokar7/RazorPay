'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AcidSquares from '@/components/AcidSquares';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP states
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    if (auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });
    }
  }, []);

  const handleSendOtp = async () => {
    if (!auth) {
      alert("Firebase is not configured! Please add your Firebase credentials to the .env file as instructed.");
      return;
    }
    
    if (!phone) {
      alert("Please enter a valid phone number with country code (e.g. +1234567890)");
      return;
    }
    
    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`; // default to +91 if no country code (example)
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      alert("OTP sent to your phone!");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      alert(error.message || "Failed to send OTP. Make sure to include country code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndSignup = async () => {
    if (!otp || !confirmationResult) return;
    
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      
      // OTP Verified successfully!
      // Here you would typically call your backend API to save the user in Postgres
      /*
      await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password })
      });
      */
      
      const displayName = name || email.split('@')[0];
      localStorage.setItem('userName', displayName);
      alert("Phone verified successfully! Account created.");
      router.push('/');
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Handle Login
      if (email) {
        const displayName = email.split('@')[0];
        localStorage.setItem('userName', displayName);
        router.push('/');
      }
    } else {
      // Handle Signup
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      
      // If OTP is already sent, verify it
      if (isOtpSent) {
        await handleVerifyOtpAndSignup();
      } else {
        // Otherwise, send OTP
        await handleSendOtp();
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 font-sans bg-gray-50 overflow-hidden">
      <div id="recaptcha-container"></div>
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 opacity-80">
        <AcidSquares
          color1="#0f172a"
          color2="#2563eb"
          color3="#93c5fd"
          speed={0.4}
          density={12.0}
          brightness={1.2}
        />
      </div>
      
      {/* Modern Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white/80 backdrop-blur-lg rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] p-8 sm:p-10 border border-white/60 transition-all duration-300">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-6 flex items-center justify-center">
            <img 
              src="/images/logo-transparent.png" 
              alt="Buy BuDDY AI" 
              className="h-16 object-contain" 
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-500 text-center">
            {isLogin 
              ? 'Please enter your details to sign in to your account.' 
              : isOtpSent 
                ? 'Enter the OTP sent to your phone number.' 
                : 'Enter your details below to get started.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {!isLogin && isOtpSent ? (
            // OTP Verification Step
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="text-sm font-medium text-gray-700">Enter OTP</label>
              <input 
                type="text" 
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-shadow tracking-widest text-center"
              />
            </div>
          ) : (
            // Regular Login/Signup Fields
            <>
              {/* Name Input (Only for Sign up) */}
              {!isLogin && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-shadow"
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-shadow"
                />
              </div>

              {/* Phone Input (Only for Sign up) */}
              {!isLogin && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-shadow"
                  />
                </div>
              )}

              {/* Password Input */}
              <div className="flex flex-col gap-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  {isLogin && (
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">Forgot password?</a>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-shadow pr-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input (Only for Sign up) */}
              {!isLogin && (
                <div className="flex flex-col gap-1.5 relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-shadow pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-3 text-sm font-semibold shadow-md shadow-blue-600/20 transition-all mt-2 flex justify-center items-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isLogin ? (
              'Sign in'
            ) : isOtpSent ? (
              'Verify OTP & Create Account'
            ) : (
              'Send OTP'
            )}
          </button>

          <div className="flex justify-center mt-4">
            <span className="text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsOtpSent(false); // Reset OTP state when toggling
                }}
                className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </span>
          </div>

        </form>
      </div>

    </div>
  );
}
