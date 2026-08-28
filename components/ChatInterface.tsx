'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings2, X, ShieldAlert, BadgeCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PaymentLink } from './PaymentLink';
import { AuditLog } from './AuditTrailConsole';
import { useAgent } from '@/context/AgentContext';
import { AgentSettings } from './AgentSettings';

interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  paymentLink?: { url: string; amount: number; title: string } | null;
  imageUrl?: string | null;
  isStepUp?: boolean;
  approvalRequest?: { item: string; amount: number; category: string } | null;
}

interface ChatInterfaceProps {
  onLogsReceived?: (logs: AuditLog[]) => void;
  simulatePaymentTick?: number;
  externalMessageTrigger?: { text: string; timestamp: number };
}

export function ChatInterface({ onLogsReceived, simulatePaymentTick = 0, externalMessageTrigger }: ChatInterfaceProps) {
  const { mandate, deductFromLimit } = useAgent();
  const [showSettings, setShowSettings] = useState(false);
  const [pendingTx, setPendingTx] = useState<{ amount: number, category: string, itemName: string } | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'model',
      text: 'Hi there! I am your AI Store Clerk. I can help you find products, check inventory, and handle checkout. How can I assist you today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track previous tick to avoid duplicate runs
  const prevTickRef = useRef(simulatePaymentTick);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (simulatePaymentTick > prevTickRef.current) {
      prevTickRef.current = simulatePaymentTick;
      handleHiddenSystemMessage("SYSTEM: The user has successfully paid the Razorpay link. Please thank them and confirm the order is being shipped.");
    }
  }, [simulatePaymentTick]);

  useEffect(() => {
    // Read from window location to avoid Next.js Suspense boundary requirements for useSearchParams
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('cancel_feedback') === 'true') {
        window.history.replaceState({}, '', '/');
        setMessages(prev => [
          ...prev, 
          {
            id: 'cancel_msg_1',
            role: 'model',
            text: "Sorry for the inconvenience. May I know the reason for cancelling the order?"
          }
        ]);
      }
    }
  }, []);

  const handleHiddenSystemMessage = async (systemText: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const apiMessages = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      apiMessages.push({ role: 'user', parts: [{ text: systemText }] });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      
      if (data.auditLogs && onLogsReceived) {
        onLogsReceived(data.auditLogs);
      }

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply,
        paymentLink: data.paymentLink,
        imageUrl: data.imageUrl,
        approvalRequest: data.approvalRequest
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Sorry, I encountered an error connecting to my systems. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (externalMessageTrigger && externalMessageTrigger.text) {
      handleSendMessage(externalMessageTrigger.text);
    }
  }, [externalMessageTrigger]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    if (onLogsReceived) {
      onLogsReceived([{ timestamp: new Date().toISOString(), level: 'INFO', message: `[Intent Captured] User requested: "${textToSend}"` } as any]);
    }

    // --- STANDARD GEMINI LOGIC ---
    try {
      const apiMessages = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      apiMessages.push({ role: 'user', parts: [{ text: userMsg.text }] });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      
      if (data.auditLogs && onLogsReceived) {
        onLogsReceived(data.auditLogs);
      }

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply,
        paymentLink: data.paymentLink,
        imageUrl: data.imageUrl,
        approvalRequest: data.approvalRequest
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Sorry, I encountered an error connecting to my systems. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput('');
    await handleSendMessage(currentInput);
  };

  const handleApproveOverage = async () => {
    if (!pendingTx) return;

    setIsLoading(true);
    if (onLogsReceived) {
       onLogsReceived([{ timestamp: new Date().toISOString(), level: 'SUCCESS', message: `[User Authorized] Step-up authentication completed by user via MFA/Biometrics.` } as any]);
    }
    
    try {
      const res = await fetch('/api/agent-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pendingTx.amount,
          category: pendingTx.category,
          itemName: pendingTx.itemName,
          bypassMandate: true,
          mandate: {
            isActive: mandate.isActive,
            maxLimit: mandate.maxLimit,
            allowedCategories: mandate.allowedCategories,
          }
        })
      });

      const data = await res.json();
      
      if (res.ok && data.status === 'success') {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'model', 
          text: `Thank you! I have verified your approval and processed the overage transaction successfully.` 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'system', 
          text: `❌ Override Transaction Failed: ${data.message || 'Unknown error'}` 
        }]);
      }
    } catch (e) {
      // Ignore
    } finally {
      setIsLoading(false);
      setPendingTx(null);
    }
  };

  const handleApprovePurchase = async (req: { item: string, amount: number, category: string }, messageId: string) => {
    // Remove the approval buttons to prevent multiple clicks
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, approvalRequest: null } : m));
    
    if (mandate.isActive) {
      setIsLoading(true);
      if (onLogsReceived) {
        onLogsReceived([{ timestamp: new Date().toISOString(), level: 'INFO', message: `[User Approved] Initiating autonomous checkout for ₹${req.amount}` } as any]);
      }

      try {
        const res = await fetch('/api/agent-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: req.amount,
            category: req.category,
            itemName: req.item,
            mandate: {
              isActive: mandate.isActive,
              maxLimit: mandate.maxLimit,
              allowedCategories: mandate.allowedCategories,
            }
          })
        });

        const data = await res.json();

        if (res.ok && data.status === 'success') {
           if (onLogsReceived) onLogsReceived([{ timestamp: new Date().toISOString(), level: 'SUCCESS', message: `[Bounded Check Passed] ₹${req.amount} used -> [Gated] Token generated.` } as any]);
           
           deductFromLimit(req.amount);
           setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'system', 
            text: `✅ Autonomous Payment Successful. ₹${req.amount} deducted from mandate limit.` 
          }]);
          
          setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: `All done! I've placed the order for ${req.item} successfully using my delegated mandate.` 
          }]);
        } else if (res.status === 403 && data.requiresStepUp) {
          if (onLogsReceived) onLogsReceived([{ timestamp: new Date().toISOString(), level: 'ERROR', message: `ERR_LIMIT_EXCEEDED: ${data.message}` } as any]);
          setPendingTx({ amount: req.amount, category: req.category, itemName: req.item });
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'system', 
            text: `⚠️ Step-up Authentication Required` 
          }]);
          setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: `I couldn't process this autonomously because: ${data.message}. Please manually approve this transaction to proceed.`,
            isStepUp: true
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
      } finally {
        setIsLoading(false);
      }
    } else {
      // If no mandate is active, tell the LLM the user approved so it generates the link.
      handleHiddenSystemMessage(`SYSTEM: The user explicitly approved the purchase of ${req.item}. Please generate the payment link using the generate_razorpay_link tool.`);
    }
  };

  const handleCancelPurchase = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, approvalRequest: null } : m));
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'user', 
      text: "I cancelled the purchase." 
    }]);
    handleHiddenSystemMessage("SYSTEM: The user cancelled the purchase approval.");
  };

  return (
    <div className="flex h-full flex-col bg-blue-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
      {/* WhatsApp Doodle Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" 
        style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundRepeat: 'repeat', backgroundSize: '400px' }}
      ></div>

      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 leading-tight">AI Store Clerk</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              online
            </p>
          </div>
        </div>
        
        {/* Settings & Budget */}
        <div className="flex items-center gap-3">
          {mandate.isActive && (
            <div className="px-2 py-1 rounded border flex items-center gap-1.5 bg-zinc-800 border-zinc-700">
              <BadgeCheck className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-bold text-white">₹{mandate.maxLimit.toFixed(2)}</span>
            </div>
          )}
          <button 
            onClick={() => setShowSettings(true)} 
            className="p-2 text-gray-700 hover:text-black hover:bg-gray-200 rounded-full transition"
            title="Agent Settings"
          >
            <Settings2 className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-md"
          >
             <motion.div 
                initial={{ scale: 0.95, y: 10 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.95, y: 10 }} 
                className="bg-white w-full max-w-md rounded-none shadow-2xl border-2 border-cyan-500 flex flex-col relative"
             >
                <div className="absolute top-3 right-3 z-10">
                  <button onClick={() => setShowSettings(false)} className="p-1.5 bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white rounded-full transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1">
                  <AgentSettings />
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'system' ? (
                <div className="w-full text-center my-2">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                    {msg.text}
                  </span>
                </div>
              ) : (
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div className={`rounded-lg px-4 py-2 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                  }`}>
                    {msg.imageUrl && (
                      <img 
                        src={msg.imageUrl} 
                        alt="Product" 
                        className="mb-3 rounded-lg max-w-[250px] w-full object-cover shadow-sm border border-gray-100" 
                      />
                    )}
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="text-sm leading-relaxed overflow-x-auto">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({node, ...props}) => <table className="w-full text-left border-collapse my-2 min-w-full" {...props} />,
                            th: ({node, ...props}) => <th className="border-b-2 border-gray-200 py-2 px-3 font-semibold text-gray-700 bg-gray-50" {...props} />,
                            td: ({node, ...props}) => <td className="border-b border-gray-100 py-2 px-3" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0 whitespace-pre-wrap" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            img: ({node, ...props}) => (
                              <img 
                                className="rounded-lg max-w-[250px] w-full object-cover shadow-sm border border-gray-100 my-3 block" 
                                {...props} 
                              />
                            )
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {msg.isStepUp && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center text-yellow-800 font-medium mb-3">
                          <ShieldAlert className="w-4 h-4 mr-2" />
                          Step-Up Authentication Required
                        </div>
                        <button 
                          onClick={handleApproveOverage}
                          className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md transition-colors shadow-sm text-sm"
                        >
                          Approve Overage via Biometrics
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.paymentLink && (
                    <PaymentLink 
                      url={msg.paymentLink.url} 
                      amount={msg.paymentLink.amount} 
                      title={msg.paymentLink.title} 
                    />
                  )}
                    {msg.approvalRequest && (
                      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm w-full min-w-[250px]">
                        <div className="font-semibold text-gray-800 mb-1">Confirm Purchase</div>
                        <div className="text-sm text-gray-600 mb-4">
                          Would you like to buy <strong>{msg.approvalRequest.item}</strong> for <strong>₹{msg.approvalRequest.amount}</strong>?
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleCancelPurchase(msg.id)}
                            className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleApprovePurchase(msg.approvalRequest!, msg.id)}
                            className="flex-1 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md transition-colors shadow-sm text-sm"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                <motion.div className="h-2 w-2 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                <motion.div className="h-2 w-2 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="h-2 w-2 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a product..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-5 pr-12 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
