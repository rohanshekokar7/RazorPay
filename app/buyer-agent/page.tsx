"use client";

import { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Loader2 } from 'lucide-react';

export default function BuyerAgentSimulator() {
  const [logs, setLogs] = useState<{ id: string, message: string, type: 'info' | 'success' | 'error' }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { id: Math.random().toString(36).substring(7), message, type }]);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]); // clear
    
    try {
      addLog('🤖 [Buyer AI]: Booting up autonomous purchasing sequence...', 'info');
      await sleep(1000);

      // Step 1: Read Catalog
      addLog('🤖 [Buyer AI]: Scanning merchant catalog at /api/agent/catalog...', 'info');
      const catalogRes = await fetch(`/api/agent/catalog`);
      const catalog = await catalogRes.json();
      
      if (!catalog.products || catalog.products.length === 0) {
        addLog('❌ [Buyer AI]: No products found in catalog.', 'error');
        setIsRunning(false);
        return;
      }

      addLog(`📖 [Merchant Data]: Received catalog with ${catalog.products.length} products.`, 'success');
      await sleep(1500);

      // Step 2: Select a product and determine strategy
      // Pick the most expensive product for demonstration
      const targetProduct = catalog.products.reduce((prev: any, current: any) => (prev.price_inr > current.price_inr) ? prev : current);
      addLog(`🤖 [Buyer AI]: Selected target product -> ${targetProduct.name} (Base Price: ₹${targetProduct.price_inr})`, 'info');
      
      let negotiatedPrice = targetProduct.price_inr;
      
      if (targetProduct.negotiation_allowed) {
          addLog(`🤖 [Buyer AI]: Negotiation allowed! Max discount is ${targetProduct.max_discount_percentage}%. Calculating aggressive counter-offer...`, 'info');
          // Request max discount 
          const discount = targetProduct.price_inr * (targetProduct.max_discount_percentage / 100);
          negotiatedPrice = targetProduct.price_inr - discount;
          addLog(`🤖 [Buyer AI]: I will offer ₹${negotiatedPrice.toFixed(2)}.`, 'success');
      } else {
          addLog(`🤖 [Buyer AI]: Negotiation not allowed for this item. Will pay full price.`, 'info');
      }
      
      await sleep(2000);

      // Step 3: Execute Checkout
      addLog('💳 [Buyer AI]: Initiating Razorpay transaction at /api/agent/checkout...', 'info');
      
      const checkoutRes = await fetch(`/api/agent/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_agent_token_123'
        },
        body: JSON.stringify({
          product_id: targetProduct.product_id,
          negotiated_price: negotiatedPrice
        })
      });

      const checkoutData = await checkoutRes.json();

      if (checkoutRes.ok) {
        addLog(`✅ [Buyer AI]: SUCCESS! Transaction approved.`, 'success');
        addLog(`📦 [Buyer AI]: Order ID received: ${checkoutData.order_id}`, 'success');
        addLog(`💰 [Buyer AI]: Final amount charged: ₹${checkoutData.amount}`, 'success');
      } else {
        addLog(`❌ [Buyer AI]: TRANSACTION FAILED.`, 'error');
        addLog(`⚠️ [Error Detail]: ${checkoutData.error || checkoutData.message || 'Unknown Error'}`, 'error');
      }
      
      await sleep(1000);
      addLog('🤖 [Buyer AI]: Autonomous purchasing sequence complete.', 'info');
    } catch (err: any) {
      addLog(`🚨 [Buyer AI]: Simulation crashed: ${err.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8 flex flex-col items-center justify-center font-mono">
      <div className="w-full max-w-4xl bg-gray-900 rounded-lg shadow-2xl border border-gray-800 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-green-400" />
            <h1 className="text-gray-200 font-semibold text-sm tracking-wider">simulate-buyer-agent.js</h1>
          </div>
          <button 
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded border border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Running...' : 'Start Simulation'}</span>
          </button>
        </div>

        {/* Terminal Window */}
        <div 
          ref={scrollRef}
          className="h-[60vh] p-6 overflow-y-auto bg-black/50 text-sm space-y-3 scroll-smooth"
        >
          {logs.length === 0 && !isRunning && (
            <div className="text-gray-500 italic flex items-center justify-center h-full">
              Press 'Start Simulation' to boot the autonomous buyer agent.
            </div>
          )}
          
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={`flex items-start space-x-3 transition-opacity duration-300 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'success' ? 'text-green-400' : 
                'text-gray-300'
              }`}
            >
              <span className="shrink-0 mt-0.5 opacity-50">{">"}</span>
              <span className="leading-relaxed whitespace-pre-wrap">{log.message}</span>
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center space-x-3 text-gray-500 animate-pulse">
              <span className="shrink-0">{">"}</span>
              <span className="w-2 h-4 bg-gray-500"></span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 max-w-2xl text-sm">
        <p>This UI simulates an external AI Buyer Agent calling the <code className="text-gray-400">/api/agent/catalog</code> and <code className="text-gray-400">/api/agent/checkout</code> APIs using a Bearer token.</p>
      </div>
    </div>
  );
}
