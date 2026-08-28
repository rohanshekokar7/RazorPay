'use client';

import React from 'react';
import { AgentSettings } from '@/components/AgentSettings';
import { AgentChat } from '@/components/AgentChat';
import { AgentProvider } from '@/context/AgentContext';
import { Navbar } from '@/components/Navbar';

export default function AgentToAgentCommercePage() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      {/* Header section */}
      <div className="shrink-0">
        <Navbar globalSearch="" setGlobalSearch={() => {}} />
      </div>

      {/* Main content grid */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left Column: Settings */}
        <div className="w-full lg:w-1/3 flex flex-col h-full min-h-0">
          <AgentSettings />
        </div>

        {/* Right Column: Chat */}
        <div className="w-full lg:w-2/3 flex flex-col h-full min-h-0">
          <AgentChat />
        </div>

      </div>
    </div>
  );
}
