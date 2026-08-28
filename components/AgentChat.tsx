'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, ShieldAlert, BadgeCheck, Loader2 } from 'lucide-react';
import { useAgent } from '@/context/AgentContext';
import { AuditLog } from './TransactionAuditTrail';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  isStepUp?: boolean;
}

interface AgentChatProps {
  onLog?: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

export function AgentChat({ onLog }: AgentChatProps) {
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

  // Helper to safely log to the Audit Trail if the prop was passed
  const logEvent = (level: AuditLog['level'], message: string) => {
    if (onLog) {
      onLog({ level, message });
    }
  };

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

    logEvent('INFO', `[Intent Captured] User requested: "${userText}"`);

    try {
      // 1. Identify intent and price
      let amount = 300;
      let category = 'Groceries';
      let itemId = 'prod_generic';
      let itemName = 'Generic Item';
      
      if (userText.toLowerCase().includes('coffee')) {
        amount = 450;
        category = 'Groceries';
        itemId = 'prod_coffee_01';
        itemName = 'Artisan 250g Coffee Beans';
      } else if (userText.toLowerCase().includes('laptop') || userText.toLowerCase().includes('expensive')) {
        amount = 80000;
        category = 'Electronics';
        itemId = 'prod_laptop_01';
        itemName = 'ProBook Ultra 14"';
      } else if (userText.toLowerCase().includes('condom')) {
        amount = 300;
        category = 'Health & Wellness';
        itemId = 'prod_condom_01';
        itemName = 'Health Item';
      }

      logEvent('INFO', `[Catalog Match] Matched to ${itemName} at ₹${amount} in category '${category}'`);

      // Mock Cart state for orchestrator
      const currentCart = [{ product_id: itemId, name: itemName, price: amount }];

      // 2. Call the autonomous checkout API (Handles Bounding & Guardrails)
      logEvent('INFO', `[Bounded Check] Requesting autonomous checkout for ₹${amount} in category '${category}'`);

      const res = await fetch('/api/agent-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          category,
          itemName,
          mandate: {
            isActive: mandate.isActive,
            maxLimit: mandate.maxLimit,
            allowedCategories: mandate.allowedCategories,
          }
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
         logEvent('SUCCESS', `[Bounded Check Passed] ₹${amount}/₹${mandate.maxLimit} used -> [Gated] Token generated for merchant.`);
         
         deductFromLimit(amount);
         setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'system', 
          text: `✅ Autonomous Payment Successful. ₹${amount} deducted from mandate limit.` 
        }]);

        // 3. Call Campaign Orchestrator for Upsells
        logEvent('INFO', `[Orchestrator] Querying active campaigns for intent and current cart...`);
        try {
          const orchestratorResponse = await fetch('/api/agent/orchestrator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intent: userText, currentCart, userContext: {} })
          });
          const orchestratorData = await orchestratorResponse.json();

          let agentReply = `All done! I've placed the order for ${itemName} successfully using my delegated mandate. `;

          if (orchestratorData?.orchestrator_decision?.should_intervene) {
            const instructions = orchestratorData.orchestrator_decision.instructions[0];
            logEvent('WARN', `[Orchestrator Intervention] Campaign triggered. Injecting upsell prompt: ${instructions.system_prompt}`);
            agentReply += `\n\n${instructions.system_prompt}`;
          } else {
            logEvent('INFO', `[Orchestrator] No active campaigns triggered for this context.`);
          }

          setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            role: 'agent', 
            text: agentReply 
          }]);
        } catch (e) {
          logEvent('ERROR', `[Orchestrator] Failed to fetch campaigns.`);
        }
      } else if (res.status === 403 && data.requiresStepUp) {
        // Graceful Failure
        logEvent('ERROR', `ERR_LIMIT_EXCEEDED: ${data.message}`);
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'system', 
          text: `⚠️ Step-up Authentication Required` 
        }]);
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'agent', 
          text: `I couldn't process this autonomously because: ${data.message}. Please manually approve this transaction to proceed.`,
          isStepUp: true
        }]);
      } else {
        logEvent('ERROR', `[Transaction Failed] ${data.message || 'Unknown error'}`);
         setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'system', 
          text: `❌ Transaction Failed: ${data.message || 'Unknown error'}` 
        }]);
      }
    } catch (error) {
      logEvent('ERROR', `[System Error] Network error trying to reach APIs.`);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'system', 
        text: "❌ Network error trying to reach the agent checkout API." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveOverage = () => {
    logEvent('SUCCESS', `[User Authorized] Step-up authentication completed by user via MFA/Biometrics.`);
    logEvent('SUCCESS', `[Gated] Token manually generated. Transaction processed.`);
    
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'agent', 
      text: `Thank you! I have verified your approval and processed the overage transaction successfully.` 
    }]);
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
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {msg.isStepUp && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center text-yellow-800 font-medium mb-3">
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Step-Up Authentication Required
                    </div>
                    <button 
                      onClick={handleApproveOverage}
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md transition-colors shadow-sm"
                    >
                      Approve Overage via Biometrics
                    </button>
                  </div>
                )}
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
