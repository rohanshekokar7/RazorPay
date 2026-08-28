'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, MapPin, Search, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  globalSearch?: string;
  setGlobalSearch?: (val: string) => void;
  activeCategory?: string;
  setActiveCategory?: (val: string) => void;
}

export function Navbar({ globalSearch = '', setGlobalSearch, activeCategory = '', setActiveCategory }: NavbarProps) {
  const router = useRouter();
  const { cart } = useCart();
  const [userName, setUserName] = useState<string | null>(null);
  
  const [location, setLocation] = useState('New York 10001');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState('');

  const handleCategoryClick = (category: string) => {
    if (setActiveCategory && setGlobalSearch) {
      setActiveCategory(category);
      setGlobalSearch(''); // Clear global search when a category is clicked
    } else {
      router.push(`/?c=${encodeURIComponent(category)}`);
    }
  };

  const handleSearchChange = (val: string) => {
    if (setGlobalSearch) setGlobalSearch(val);
    if (setActiveCategory) setActiveCategory(''); // Clear active category when typing search
  };

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setTempLocation("Locating...");
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        const city = data.address.city || data.address.town || data.address.village || data.address.county || "";
        const postcode = data.address.postcode || "";
        const locationString = `${city} ${postcode}`.trim() || "Unknown Location";
        
        setTempLocation(locationString);
        setLocation(locationString);
        localStorage.setItem('userLocation', locationString);
        setShowLocationModal(false);
      } catch (error) {
        console.error("Error fetching location:", error);
        setTempLocation("");
        alert("Could not fetch location details");
      }
    }, (error) => {
      console.error("Geolocation error:", error);
      setTempLocation("");
      alert("Please allow location access to use this feature");
    });
  };

  return (
    <>
      <header className="flex-none flex flex-col z-10 w-full text-white">
        {/* Top Navbar Row */}
        <div className="bg-zinc-950 px-4 py-3 flex items-center gap-6 border-b border-zinc-800 shadow-sm">
          
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
          <div className="flex-1 flex items-center h-10 rounded-md overflow-hidden mx-4 focus-within:ring-2 focus-within:ring-cyan-500 bg-zinc-900 border border-zinc-800">
            <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 h-full text-sm font-medium border-r border-zinc-700 flex items-center gap-1.5 transition-colors">
              All 
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 mt-0.5">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>
            <input 
              type="text" 
              placeholder="Search products..."
              value={globalSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 h-full px-4 text-zinc-100 bg-transparent placeholder:text-zinc-500 focus:outline-none text-[15px]"
            />
            <button className="bg-cyan-500 hover:bg-cyan-400 w-12 h-full flex items-center justify-center transition-colors">
              <Search className="h-[20px] w-[20px] text-zinc-950" strokeWidth={2.5} />
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

          {/* Orders Area */}
          <Link 
            href="/orders"
            className="hidden lg:flex flex-col leading-tight hover:outline hover:outline-1 hover:outline-white p-1.5 rounded-sm cursor-pointer transition-all justify-center"
          >
            <span className="text-xs">Returns</span>
            <span className="text-sm font-bold">& Orders</span>
          </Link>


          {/* Cart */}
          <Link href="/cart" className="flex items-end hover:outline hover:outline-1 hover:outline-white p-1.5 rounded-sm cursor-pointer transition-all">
            <div className="relative">
              <ShoppingCart className="h-7 w-7 text-zinc-100" strokeWidth={1.8} />
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-zinc-950">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </div>
            <span className="text-sm font-bold hidden sm:inline mb-1 ml-1">Cart</span>
          </Link>
        </div>

        {/* Bottom Navbar Row */}
        <div className="bg-zinc-900 px-8 py-2.5 flex items-center justify-between w-full text-sm font-medium text-zinc-300 overflow-x-auto whitespace-nowrap hide-scrollbar shadow-sm">
          <div 
            onClick={() => handleCategoryClick('')}
            className={`flex items-center gap-1 hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all ${!activeCategory ? 'text-cyan-400 font-bold' : ''}`}
          >
            <Menu className="h-5 w-5" />
            <span>All</span>
          </div>
          {['Footwear', 'Clothing', 'Watches', 'Jewellery', 'Sports & Fitness', 'Home Furnishing', 'Pens & Stationery', 'Bags, Wallets & Belts'].map(cat => (
            <span 
              key={cat}
              onClick={() => handleCategoryClick(cat)} 
              className={`hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all ${activeCategory === cat ? 'text-cyan-400 font-bold' : ''}`}
            >
              {cat}
            </span>
          ))}
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
                      if (tempLocation && tempLocation !== "Locating...") {
                        setLocation(tempLocation);
                        localStorage.setItem('userLocation', tempLocation);
                        setShowLocationModal(false);
                      }
                    }}
                    className="px-5 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 font-medium hover:bg-gray-50 shadow-sm"
                  >
                    Apply
                  </button>
                </div>
                
                <div className="flex items-center gap-2 my-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs text-gray-500 font-medium uppercase">Or</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                <button 
                  onClick={handleUseCurrentLocation}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded text-sm font-semibold transition-colors"
                >
                  Use my current location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
