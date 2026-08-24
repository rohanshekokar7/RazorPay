'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { AuditTrailConsole, AuditLog } from '@/components/AuditTrailConsole';
import { ShoppingBag } from 'lucide-react';

export default function Home() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [simulatePaymentTick, setSimulatePaymentTick] = useState(0);

  const handleLogsReceived = (newLogs: AuditLog[]) => {
    setLogs(prev => [...prev, ...newLogs]);
  };

  const handleSimulatePayment = () => {
    setSimulatePaymentTick(prev => prev + 1);
  };

  return (
    <main className="flex h-screen flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-500/20">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Agentic Commerce</h1>
            <p className="text-sm text-gray-500 font-medium">Conversational Checkout powered by Gemini Pro</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] min-h-0">
        {/* Left Pane: Chat Interface */}
        <section className="flex-1 flex flex-col min-w-0">
          <ChatInterface 
             onLogsReceived={handleLogsReceived} 
             simulatePaymentTick={simulatePaymentTick}
          />
        </section>

        {/* Right Pane: Audit Trail Console */}
        <section className="w-1/3 flex-none flex flex-col hidden lg:flex">
          <AuditTrailConsole 
             logs={logs} 
             onSimulatePayment={handleSimulatePayment} 
          />
        </section>
      </div>
    </main>
  );
}
