import { Navbar } from '@/components/Navbar';
import prisma from '@/lib/prisma';
import { OrderListClient } from '@/components/OrderListClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const dbOrders = await prisma.order.findMany({
    orderBy: {
      orderDate: 'desc'
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
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

        <OrderListClient orders={dbOrders} />
      </main>
    </div>
  );
}
