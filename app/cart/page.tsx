'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import Script from 'next/script';
import { useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Create order on the backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: cartTotal }),
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
        name: "Buy BuDDY AI",
        description: "Shopping Cart Checkout",
        order_id: order.id,
        handler: function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          // You can also verify the signature here by calling another backend route if needed
          // After success, maybe clear the cart and redirect
        },
        prefill: {
          name: typeof window !== 'undefined' ? localStorage.getItem('userName') || "" : "",
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* Full Amazon Header */}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left: Cart Items */}
        <div className="flex-1 bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
            <span className="text-gray-500 text-sm">Price</span>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Package className="h-16 w-16 mb-4 text-gray-300" />
              <h2 className="text-xl font-medium text-gray-800">Your Amazon Cart is empty.</h2>
              <p className="mt-2 mb-6">Your shopping cart is waiting. Give it purpose – fill it with groceries, clothing, household supplies, electronics, and more.</p>
              <Link 
                href="/" 
                className="px-6 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 rounded-full font-medium shadow-sm border border-[#FCD200]"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="w-32 h-32 bg-gray-50 flex items-center justify-center rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${item.id}/400/300`} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 leading-tight pr-4">{item.name}</h3>
                      <p className="text-xl font-bold text-gray-900 whitespace-nowrap">${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-green-600 mt-1">In Stock</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    
                    <div className="mt-auto pt-4 flex items-center gap-4">
                      <div className="flex items-center bg-gray-100 rounded-full shadow-sm border border-gray-200 overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-200 hover:text-gray-900 font-medium transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-200 hover:text-gray-900 font-medium transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-blue-600 hover:text-orange-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {cart.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-right">
              <p className="text-lg font-medium text-gray-900">
                Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items): <span className="font-bold text-xl">${cartTotal.toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Right: Checkout Sidebar */}
        {cart.length > 0 && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white p-5 rounded shadow-sm border border-gray-200 sticky top-6">
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-lg text-gray-900">
                  Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items): <span className="font-bold text-xl">${cartTotal.toFixed(2)}</span>
                </p>
                <div className="flex items-start gap-2 mt-2">
                  <div className="mt-0.5 rounded-full bg-green-100 p-1 flex-shrink-0">
                    <svg className="w-3 h-3 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="text-xs text-green-700 font-medium">Your order is eligible for FREE Delivery.</span>
                </div>
              </div>
              
              <button 
                disabled={isProcessing}
                onClick={handlePayment}
                className="w-full py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] disabled:bg-gray-300 disabled:text-gray-500 text-gray-900 rounded-full font-medium shadow-sm transition-colors border border-[#FCD200] disabled:border-gray-300 text-sm mb-3 flex items-center justify-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? 'Processing...' : 'Proceed to Buy'}
              </button>
              
              <Link 
                href="/"
                className="flex items-center justify-center gap-1 w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Continue Shopping
              </Link>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2 font-medium">Or let AI handle it for you!</p>
                <Link 
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-medium shadow-md transition-colors text-sm"
                >
                  ✨ Ask AI to Buy
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
