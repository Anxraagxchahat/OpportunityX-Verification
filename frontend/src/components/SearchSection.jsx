import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Cpu, Globe, Key, X } from 'lucide-react';
import { motion } from 'framer-motion';

const TRUST_INDICATORS = [
  { label: 'Tamper-Proof Certificates', icon: ShieldCheck },
  { label: 'Real-Time Registry', icon: Cpu },
  { label: 'Public Verification', icon: Globe },
  { label: 'Digitally Signed', icon: Key },
];

export function SearchSection({ onSearch, loading, initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    setValue('');
  };

  return (
    <section className="relative w-full pt-6 pb-4 sm:pt-10 sm:pb-6">
      <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
        
        {/* Title & Subtitle */}
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-semibold tracking-wider uppercase mb-1"
          >
            <ShieldCheck size={13} className="text-orange-400" />
            <span>Official Credential Registry</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white"
          >
            Opportunity<span className="text-orange-500">X</span> Verification Portal
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal leading-relaxed"
          >
            Verify certificates, credentials, and achievements issued by OpportunityX.
          </motion.p>
        </div>

        {/* Search Input Box - The Main Visual Focus */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          onSubmit={handleSubmit}
          className="relative max-w-2xl mx-auto"
        >
          <div className="relative flex items-center p-1.5 rounded-2xl bg-[#0B0D14] border border-slate-700/80 hover:border-slate-600 focus-within:border-orange-500/90 focus-within:ring-4 focus-within:ring-orange-500/10 shadow-2xl transition-all duration-200">
            <div className="pl-4 pr-2 text-slate-400 flex items-center">
              <Search size={20} className="text-slate-400 group-focus-within:text-orange-400" />
            </div>

            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              placeholder="Enter Certificate ID (e.g. OX-INT-2026-000145)"
              className="w-full bg-transparent border-none outline-none text-white text-base sm:text-lg font-mono font-semibold placeholder:text-slate-500 placeholder:font-sans placeholder:font-normal px-2 py-3 tracking-wider uppercase"
              disabled={loading}
              autoFocus
              aria-label="Enter Certificate ID"
            />

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear input"
              >
                <X size={18} />
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="ml-2 px-6 sm:px-8 py-3 rounded-xl font-sans font-bold text-white text-sm bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md shadow-orange-500/20 flex items-center gap-2 whitespace-nowrap transition-all duration-150"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Subtle Trust Indicators Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400"
        >
          {TRUST_INDICATORS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-3 py-1 rounded-md">
                <Icon size={13} className="text-orange-400 shrink-0" />
                <span className="font-medium text-slate-300">{item.label}</span>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
