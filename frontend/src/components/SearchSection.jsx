import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Cpu, Globe, Key, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TRUST_INDICATORS = [
  { label: 'Tamper-Proof Certificates', icon: ShieldCheck },
  { label: 'Real-Time Registry', icon: Cpu },
  { label: 'Public Verification', icon: Globe },
  { label: 'Digitally Signed (ECDSA)', icon: Key },
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
    <section className="relative w-full pt-4 pb-2 sm:pt-8 sm:pb-4">
      <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
        
        {/* Title & Subtitle */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle border border-accent-brand/20 text-accent-brand text-[11px] font-mono font-semibold tracking-wider uppercase"
          >
            <ShieldCheck size={13} className="text-accent-brand" />
            <span>Official Credential Registry</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-2xl sm:text-4xl md:text-[2.75rem] font-extrabold tracking-tight text-text-primary font-sans leading-tight"
          >
            Opportunity<span className="text-accent-brand">X</span> Verification Portal
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto font-sans leading-relaxed"
          >
            Verify certificates, credentials, and achievements issued by OpportunityX.
          </motion.p>
        </div>

        {/* Primary Search Input Box */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          onSubmit={handleSubmit}
          className="relative max-w-2xl mx-auto"
        >
          <div className="relative flex items-center p-1.5 rounded-xl bg-surface-elevated border border-border-subtle hover:border-border-strong focus-within:border-accent-brand focus-within:ring-2 focus-within:ring-accent-brand/20 shadow-elevated transition-all duration-150">
            <div className="pl-3.5 pr-2 text-text-muted flex items-center shrink-0">
              <Search size={18} className="text-text-muted" />
            </div>

            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              placeholder="Enter Certificate ID (e.g. OX-INT-2026-XXXXXX)"
              className="w-full bg-transparent border-none outline-none text-text-primary text-xs sm:text-sm md:text-base font-mono font-medium placeholder:text-text-muted placeholder:font-sans placeholder:font-normal placeholder:tracking-normal px-2 py-2.5 tracking-wider uppercase"
              disabled={loading}
              autoFocus
              aria-label="Enter Certificate ID"
            />

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-text-muted hover:text-text-primary transition-colors shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring"
                title="Clear input"
              >
                <X size={16} />
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="ml-1.5 px-4 sm:px-6 py-2.5 rounded-lg font-sans font-semibold text-white text-xs sm:text-sm bg-accent-brand hover:bg-accent-hover active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed shadow-subtle flex items-center gap-2 whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Refined Trust Indicators Strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="pt-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs"
        >
          {TRUST_INDICATORS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="flex items-center gap-1.5 bg-surface border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary text-[11px] sm:text-xs font-sans font-medium select-none"
              >
                <Icon size={13} className="text-accent-brand shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}

export default SearchSection;
