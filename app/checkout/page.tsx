'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CreditCard, Wallet, Building2, CheckCircle2, ChevronRight } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const shipping = cartTotal > 0 ? (cartTotal > 500 ? 0 : 25) : 0;
  const tax = cartTotal * 0.1; // 10% tax
  const finalTotal = cartTotal + shipping + tax;

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    router.push('/payment');
  };

  if (cart.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/" className="px-6 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 rounded-full font-medium shadow-sm border border-[#FCD200]">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Navbar />

      {/* Steps Tracker */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center w-full max-w-2xl">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-1">
                ✓
              </div>
              <span className="text-sm font-medium text-blue-600">Address</span>
            </div>
            
            <div className="h-0.5 flex-1 bg-blue-600 mx-2"></div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-1">
                2
              </div>
              <span className="text-sm font-medium text-gray-900">Order Summary</span>
            </div>
            
            <div className="h-0.5 flex-1 bg-gray-300 mx-2"></div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center font-bold text-sm mb-1">
                3
              </div>
              <span className="text-sm font-medium text-gray-400">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:py-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Details */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Delivery Address */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium text-sm mb-1">Deliver to:</span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-lg">John Doe</span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">WORK</span>
                  </div>
                  <p className="text-sm text-gray-700">123 Commerce St, Suite 100, New York, NY 10001</p>
                  <p className="text-sm text-gray-700 mt-1">9876543210</p>
                </div>
              </div>
              <button className="text-blue-600 text-sm font-medium border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-50 transition-colors">
                Change
              </button>
            </div>
          </div>

          {/* Review Items */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
            </div>
            
            <div className="flex flex-col">
              {cart.map(item => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row gap-6 border-b border-gray-100 last:border-b-0">
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 flex items-center justify-center border border-gray-200 flex-shrink-0">
                    <img src={`https://picsum.photos/seed/${item.id}/200/200`} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900 leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">Seller: Amazon Retail</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      <div className="border border-gray-300 rounded px-2 py-1 flex items-center gap-2 bg-gray-50 cursor-not-allowed">
                        <span className="text-sm font-medium text-gray-700">Qty: {item.quantity}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temporary note since we don't have a multi-page checkout in this demo */}
          <p className="text-xs text-gray-500 px-2">
            By continuing with the order, you confirm that you agree to Amazon's <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>

        </div>

        {/* Right Column: Price Details */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 sticky top-6">
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm">Price Details</h3>
            </div>
            
            <div className="p-4 flex flex-col gap-4 text-sm text-gray-800">
              <div className="flex justify-between items-center">
                <span>Price ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Delivery Charges</span>
                <span className="text-green-600">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-dashed border-gray-300 my-1"></div>
              
              <div className="flex justify-between items-center font-bold text-gray-900 text-lg">
                <span>Total Amount</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-dashed border-gray-300 my-1"></div>

              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <span className="font-bold text-gray-900">${finalTotal.toFixed(2)}</span>
                <span className="text-gray-400 text-xs">ⓘ</span>
              </div>
              
              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-3 mt-2 bg-[#ffd814] hover:bg-[#f7ca00] disabled:bg-gray-200 disabled:text-gray-500 text-gray-900 rounded font-bold shadow-sm transition-colors border border-[#FCD200] disabled:border-gray-200 text-base flex justify-center items-center"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
}
