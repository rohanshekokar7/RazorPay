'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentLink } from './PaymentLink';
import { AuditLog } from './AuditTrailConsole';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  paymentLink?: { url: string; amount: number; title: string } | null;
}

interface ChatInterfaceProps {
  onLogsReceived: (logs: AuditLog[]) => void;
  simulatePaymentTick?: number;
}

export function ChatInterface({ onLogsReceived, simulatePaymentTick = 0 }: ChatInterfaceProps) {
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

  const handleHiddenSystemMessage = async (systemText: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Build API request payload matching standard Gemini chat history format
      const apiMessages = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      // Append hidden system message (as user role so the model reads it as an event)
      apiMessages.push({ role: 'user', parts: [{ text: systemText }] });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      
      if (data.auditLogs) {
        onLogsReceived(data.auditLogs);
      }

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply,
        paymentLink: data.paymentLink
      };

      // Note: We don't add the hidden system message to the UI state
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

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build API request payload matching standard Gemini chat history format
      const apiMessages = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      apiMessages.push({ role: 'user', parts: [{ text: userMsg.text }] });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      
      if (data.auditLogs) {
        onLogsReceived(data.auditLogs);
      }

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply,
        paymentLink: data.paymentLink
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

  return (
    <div className="flex h-full flex-col bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">AI Store Clerk</h2>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`flex shrink-0 h-8 w-8 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-600'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                </div>
                {msg.paymentLink && (
                  <PaymentLink 
                    url={msg.paymentLink.url} 
                    amount={msg.paymentLink.amount} 
                    title={msg.paymentLink.title} 
                  />
                )}
              </div>
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
