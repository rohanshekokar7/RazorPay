'use client';

import React, { useReducer, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, AlertOctagon, XCircle } from 'lucide-react';

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

export interface AuditLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
}

// Reducer for managing audit logs
type Action = 
  | { type: 'ADD_LOG'; payload: Omit<AuditLog, 'id' | 'timestamp'> }
  | { type: 'CLEAR_LOGS' };

export function auditReducer(state: AuditLog[], action: Action): AuditLog[] {
  switch (action.type) {
    case 'ADD_LOG':
      return [
        ...state,
        {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          ...action.payload,
        }
      ];
    case 'CLEAR_LOGS':
      return [];
    default:
      return state;
  }
}

interface TransactionAuditTrailProps {
  logs: AuditLog[];
}

export function TransactionAuditTrail({ logs }: TransactionAuditTrailProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getIcon = (level: LogLevel) => {
    switch (level) {
      case 'INFO': return <Terminal className="w-4 h-4 text-blue-400" />;
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'WARN': return <ShieldAlert className="w-4 h-4 text-yellow-400" />;
      case 'ERROR': return <AlertOctagon className="w-4 h-4 text-red-500" />;
      default: return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTextColor = (level: LogLevel) => {
    switch (level) {
      case 'INFO': return 'text-gray-300';
      case 'SUCCESS': return 'text-green-300';
      case 'WARN': return 'text-yellow-300';
      case 'ERROR': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="bg-zinc-950 rounded-lg border border-zinc-800 shadow-2xl flex flex-col h-full overflow-hidden font-mono text-sm">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-zinc-400" />
          <span className="text-zinc-300 font-semibold tracking-wide">A2A_AUDIT_TRAIL</span>
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>

      {/* Log View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic">Listening for orchestrator events...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(log.level)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-zinc-500 text-xs">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    log.level === 'ERROR' ? 'bg-red-950 text-red-400' :
                    log.level === 'WARN' ? 'bg-yellow-950 text-yellow-400' :
                    log.level === 'SUCCESS' ? 'bg-green-950 text-green-400' :
                    'bg-blue-950 text-blue-400'
                  }`}>
                    {log.level}
                  </span>
                </div>
                <div className={`${getTextColor(log.level)} break-words leading-relaxed`}>
                  {log.message}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
}
