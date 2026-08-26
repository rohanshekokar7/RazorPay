'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CreditCard, Wallet, Building2, CheckCircle2, ChevronRight } from 'lucide-react';
import Script from 'next/script';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, updateQuantity } = useCart();
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const [address, setAddress] = useState({
    name: 'John Doe',
    type: 'WORK',
    line1: '123 Commerce St, Suite 100',
    cityStateZip: 'New York, NY 10001',
    phone: '9876543210'
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);
  const [isFetchingZip, setIsFetchingZip] = useState(false);

  const fetchPincodeFromCity = async (query: string) => {
    if (!query || query.length < 3) return;
    setIsFetchingZip(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const addressDetails = data[0].address;
        const city = addressDetails.city || addressDetails.town || addressDetails.village || addressDetails.county || query;
        const state = addressDetails.state || '';
        const postcode = addressDetails.postcode || '';
        
        let formatted = city;
        if (state) formatted += `, ${state}`;
        if (postcode) formatted += ` ${postcode}`;
        
        setTempAddress(prev => ({ ...prev, cityStateZip: formatted }));
      }
    } catch (error) {
      console.error("Failed to fetch location details", error);
    } finally {
      setIsFetchingZip(false);
    }
  };

  const shipping = cartTotal > 0 ? (cartTotal > 500 ? 0 : 25) : 0;
  const tax = cartTotal * 0.1; // 10% tax
  const finalTotal = cartTotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Create order on the backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: finalTotal }),
      });

      const order = await res.json();

      if (order.error) {
        alert("Error creating order: " + order.error);
        setIsProcessing(false);
        return;
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use the key from env
        amount: order.amount,
        currency: order.currency,
        name: "Razorpay",
        description: "Order Checkout",
        image: "https://razorpay.com/favicon.png", // Razorpay Logo
        order_id: order.id,
        handler: function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          clearCart();
          router.push('/');
        },
        prefill: {
          name: address.name,
          contact: address.phone,
        },
        theme: {
          color: "#0f172a"
        },
        config: {
          display: {
            blocks: {
              qr: {
                name: "Pay with QR Code",
                instruments: [
                  {
                    method: "upi",
                    flows: ["qr"]
                  }
                ]
              }
            },
            sequence: ["block.qr"],
            preferences: {
              show_default_blocks: true
            }
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
      });
      
      rzp1.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);
      alert("Failed to initialize payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">Your cart is empty</h1>
          <p className="text-zinc-400 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/" className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-full font-bold shadow-sm transition-colors border border-cyan-400">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Navbar />

      {/* Steps Tracker */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center w-full max-w-2xl">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center font-bold text-sm mb-1">
                ✓
              </div>
              <span className="text-sm font-medium text-cyan-400">Address</span>
            </div>
            
            <div className="h-0.5 flex-1 bg-cyan-500 mx-2"></div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center font-bold text-sm mb-1">
                2
              </div>
              <span className="text-sm font-medium text-zinc-100">Order Summary</span>
            </div>
            
            <div className="h-0.5 flex-1 bg-zinc-700 mx-2"></div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full border-2 border-zinc-700 text-zinc-500 flex items-center justify-center font-bold text-sm mb-1">
                3
              </div>
              <span className="text-sm font-medium text-zinc-500">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:py-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Details */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Delivery Address */}
          <div className="bg-zinc-900 rounded-sm shadow-sm border border-zinc-800 overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-zinc-400 font-medium text-sm mb-1">Deliver to:</span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-zinc-100 text-lg">{address.name}</span>
                    <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2 py-0.5 rounded border border-zinc-700">{address.type}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{address.line1}, {address.cityStateZip}</p>
                  <p className="text-sm text-zinc-300 mt-1">{address.phone}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setTempAddress(address);
                  setShowAddressModal(true);
                }}
                className="text-cyan-400 text-sm font-medium border border-zinc-700 px-4 py-1.5 rounded hover:bg-zinc-800 transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          {/* Review Items */}
          <div className="bg-zinc-900 rounded-sm shadow-sm border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-800/50 border-b border-zinc-800 p-4">
              <h2 className="text-lg font-bold text-zinc-100">Order Summary</h2>
            </div>
            
            <div className="flex flex-col">
              {cart.map(item => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row gap-6 border-b border-zinc-800 last:border-b-0">
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-950 flex items-center justify-center border border-zinc-800 flex-shrink-0 rounded">
                    <img src={`https://picsum.photos/seed/${item.id}/200/200`} className="w-full h-full object-cover rounded opacity-90 hover:opacity-100 transition-opacity" alt={item.name} />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-medium text-zinc-100 leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs text-zinc-400 mb-2">Seller: Amazon Retail</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-zinc-100">${item.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      <div className="flex items-center bg-zinc-950 rounded shadow-sm border border-zinc-700 overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="px-3 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 font-medium transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold text-zinc-100 w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 font-medium transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temporary note since we don't have a multi-page checkout in this demo */}
          <p className="text-xs text-zinc-500 px-2">
            By continuing with the order, you confirm that you agree to Amazon's <a href="#" className="text-cyan-500 hover:underline">Terms of Use</a> and <a href="#" className="text-cyan-500 hover:underline">Privacy Policy</a>.
          </p>

        </div>

        {/* Right Column: Price Details */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-zinc-900 rounded-sm shadow-sm border border-zinc-800 sticky top-6">
            <div className="border-b border-zinc-800 p-4">
              <h3 className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Price Details</h3>
            </div>
            
            <div className="p-4 flex flex-col gap-4 text-sm text-zinc-300">
              <div className="flex justify-between items-center">
                <span>Price ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Delivery Charges</span>
                <span className="text-green-500">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-dashed border-zinc-700 my-1"></div>
              
              <div className="flex justify-between items-center font-bold text-zinc-100 text-lg">
                <span>Total Amount</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-dashed border-zinc-700 my-1"></div>

              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <span className="font-bold text-zinc-100">${finalTotal.toFixed(2)}</span>
                <span className="text-zinc-500 text-xs">ⓘ</span>
              </div>
              
              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-3 mt-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 rounded font-bold shadow-sm transition-colors border border-cyan-400 disabled:border-zinc-800 text-base flex justify-center items-center"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-lg w-full max-w-md overflow-hidden shadow-2xl border border-zinc-800">
            <div className="bg-zinc-800/50 border-b border-zinc-800 px-5 py-3 font-bold text-zinc-100 flex justify-between items-center">
              Change Delivery Address
              <button onClick={() => setShowAddressModal(false)} className="text-zinc-500 hover:text-zinc-100 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-zinc-300">Full Name</label>
                <input 
                  type="text" 
                  value={tempAddress.name}
                  onChange={(e) => setTempAddress({...tempAddress, name: e.target.value})}
                  className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-zinc-300">Address Line 1</label>
                <input 
                  type="text" 
                  value={tempAddress.line1}
                  onChange={(e) => setTempAddress({...tempAddress, line1: e.target.value})}
                  className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1 relative">
                <label className="text-sm font-bold text-zinc-300">City (Type & Click Outside for Zip Code)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={tempAddress.cityStateZip}
                    onChange={(e) => setTempAddress({...tempAddress, cityStateZip: e.target.value})}
                    onBlur={(e) => fetchPincodeFromCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-8"
                  />
                  {isFetchingZip && (
                    <div className="absolute right-2 top-2.5 w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-zinc-300">Phone Number</label>
                <input 
                  type="text" 
                  value={tempAddress.phone}
                  onChange={(e) => setTempAddress({...tempAddress, phone: e.target.value})}
                  className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-zinc-300">Address Type</label>
                <select
                  value={tempAddress.type}
                  onChange={(e) => setTempAddress({...tempAddress, type: e.target.value})}
                  className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <button 
                onClick={() => {
                  setAddress(tempAddress);
                  setShowAddressModal(false);
                }}
                className="w-full py-2 mt-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-lg font-bold shadow-sm transition-colors border border-cyan-400 text-sm"
              >
                Use this address
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
