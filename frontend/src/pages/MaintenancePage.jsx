import React, { useEffect } from 'react';
import { Server, RefreshCw, ShieldCheck } from 'lucide-react';

/**
 * Global Maintenance Page
 * OpportunityX Certificate Verification
 *
 * Rendered when MAINTENANCE_MODE is active.
 * Backend-independent; halts all verification lookups and API requests.
 */
export const MaintenancePage = () => {
  useEffect(() => {
    const body = document.body;
    const root = document.documentElement;
    body.classList.remove('light-mode', 'monochromatic-mode', 'monochrome-mode');
    body.classList.add('dark-mode', 'amoled-mode');
    root.setAttribute('data-theme', 'dark');
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-[#FAFAFA] p-6 relative overflow-hidden font-sans select-none">
      {/* Subtle ambient orange/glow backgrounds */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FF6B00]/10 rounded-full blur-[90px] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute inset-0 bg-[radial-gradient(rgba(255,107,0,0.03)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Main Glass Card */}
      <div className="relative z-10 max-w-lg w-full bg-[#121215] border border-[#27272A] rounded-3xl p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
        {/* Top accent glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-[2px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent shadow-[0_0_14px_rgba(255,107,0,0.8)]" />

        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xl font-black tracking-tight text-white">
            Opportunity<span className="text-[#FF6B00]">X</span>
          </span>
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/25 px-2 py-0.5 rounded-full">
            VERIFICATION
          </span>
        </div>

        {/* Server Icon — Centered */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center shadow-[0_0_25px_rgba(255,107,0,0.15)]" aria-hidden="true">
            <Server className="w-8 h-8" strokeWidth={1.8} />
          </div>
        </div>

        {/* Status Pill — Centered Row */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider" role="status">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            System Maintenance
          </div>
        </div>

        {/* Primary Heading */}
        <h1 
          className="text-2xl sm:text-3xl font-black tracking-tight mb-3"
          style={{ color: '#FFFFFF' }}
        >
          Server Under Maintenance
        </h1>

        {/* Supporting Text */}
        <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto mb-6">
          We&apos;re temporarily performing maintenance on our services. OpportunityX will be back shortly.
        </p>

        {/* Status Notice Box */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 text-left mb-6" aria-live="polite">
          <div className="flex items-center justify-between text-xs text-[#FF6B00] font-mono font-bold uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Registry Status
            </span>
            <span className="text-zinc-500 text-[11px]">OX-REGISTRY</span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mb-3">
            Our backend services are currently unavailable while we work on restoring the system.
          </p>

          {/* Progress pulse track */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden relative mb-2" aria-hidden="true">
            <div className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-[#FF6B00] to-amber-500 rounded-full animate-[pulse_2s_ease-in-out_infinite]" />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Services temporarily unavailable</span>
            <span className="text-amber-400">Restoring services...</span>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-bold text-xs shadow-lg hover:shadow-[#FF6B00]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            aria-label="Refresh page to check if maintenance is complete"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Status
          </button>
        </div>

        {/* Meta Footer */}
        <div className="mt-8 pt-4 border-t border-[#27272A] text-[11px] font-mono text-zinc-600 flex flex-col gap-0.5">
          <span className="text-zinc-400">OPPX-VERIFICATION // SECURE REGISTRY LOCK</span>
          <span>Credential cryptographic nodes will resume automatically.</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
