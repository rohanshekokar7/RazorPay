import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const dbOrders = await prisma.order.findMany({
    orderBy: {
      orderDate: 'desc'
    }
  });

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

        {dbOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't placed any orders using the autonomous agent.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {dbOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 flex flex-wrap gap-y-2 justify-between text-sm text-gray-500">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="uppercase text-xs font-semibold mb-0.5">Order Placed</span>
                      <span className="text-gray-900">{order.orderDate.toLocaleDateString()}</span>
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
                      <a href="#" className="text-blue-600 hover:underline hover:text-orange-700">View order details</a>
                      <span className="text-gray-300">|</span>
                      <a href="#" className="text-blue-600 hover:underline hover:text-orange-700">Invoice</a>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${order.status === 'Delivered' ? 'text-gray-900' : order.status === 'Cancelled' ? 'text-red-700' : 'text-green-700'}`}>
                      {order.status === 'Cancelled' 
                        ? 'Cancelled' 
                        : order.status === 'Delivered' 
                          ? 'Delivered' 
                          : `Arriving by ${order.expectedDeliveryDate ? order.expectedDeliveryDate.toLocaleDateString() : 'TBD'}`
                      }
                    </h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-6 mb-4">
                    <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center text-4xl shrink-0">
                      📦
                    </div>
                    <div className="flex-1">
                      <Link href="/" className="text-blue-600 hover:underline hover:text-orange-700 font-medium line-clamp-2 mb-1">
                        {order.itemName}
                      </Link>
                      <p className="text-xs text-gray-500 mb-2">Sold by: Agentic AI Vendor</p>
                      <p className="text-sm font-semibold mb-2">₹{order.amount.toFixed(2)}</p>
                      
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
                      
                      {order.status !== 'Cancelled' ? (
                        <CancelOrderButton orderId={order.id} orderDate={order.orderDate.toISOString()} />
                      ) : (
                        <span className="w-full text-center text-red-600 text-sm font-medium mt-2">Order Cancelled</span>
                      )}
                      
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
