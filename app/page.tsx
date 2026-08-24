'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { AuditTrailConsole, AuditLog } from '@/components/AuditTrailConsole';
import { ProductGrid } from '@/components/ProductGrid';
import { Terminal } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  const { cart } = useCart();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [simulatePaymentTick, setSimulatePaymentTick] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [externalMessage, setExternalMessage] = useState<{ text: string; timestamp: number }>();

  const handleLogsReceived = (newLogs: AuditLog[]) => {
    setLogs(prev => [...prev, ...newLogs]);
  };

  const handleSimulatePayment = () => {
    setSimulatePaymentTick(prev => prev + 1);
  };

  return (
    <main className="flex h-screen flex-col bg-gray-100 overflow-hidden">
      {/* Amazon Style Header */}
      <Navbar globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />

      {/* Main Content Area */}
      <div className="flex-1 flex p-4 w-full h-full min-h-0 relative bg-gray-100">
        
        {/* Left Pane: Storefront Product Grid */}
        <section className={`transition-all duration-300 ease-in-out ${showConsole ? 'hidden' : 'hidden lg:flex flex-1 lg:w-[65%] min-w-0 flex-col pr-4'}`}>
          <ProductGrid 
            searchQuery={globalSearch} 
            onAskAi={(text) => setExternalMessage({ text, timestamp: Date.now() })}
          />
        </section>

        {/* Center/Right Pane: Chat Interface */}
        <section className={`flex flex-col min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${showConsole ? 'flex-1' : 'w-full lg:w-[35%] flex-none'}`}>
          <ChatInterface 
             onLogsReceived={handleLogsReceived} 
             simulatePaymentTick={simulatePaymentTick}
             externalMessageTrigger={externalMessage}
          />
        </section>

        {/* Developer Console (Visible in Debug Mode) */}
        {showConsole && (
          <section className="w-1/3 flex-none flex flex-col hidden lg:flex border-l border-gray-200 pl-4">
            <AuditTrailConsole 
               logs={logs} 
               onSimulatePayment={handleSimulatePayment} 
            />
          </section>
        )}
      </div>
    </main>
  );
}
