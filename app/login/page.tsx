'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import AcidSquares from '@/components/AcidSquares';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      if (!isLogin && password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      // Simulate login/signup by storing name in localStorage and navigating back to home
      const displayName = isLogin ? email.split('@')[0] : name || email.split('@')[0];
      localStorage.setItem('userName', displayName);
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 font-sans bg-gray-50 overflow-hidden">
      
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
          <Link href="/" className="mb-6 flex items-center justify-center h-12 w-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
            <span className="text-2xl font-bold tracking-tight text-white">a</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-500 text-center">
            {isLogin ? 'Please enter your details to sign in to your account.' : 'Enter your details below to get started.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
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

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-sm font-semibold shadow-md shadow-blue-600/20 transition-all mt-2"
          >
            {isLogin ? 'Sign in' : 'Sign up'}
          </button>

          <div className="flex justify-center mt-4">
            <span className="text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
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
