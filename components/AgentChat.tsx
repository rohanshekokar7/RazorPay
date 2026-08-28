'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, ShieldAlert, BadgeCheck, Loader2 } from 'lucide-react';
import { useAgent } from '@/context/AgentContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
}

export function AgentChat() {
  const { mandate, deductFromLimit } = useAgent();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'agent',
      text: "Hello! I'm your autonomous shopping agent. Tell me what you need, and I can purchase it on your behalf if you've granted me an active mandate."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setIsLoading(true);

    // Simulate Agent processing the request
    setTimeout(async () => {
      // Very basic keyword matching for simulation purposes
      if (userText.toLowerCase().includes('order') || userText.toLowerCase().includes('buy')) {
        let amount = 300; // Simulated amount
        let category = 'Groceries'; // Simulated category
        
        if (userText.toLowerCase().includes('coffee')) {
          amount = 450;
          category = 'Groceries';
        } else if (userText.toLowerCase().includes('laptop') || userText.toLowerCase().includes('expensive')) {
          amount = 80000;
          category = 'Electronics';
        } else if (userText.toLowerCase().includes('condom')) {
          amount = 300;
          category = 'Health & Wellness';
        }

        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'agent', 
          text: `I found what you're looking for! The total is ₹${amount} in the '${category}' category. Let me execute the checkout...` 
        }]);

        // Call the mock autonomous checkout API
        try {
          const res = await fetch('/api/agent-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount,
              category,
              mandate: {
                isActive: mandate.isActive,
                maxLimit: mandate.maxLimit,
                allowedCategories: mandate.allowedCategories,
              }
            })
          });

          const data = await res.json();

          if (res.ok && data.status === 'success') {
             // Deduct locally for simulation
             deductFromLimit(amount);
             setMessages(prev => [...prev, { 
              id: Date.now().toString(), 
              role: 'system', 
              text: `✅ Autonomous Payment Successful. ₹${amount} deducted from mandate limit.` 
            }]);
            setMessages(prev => [...prev, { 
              id: (Date.now() + 1).toString(), 
              role: 'agent', 
              text: "All done! I've placed the order successfully using my delegated mandate. It will arrive soon." 
            }]);
          } else if (res.status === 403 && data.requiresStepUp) {
            setMessages(prev => [...prev, { 
              id: Date.now().toString(), 
              role: 'system', 
              text: `⚠️ Step-up Authentication Required: ${data.message}` 
            }]);
            setMessages(prev => [...prev, { 
              id: (Date.now() + 1).toString(), 
              role: 'agent', 
              text: "I couldn't process this autonomously because it exceeds my limits. Please manually approve this transaction." 
            }]);
          } else {
             setMessages(prev => [...prev, { 
              id: Date.now().toString(), 
              role: 'system', 
              text: `❌ Transaction Failed: ${data.message || 'Unknown error'}` 
            }]);
          }
        } catch (error) {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'system', 
            text: "❌ Network error trying to reach the agent checkout API." 
          }]);
        }
      } else {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'agent', 
          text: "I can help you order items autonomously. Try saying 'Order 250g coffee beans'." 
        }]);
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header with Budget Indicator */}
      <div className="bg-zinc-900 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 border border-blue-800">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white leading-tight">Agent Console</h2>
            <p className="text-xs text-zinc-400">Natural language purchasing</p>
          </div>
        </div>
        
        {/* Visual Budget Indicator */}
        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${mandate.isActive ? 'bg-zinc-800 border-zinc-700' : 'bg-red-900/20 border-red-900/30'}`}>
          {mandate.isActive ? (
             <BadgeCheck className="h-4 w-4 text-green-400" />
          ) : (
             <ShieldAlert className="h-4 w-4 text-red-400" />
          )}
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider leading-none">Remaining Budget</span>
            <span className={`text-sm font-bold leading-tight ${mandate.isActive ? 'text-white' : 'text-red-400'}`}>
              ₹{mandate.maxLimit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'system' ? (
              <div className="w-full text-center my-2">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                  {msg.text}
                </span>
              </div>
            ) : (
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-zinc-900 text-white rounded-br-sm' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
             </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., Order my usual 250g coffee beans..."
            className="w-full rounded-full border border-gray-300 bg-gray-50 py-3 pl-5 pr-12 text-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            <Send className="h-4 w-4 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
