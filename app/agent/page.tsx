'use client';

import React from 'react';
import { AgentSettings } from '@/components/AgentSettings';
import { AgentChat } from '@/components/AgentChat';
import { AgentProvider } from '@/context/AgentContext';
import { Navbar } from '@/components/Navbar';

export default function AgentToAgentCommercePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      
      {/* Header section */}
      <Navbar globalSearch="" setGlobalSearch={() => {}} />

      {/* Main content grid */}
      <div className="w-full max-w-[1200px] px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Settings */}
        <div className="w-full lg:w-1/3 flex flex-col h-[700px]">
          <AgentSettings />
        </div>

        {/* Right Column: Chat */}
        <div className="w-full lg:w-2/3 flex flex-col h-[700px]">
          <AgentChat />
        </div>

      </div>
    </div>
  );
}
