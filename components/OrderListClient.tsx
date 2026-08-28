'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CancelOrderButton } from './CancelOrderButton';
import { getImageUrl } from '@/lib/getImageUrl';
import { X } from 'lucide-react';

export function OrderListClient({ orders }: { orders: any[] }) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't placed any orders using the autonomous agent.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm p-5">
            <div className="flex flex-wrap gap-y-2 justify-between text-sm text-gray-500 border-b border-gray-100 pb-4 mb-4">
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="uppercase text-xs font-semibold mb-0.5">Order Placed</span>
                  <span className="text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="uppercase text-xs font-semibold mb-0.5">Total</span>
                  <span className="text-gray-900">₹{order.amount.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="uppercase text-xs font-semibold mb-0.5">Ship To</span>
                  <span className="text-blue-600 hover:underline cursor-pointer hover:text-orange-700">Agentic Shopper ▾</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="uppercase text-xs font-semibold mb-0.5">Order # {order.id.substring(0, 8).toUpperCase()}</span>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedProduct(order)} className="text-blue-600 hover:underline hover:text-orange-700">View order details</button>
                  <span className="text-gray-300">|</span>
                  <a href="#" className="text-blue-600 hover:underline hover:text-orange-700">Invoice</a>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${order.status === 'Delivered' ? 'text-gray-900' : order.status === 'Cancelled' ? 'text-red-700' : 'text-green-700'}`}>
                  {order.status === 'Cancelled' 
                    ? 'Cancelled' 
                    : order.status === 'Delivered' 
                      ? 'Delivered' 
                      : `Arriving by ${order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'TBD'}`
                  }
                </h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-4">
                <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                  <img 
                    src={getImageUrl(order.itemName, 96, 96)} 
                    alt={order.itemName} 
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedProduct(order)}
                  />
                </div>
                <div className="flex-1">
                  <button 
                    onClick={() => setSelectedProduct(order)}
                    className="text-blue-600 hover:underline hover:text-orange-700 font-medium line-clamp-2 mb-1 text-left"
                  >
                    {order.itemName}
                  </button>
                  <p className="text-xs text-gray-500 mb-2">Sold by: Agentic AI Vendor</p>
                  <p className="text-sm font-semibold mb-2">₹{order.amount.toFixed(2)}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <button 
                      onClick={() => setSelectedProduct(order)}
                      className="bg-white hover:bg-gray-50 border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-colors"
                    >
                      View your item
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-48 shrink-0">
                  <button className="w-full text-center bg-white hover:bg-gray-50 border border-gray-300 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm transition-colors">
                    Track package
                  </button>
                  
                  {order.status !== 'Cancelled' ? (
                    <CancelOrderButton orderId={order.id} orderDate={new Date(order.orderDate).toISOString()} />
                  ) : (
                    <span className="w-full text-center text-red-600 text-sm font-medium mt-2">Order Cancelled</span>
                  )}
                  
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedProduct.itemName}</h2>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img 
                    src={getImageUrl(selectedProduct.itemName, 800, 800)} 
                    alt={selectedProduct.itemName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">₹{selectedProduct.amount.toFixed(2)}</h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    {selectedProduct.status}
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-600 mb-8">
                  <p>
                    <strong>Order ID:</strong> {selectedProduct.id}
                  </p>
                  <p>
                    <strong>Order Date:</strong> {new Date(selectedProduct.orderDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Expected Delivery:</strong> {selectedProduct.expectedDeliveryDate ? new Date(selectedProduct.expectedDeliveryDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                
                <div className="mt-auto flex gap-3">
                  <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm">
                    Buy it again
                  </button>
                  {selectedProduct.status !== 'Cancelled' && (
                    <button className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm">
                      Track Package
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
