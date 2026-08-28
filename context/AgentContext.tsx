'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AgentMandate {
  isActive: boolean;
  maxLimit: number;
  allowedCategories: string[];
  expiresAt: string;
}

interface AgentContextType {
  mandate: AgentMandate;
  updateMandate: (newMandate: Partial<AgentMandate>) => void;
  deductFromLimit: (amount: number) => void;
}

const defaultMandate: AgentMandate = {
  isActive: false,
  maxLimit: 0,
  allowedCategories: [],
  expiresAt: '',
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [mandate, setMandate] = useState<AgentMandate>(defaultMandate);

  const updateMandate = (newMandate: Partial<AgentMandate>) => {
    setMandate((prev) => ({ ...prev, ...newMandate }));
  };

  const deductFromLimit = (amount: number) => {
    setMandate((prev) => ({
      ...prev,
      maxLimit: Math.max(0, prev.maxLimit - amount),
    }));
  };

  return (
    <AgentContext.Provider value={{ mandate, updateMandate, deductFromLimit }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}
