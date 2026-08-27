'use client';

import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function OrdersPage() {
  const orders = [
    {
      id: '112-9384756-1234567',
      placed: 'August 12, 2026',
      total: 1199.99,
      shipTo: 'Agentic Shopper',
      status: 'Delivered',
      deliveryDate: 'Delivered yesterday',
      items: [
        {
          name: 'Samsung Galaxy S24 Ultra (Mobiles)',
          price: 1199.99,
          seller: 'Samsung Electronics',
          returnEligible: 'Return window closed on Sep 12, 2026',
          img: '📱'
        }
      ]
    },
    {
      id: '113-1029384-7654321',
      placed: 'August 5, 2026',
      total: 348.00,
      shipTo: 'Agentic Shopper',
      status: 'Arriving',
      deliveryDate: 'Arriving tomorrow by 8 PM',
      items: [
        {
          name: 'Sony WH-1000XM5 (Electronics)',
          price: 348.00,
          seller: 'Sony Audio',
          returnEligible: 'Eligible for return until Sep 5, 2026',
          img: '🎧'
        }
      ]
    },
    {
      id: '114-8765432-1098765',
      placed: 'July 28, 2026',
      total: 89.99,
      shipTo: 'Agentic Shopper',
      status: 'Delivered',
      deliveryDate: 'Delivered on July 30, 2026',
      items: [
        {
          name: "Today's Deals - Air Fryer",
          price: 89.99,
          seller: 'Home Essentials',
          returnEligible: 'Return window closed on Aug 30, 2026',
          img: '🥘'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar globalSearch="" setGlobalSearch={() => {}} />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-normal">Your Orders</h1>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Search all orders" 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-500 shadow-sm"
            />
            <button className="bg-gray-800 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors">
              Search Orders
            </button>
          </div>
        </div>

        <div className="flex space-x-6 border-b border-gray-200 mb-6">
          <button className="text-sm font-semibold text-orange-700 border-b-2 border-orange-700 pb-2">Orders</button>
          <button className="text-sm font-medium text-blue-600 hover:text-orange-700 hover:underline pb-2">Buy Again</button>
          <button className="text-sm font-medium text-blue-600 hover:text-orange-700 hover:underline pb-2">Not Yet Shipped</button>
          <button className="text-sm font-medium text-blue-600 hover:text-orange-700 hover:underline pb-2">Cancelled Orders</button>
        </div>

        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 flex flex-wrap gap-y-2 justify-between text-sm text-gray-500">
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="uppercase text-xs font-semibold mb-0.5">Order Placed</span>
                    <span className="text-gray-900">{order.placed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase text-xs font-semibold mb-0.5">Total</span>
                    <span className="text-gray-900">₹{order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase text-xs font-semibold mb-0.5">Ship To</span>
                    <span className="text-blue-600 hover:underline cursor-pointer hover:text-orange-700">{order.shipTo} ▾</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="uppercase text-xs font-semibold mb-0.5">Order # {order.id}</span>
                  <div className="flex gap-2">
                    <a href="#" className="text-blue-600 hover:underline hover:text-orange-700">View order details</a>
                    <span className="text-gray-300">|</span>
                    <a href="#" className="text-blue-600 hover:underline hover:text-orange-700">Invoice</a>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className={`text-lg font-bold mb-4 ${order.status === 'Delivered' ? 'text-gray-900' : 'text-green-700'}`}>
                  {order.deliveryDate}
                </h3>
                
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-6 mb-4">
                    <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center text-4xl shrink-0">
                      {item.img}
                    </div>
                    <div className="flex-1">
                      <Link href="/" className="text-blue-600 hover:underline hover:text-orange-700 font-medium line-clamp-2 mb-1">
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-500 mb-2">Sold by: {item.seller}</p>
                      <p className="text-sm font-semibold mb-2">₹{item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <button className="bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-colors">
                          Buy it again
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-colors">
                          View your item
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-48 shrink-0">
                      <button className="w-full text-center bg-white hover:bg-gray-50 border border-gray-300 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm transition-colors">
                        Track package
                      </button>
                      <button className="w-full text-center bg-white hover:bg-gray-50 border border-gray-300 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm transition-colors">
                        Return or replace items
                      </button>
                      <button className="w-full text-center bg-white hover:bg-gray-50 border border-gray-300 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm transition-colors">
                        Share gift receipt
                      </button>
                      <button className="w-full text-center bg-white hover:bg-gray-50 border border-gray-300 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm transition-colors">
                        Write a product review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
