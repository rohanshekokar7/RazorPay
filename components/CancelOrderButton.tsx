'use client';

import { useState } from 'react';
import { Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CancelOrderButton({ orderId, orderDate }: { orderId: string, orderDate: string }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  // Check if within 7 days
  const now = new Date();
  const date = new Date(orderDate);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const canCancel = diffDays <= 7;

  const handleCancel = async () => {
    setShowConfirmModal(false);
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (res.ok) {
        router.refresh();
      } else {
        alert(`Failed to cancel: ${data.error}`);
      }
    } catch (error) {
      alert('An error occurred while cancelling.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!canCancel) {
    return <span className="text-xs text-gray-500">Cannot cancel (past 7 days)</span>;
  }

  return (
    <>
      <button
        onClick={() => setShowConfirmModal(true)}
        disabled={isCancelling}
        className="w-full justify-center inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-full shadow-sm transition-colors disabled:opacity-50"
      >
        {isCancelling ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
        Cancel Order
      </button>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cancel Order Confirmation</h3>
              <p className="text-gray-600 text-sm">
                Are you absolutely sure you want to cancel order <strong>#{orderId.substring(0, 8).toUpperCase()}</strong>? 
                This action cannot be undone and your refund will take 3-5 business days to process.
              </p>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Order
              </button>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
