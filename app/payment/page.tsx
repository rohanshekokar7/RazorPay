'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Lock, CreditCard, Banknote, Gift, Calendar, QrCode } from 'lucide-react';

export default function PaymentPage() {
  const { cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [selectedMethod, setSelectedMethod] = useState('upi');

  const shipping = cartTotal > 0 ? (cartTotal > 500 ? 0 : 25) : 0;
  const tax = cartTotal * 0.1;
  const finalTotal = cartTotal + shipping + tax;

  const handleFinishPayment = () => {
    alert('Payment successful! Your order has been placed.');
    clearCart();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      
      {/* Focused Header */}
      <header className="bg-[#131921] px-4 py-3 flex items-center shadow-sm w-full">
        <Link href="/" className="flex items-center hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm cursor-pointer transition-all mx-auto lg:mx-8">
          <span className="text-2xl font-bold tracking-tight text-white">amazon<span className="text-[#febd69]">.in</span></span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex justify-center">
        
        {/* Main Payment Container */}
        <div className="w-full bg-white rounded shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Container Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Complete Payment</h1>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded text-gray-600 text-sm font-medium">
              <Lock className="w-4 h-4" />
              100% Secure
            </div>
          </div>

          {/* Container Body */}
          <div className="flex flex-col lg:flex-row flex-1">
            
            {/* Column 1: Payment Methods List */}
            <div className="w-full lg:w-[30%] border-r border-gray-200 bg-white flex flex-col">
              
              <button 
                onClick={() => setSelectedMethod('upi')}
                className={`flex items-start gap-4 p-4 text-left border-b border-gray-100 transition-colors ${selectedMethod === 'upi' ? 'bg-[#f5faff] border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <QrCode className={`w-6 h-6 mt-0.5 ${selectedMethod === 'upi' ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="flex flex-col">
                  <span className={`font-semibold ${selectedMethod === 'upi' ? 'text-blue-600' : 'text-gray-900'}`}>UPI</span>
                  <span className="text-sm text-gray-500 mt-0.5">Pay by any UPI app</span>
                </div>
              </button>

              <button 
                onClick={() => setSelectedMethod('card')}
                className={`flex items-start gap-4 p-4 text-left border-b border-gray-100 transition-colors ${selectedMethod === 'card' ? 'bg-[#f5faff] border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <CreditCard className={`w-6 h-6 mt-0.5 ${selectedMethod === 'card' ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="flex flex-col">
                  <span className={`font-semibold ${selectedMethod === 'card' ? 'text-blue-600' : 'text-gray-900'}`}>Credit / Debit / ATM Card</span>
                  <span className="text-sm text-gray-500 mt-0.5">Add and secure cards as per RBI guidelines</span>
                  <span className="text-xs text-green-600 font-medium mt-1">Get upto 5% cashback • 2 offers available</span>
                </div>
              </button>

              <button 
                onClick={() => setSelectedMethod('emi')}
                className={`flex items-start gap-4 p-4 text-left border-b border-gray-100 transition-colors ${selectedMethod === 'emi' ? 'bg-[#f5faff] border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <Calendar className={`w-6 h-6 mt-0.5 ${selectedMethod === 'emi' ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="flex flex-col">
                  <span className={`font-semibold ${selectedMethod === 'emi' ? 'text-blue-600' : 'text-gray-900'}`}>EMI</span>
                  <span className="text-sm text-green-600 mt-0.5">Credit Card EMI</span>
                </div>
              </button>

              <button 
                onClick={() => setSelectedMethod('cod')}
                className={`flex items-start gap-4 p-4 text-left border-b border-gray-100 transition-colors ${selectedMethod === 'cod' ? 'bg-[#f5faff] border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <Banknote className={`w-6 h-6 mt-0.5 ${selectedMethod === 'cod' ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="flex flex-col">
                  <span className={`font-semibold ${selectedMethod === 'cod' ? 'text-blue-600' : 'text-gray-900'}`}>Cash on Delivery</span>
                </div>
              </button>

              <button 
                onClick={() => setSelectedMethod('gift')}
                className={`flex items-start gap-4 p-4 text-left border-b border-gray-100 transition-colors ${selectedMethod === 'gift' ? 'bg-[#f5faff] border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <Gift className={`w-6 h-6 mt-0.5 ${selectedMethod === 'gift' ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="flex flex-col">
                  <span className={`font-semibold ${selectedMethod === 'gift' ? 'text-blue-600' : 'text-gray-900'}`}>Have an Amazon Gift Card?</span>
                </div>
              </button>

            </div>

            {/* Column 2: Selected Payment Details */}
            <div className="w-full lg:w-[40%] bg-[#f9fafc] flex items-center justify-center p-8 border-r border-gray-200">
              
              {selectedMethod === 'upi' && (
                <div className="w-full max-w-sm flex flex-col items-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Scan QR and Pay</h2>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8 w-full flex flex-col items-center relative overflow-hidden">
                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Amount</p>
                    <p className="text-2xl font-bold text-gray-900 mb-6">${finalTotal.toFixed(2)}</p>
                    
                    {/* Simulated Blurred QR Code */}
                    <div className="relative w-48 h-48 mb-6 border border-gray-100 rounded-lg p-2 bg-white flex items-center justify-center group cursor-pointer" onClick={handleFinishPayment}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=amazon-order-${finalTotal}`} 
                        alt="QR Code"
                        className="w-full h-full object-contain filter blur-sm transition-all group-hover:blur-0"
                      />
                      <button className="absolute inset-0 m-auto w-32 h-10 bg-white border border-gray-300 rounded font-semibold text-gray-900 shadow-sm opacity-100 group-hover:opacity-0 transition-opacity z-10 flex items-center justify-center pointer-events-none text-sm">
                        Show QR code
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      {/* Fake UPI app icons */}
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">G</div>
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">P</div>
                      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs">P</div>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">U</div>
                    </div>
                    <p className="text-xs text-gray-400">or any other UPI app</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-6 text-center max-w-[250px]">
                    Do not hit back or close this screen until the transaction is complete
                  </p>
                </div>
              )}

              {selectedMethod !== 'upi' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                    <span className="text-2xl">🚧</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Demo Mode</h3>
                  <p className="text-gray-500 text-sm max-w-[250px] mb-6">
                    This is a demo. Please select the UPI option to see the scan interface.
                  </p>
                  <button 
                    onClick={() => setSelectedMethod('upi')}
                    className="px-6 py-2 border border-blue-600 text-blue-600 font-semibold rounded hover:bg-blue-50 transition-colors"
                  >
                    Go to UPI
                  </button>
                </div>
              )}

            </div>

            {/* Column 3: Price Details */}
            <div className="w-full lg:w-[30%] bg-white p-6">
              
              <h3 className="text-gray-500 font-bold text-sm mb-6">Price Details</h3>
              
              <div className="flex flex-col gap-4 text-sm text-gray-800">
                
                <div className="flex justify-between items-center">
                  <span>MRP (incl. of all taxes)</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-gray-500">
                  <span>Fees ▾</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-dashed border-gray-200 my-2"></div>

                <div className="flex justify-between items-center">
                  <span>Discounts ▾</span>
                  <span className="text-green-600">-$0.00</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <div className="bg-[#f0f5ff] rounded p-4 mt-2 flex justify-between items-center font-bold text-blue-700 text-base">
                  <span>Total Amount</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
                
              </div>

              {/* Cashback Banner */}
              <div className="mt-6 bg-[#ebf8f0] rounded p-4 border border-[#c6ecd6]">
                <p className="text-green-700 font-bold text-sm mb-1">5% Cashback</p>
                <p className="text-green-600 text-xs">Claim now with payment offers</p>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
