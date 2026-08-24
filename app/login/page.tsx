'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate login by navigating back to home with a query parameter
      router.push(`/?user=${encodeURIComponent(email.split('@')[0])}`);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0A3D73]"
      style={{
        backgroundImage: 'url(/blue_bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8 rounded-[24px] backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        
        {/* Logo area */}
        <div className="flex justify-center mb-10">
          <h2 className="text-white text-[15px] font-semibold tracking-wide">Your logo</h2>
        </div>

        {/* Login Form */}
        <h1 className="text-white text-[22px] font-bold mb-6">Login</h1>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-white text-xs font-medium">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@gmail.com"
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-white text-xs font-medium">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-start mb-2">
            <a href="#" className="text-white text-xs hover:underline">Forgot Password?</a>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#0d2a4a] hover:bg-[#071930] text-white rounded-lg py-3 text-sm font-semibold transition-colors shadow-lg"
          >
            Sign in
          </button>

          <div className="flex items-center justify-center mt-2 mb-2">
            <span className="text-white text-xs">or continue with</span>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-4">
            <button type="button" className="bg-white flex items-center justify-center py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button type="button" className="bg-white flex items-center justify-center py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-black">
              <Github className="w-5 h-5" />
            </button>
            <button type="button" className="bg-white flex items-center justify-center py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-[#1877F2]">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>

          <div className="flex justify-center mt-6">
            <span className="text-white text-xs">
              Don't have an account yet? <a href="#" className="font-bold hover:underline">Register for free</a>
            </span>
          </div>

        </form>
      </div>
    </div>
  );
}
