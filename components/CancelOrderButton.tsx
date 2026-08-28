'use client';

import { useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CancelOrderButton({ orderId, orderDate }: { orderId: string, orderDate: string }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  // Check if within 7 days
  const now = new Date();
  const date = new Date(orderDate);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const canCancel = diffDays <= 7;

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (res.ok) {
        // Redirect to chatbot to ask for cancellation feedback
        router.push('/agent?cancel_feedback=true');
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
    <button
      onClick={handleCancel}
      disabled={isCancelling}
      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
    >
      {isCancelling ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
      Cancel Order
    </button>
  );
}
