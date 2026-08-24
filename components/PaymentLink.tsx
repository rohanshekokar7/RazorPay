'use client';

import { ExternalLink, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentLinkProps {
  url: string;
  amount: number;
  title: string;
}

export function PaymentLink({ url, amount, title }: PaymentLinkProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mt-4 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm ring-1 ring-black/5"
    >
      <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm font-medium text-gray-500">₹{amount.toFixed(2)}</p>
        </div>
      </div>
      <div className="bg-gray-50 p-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
        >
          Pay Now
          <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        <p className="mt-3 text-center text-xs text-gray-400">
          Secured by Razorpay (Test Mode)
        </p>
      </div>
    </motion.div>
  );
}
