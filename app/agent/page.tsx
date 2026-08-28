'use client';

import React, { useReducer } from 'react';
import { AgentSettings } from '@/components/AgentSettings';
import { AgentChat } from '@/components/AgentChat';
import { TransactionAuditTrail, auditReducer, AuditLog } from '@/components/TransactionAuditTrail';
import { AgentProvider } from '@/context/AgentContext'; // Ensure this is imported if not globally provided, though it is globally provided in layout.tsx. We'll rely on global.

export default function AgentToAgentCommercePage() {
  const [logs, dispatch] = useReducer(auditReducer, []);

  const handleLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_LOG', payload: log });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      
      {/* Header section */}
      <div className="w-full bg-zinc-950 text-white py-12 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Agent-to-Agent (A2A) Commerce
        </h1>
        <p className="max-w-2xl text-zinc-400 text-lg">
          Experience the future of autonomous checkout. Set your personal AI agent's purchasing guardrails, then ask it to buy items on your behalf.
        </p>
      </div>

      {/* Main content grid */}
      <div className="w-full max-w-[1600px] px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Settings */}
        <div className="w-full lg:w-1/4 flex flex-col h-[700px]">
          <AgentSettings />
        </div>

        {/* Middle Column: Chat */}
        <div className="w-full lg:w-2/4 flex flex-col h-[700px]">
          <AgentChat onLog={handleLog} />
        </div>

        {/* Right Column: Audit Trail */}
        <div className="w-full lg:w-1/4 flex flex-col h-[700px]">
          <TransactionAuditTrail logs={logs} />
        </div>

      </div>
    </div>
  );
}
