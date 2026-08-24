'use client';

import { Terminal, CheckCircle, XCircle, Info, Clock, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type LogStatus = 'INFO' | 'SUCCESS' | 'ERROR';

export interface AuditLog {
  id: string;
  timestamp: string;
  step: string;
  status: LogStatus;
  details: string;
}

interface AuditTrailConsoleProps {
  logs: AuditLog[];
  onSimulatePayment?: () => void;
}

const getStatusIcon = (status: LogStatus) => {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    case 'ERROR':
      return <XCircle className="h-4 w-4 text-red-400" />;
    case 'INFO':
    default:
      return <Info className="h-4 w-4 text-blue-400" />;
  }
};

const getStatusColor = (status: LogStatus) => {
  switch (status) {
    case 'SUCCESS':
      return 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20';
    case 'ERROR':
      return 'text-red-400 border-red-900/50 bg-red-950/20';
    case 'INFO':
    default:
      return 'text-blue-400 border-blue-900/50 bg-blue-950/20';
  }
};

export function AuditTrailConsole({ logs, onSimulatePayment }: AuditTrailConsoleProps) {
  return (
    <div className="flex h-full flex-col bg-gray-950 font-mono text-gray-300 shadow-2xl overflow-hidden rounded-xl border border-gray-800 relative">
      <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900/50 px-4 py-3">
        <Terminal className="h-5 w-5 text-gray-400" />
        <h2 className="text-sm font-medium text-gray-200">Audit Trail Console</h2>
        <div className="ml-auto flex items-center gap-3">
          {onSimulatePayment && (
             <button 
                onClick={onSimulatePayment}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-900 bg-emerald-400 hover:bg-emerald-300 transition-colors rounded-md active:scale-95"
             >
                <PlayCircle className="h-3.5 w-3.5" />
                Simulate Payment Webhook
             </button>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 ml-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-600">
            Waiting for AI events...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-lg border p-3 ${getStatusColor(log.status)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 font-medium">
                    {getStatusIcon(log.status)}
                    <span>{log.step}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-60 shrink-0">
                    <Clock className="h-3 w-3" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="mt-2 text-xs opacity-80 pl-6 border-l border-current ml-2 border-opacity-20 leading-relaxed">
                  {log.details}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
