'use client';

import React, { useState } from 'react';
import { ShieldCheck, CreditCard, CalendarClock, Bot, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAgent } from '@/context/AgentContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AVAILABLE_CATEGORIES = [
  'Footwear',
  'Clothing',
  'Watches',
  'Jewellery',
  'Sports & Fitness',
  'Home Furnishing',
  'Pens & Stationery',
  'Bags, Wallets & Belts',
  'Groceries',
  'Electronics',
  'Health & Wellness',
];

export function AgentSettings() {
  const { mandate, updateMandate } = useAgent();
  
  const [maxLimit, setMaxLimit] = useState(mandate.maxLimit || 500);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    mandate.allowedCategories.length > 0 ? mandate.allowedCategories : ['Clothing', 'Footwear']
  );
  
  // Convert existing string to Date or create new Date
  const defaultDate = mandate.expiresAt 
    ? new Date(mandate.expiresAt) 
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
  const [expiresAtDate, setExpiresAtDate] = useState<Date | null>(defaultDate);
  
  const [isSaved, setIsSaved] = useState(false);

  const [expirationPreset, setExpirationPreset] = useState<string>('custom');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handlePresetChange = (val: string) => {

    setExpirationPreset(val);
    if (val === 'custom') return;
    
    const newDate = new Date();
    if (val === '1_day') newDate.setDate(newDate.getDate() + 1);
    if (val === '1_week') newDate.setDate(newDate.getDate() + 7);
    if (val === '1_month') newDate.setMonth(newDate.getMonth() + 1);
    if (val === '6_months') newDate.setMonth(newDate.getMonth() + 6);
    if (val === '1_year') newDate.setFullYear(newDate.getFullYear() + 1);
    
    setExpiresAtDate(newDate);
  };


  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    updateMandate({
      isActive: true,
      maxLimit,
      allowedCategories: selectedCategories,
      expiresAt: expiresAtDate ? expiresAtDate.toISOString().split('T')[0] : '',
    });
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRevoke = () => {
    updateMandate({
      isActive: false,
      maxLimit: 0,
      allowedCategories: [],
      expiresAt: '',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-zinc-900 px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400 border border-cyan-800">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-white leading-tight">Delegated Consent</h2>
          <p className="text-xs text-zinc-400">Manage your Agent's purchasing power</p>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        
        {/* Mandate Status Alert */}
        {mandate.isActive ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-green-900">Active Mandate</h3>
              <p className="text-sm text-green-700 mt-1">
                Your AI agent is authorized to make autonomous purchases up to ₹{mandate.maxLimit}.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Bot className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Agent Inactive</h3>
              <p className="text-sm text-blue-700 mt-1">
                Authorize your agent below to enable zero-click autonomous checkout.
              </p>
            </div>
          </div>
        )}

        {/* Transaction Limit */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CreditCard className="h-4 w-4 text-gray-500" />
            Maximum Transaction Limit (₹)
          </label>
          <input 
            type="number"
            value={maxLimit}
            onChange={(e) => setMaxLimit(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
            placeholder="e.g. 500"
          />
          <p className="text-xs text-gray-500">The agent cannot spend more than this amount per transaction.</p>
        </div>


        {/* Expiration */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CalendarClock className="h-4 w-4 text-gray-500" />
            Mandate Expiration Date
          </label>
          <div className="flex gap-2">
            <div className="relative w-48">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm"
              >
                <span className="text-sm font-medium">
                  {[
                    { id: '1_day', label: '1 Day' },
                    { id: '1_week', label: '1 Week' },
                    { id: '1_month', label: '1 Month' },
                    { id: '6_months', label: '6 Months' },
                    { id: '1_year', label: '1 Year' },
                    { id: 'custom', label: 'Custom Date' },
                  ].find(p => p.id === expirationPreset)?.label || 'Custom Date'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl py-1 overflow-hidden">
                  {[
                    { id: '1_day', label: '1 Day' },
                    { id: '1_week', label: '1 Week' },
                    { id: '1_month', label: '1 Month' },
                    { id: '6_months', label: '6 Months' },
                    { id: '1_year', label: '1 Year' },
                    { id: 'custom', label: 'Custom Date' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        handlePresetChange(preset.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 hover:text-white transition-colors ${
                        expirationPreset === preset.id ? 'bg-cyan-500 text-white font-medium' : 'text-zinc-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {expirationPreset === 'custom' && (
              <div className="relative flex-1">
                <DatePicker 
                  selected={expiresAtDate} 
                  onChange={(date: Date | null) => setExpiresAtDate(date)} 
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
                  wrapperClassName="w-full"
                />
              </div>
            )}
            {expirationPreset !== 'custom' && expiresAtDate && (
              <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 flex items-center text-sm font-medium">
                Valid until {expiresAtDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
        {mandate.isActive && (
          <button 
            onClick={handleRevoke}
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            Revoke
          </button>
        )}
        <button 
          onClick={handleSave}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isSaved 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-zinc-900 text-white hover:bg-zinc-800'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Mandate Authorized
            </>
          ) : (
            'Authorize Agent'
          )}
        </button>
      </div>
    </div>
  );
}
