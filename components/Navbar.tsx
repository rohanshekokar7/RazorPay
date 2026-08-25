'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, MapPin, Search, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  globalSearch?: string;
  setGlobalSearch?: (val: string) => void;
}

export function Navbar({ globalSearch = '', setGlobalSearch }: NavbarProps) {
  const router = useRouter();
  const { cart } = useCart();
  const [userName, setUserName] = useState<string | null>(null);
  
  const [location, setLocation] = useState('New York 10001');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState('');

  const handleCategoryClick = (category: string) => {
    if (setGlobalSearch) {
      setGlobalSearch(category);
    } else {
      router.push(`/?q=${encodeURIComponent(category)}`);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  return (
    <>
      <header className="flex-none flex flex-col z-10 w-full text-white">
        {/* Top Navbar Row */}
        <div className="bg-slate-900 px-4 py-2 flex items-center gap-6">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center hover:outline hover:outline-1 hover:outline-white p-1 rounded-md cursor-pointer transition-all">
            <img 
              src="/images/logo-full.png" 
              alt="Buy BuDDY AI" 
              className="h-10 object-contain mix-blend-screen" 
              style={{ filter: "brightness(20) contrast(1.2)" }}
            />
          </Link>

          {/* Location Area */}
          <div 
            onClick={() => {
              setTempLocation(location);
              setShowLocationModal(true);
            }}
            className="hidden md:flex items-center gap-1 hover:outline hover:outline-1 hover:outline-white p-1.5 rounded-sm cursor-pointer transition-all"
          >
            <MapPin className="h-5 w-5 mt-3 text-white" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-gray-300">Delivering to {location}</span>
              <span className="text-sm font-bold">Update location</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center h-10 rounded-md overflow-hidden mx-4 focus-within:ring-2 focus-within:ring-[#f3a847] bg-white">
            <button className="bg-[#f3f3f3] hover:bg-[#e3e3e3] text-[#555] px-3 h-full text-sm font-medium border-r border-[#cdcdcd] flex items-center gap-1.5 transition-colors">
              All 
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 mt-0.5">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>
            <input 
              type="text" 
              placeholder="Search Amazon.in"
              value={globalSearch}
              onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
              className="flex-1 h-full px-3 text-[#111] placeholder:text-[#767676] focus:outline-none text-[15px]"
            />
            <button className="bg-[#febd69] hover:bg-[#f3a847] w-11 h-full flex items-center justify-center transition-colors">
              <Search className="h-[22px] w-[22px] text-[#333]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Account Area */}
          <Link 
            href="/login"
            className="hidden lg:flex flex-col leading-tight hover:outline hover:outline-1 hover:outline-white p-1.5 rounded-sm cursor-pointer transition-all"
          >
            <span className="text-xs">Hello, {userName ? userName : 'sign in'}</span>
            <span className="text-sm font-bold">Account & Lists ▾</span>
          </Link>


          {/* Cart */}
          <Link href="/cart" className="flex items-end hover:outline hover:outline-1 hover:outline-white p-1.5 rounded-sm cursor-pointer transition-all">
            <div className="relative">
              <ShoppingCart className="h-8 w-8" />
              <span className="absolute -top-1 left-3 text-[#f3a847] font-bold">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </div>
            <span className="text-sm font-bold hidden sm:inline mb-1 ml-1">Cart</span>
          </Link>
        </div>

        {/* Bottom Navbar Row */}
        <div className="bg-slate-800 px-8 py-2 flex items-center justify-between w-full text-sm font-medium overflow-x-auto whitespace-nowrap hide-scrollbar">
          <div 
            onClick={() => handleCategoryClick('')}
            className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all"
          >
            <Menu className="h-5 w-5" />
            <span>All</span>
          </div>
          <span onClick={() => handleCategoryClick('Bestsellers')} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">Bestsellers</span>
          <span onClick={() => handleCategoryClick("Today's Deals")} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">Today's Deals</span>
          <span onClick={() => handleCategoryClick('Customer Service')} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">Customer Service</span>
          <span onClick={() => handleCategoryClick('Mobiles')} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">Mobiles</span>
          <span onClick={() => handleCategoryClick('New Releases')} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">New Releases</span>

          <span onClick={() => handleCategoryClick('Electronics')} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">Electronics</span>
          <span onClick={() => handleCategoryClick('Home & Kitchen')} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">Home & Kitchen</span>
          <span onClick={() => handleCategoryClick('Fashion')} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">Fashion</span>
          <span onClick={() => handleCategoryClick('Computers')} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">Computers</span>
          <span onClick={() => handleCategoryClick('Beauty')} className="hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all">Beauty & Personal Care</span>
        </div>
      </header>

      {/* Location Modal Overlay */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gray-100 border-b border-gray-200 px-5 py-3 font-bold text-gray-900 flex justify-between items-center">
              Choose your location
              <button onClick={() => setShowLocationModal(false)} className="text-gray-500 hover:text-black">
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Delivery options and delivery speeds may vary for different locations.
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900">Enter a US zip code or city</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tempLocation}
                    onChange={(e) => setTempLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setLocation(tempLocation);
                        setShowLocationModal(false);
                      }
                    }}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f3a847] focus:border-transparent text-gray-900"
                    placeholder="e.g. 10001"
                  />
                  <button 
                    onClick={() => {
                      setLocation(tempLocation);
                      setShowLocationModal(false);
                    }}
                    className="px-5 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 font-medium hover:bg-gray-50 shadow-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
