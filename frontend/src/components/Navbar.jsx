import React from 'react';
import { ShieldCheck, Sun, Moon, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/80 border-b border-slate-800/80 transition-colors">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Registry Brand Header */}
        <div className="flex items-center gap-3">
          <a 
            href="https://opportunityx.co.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2.5 group"
            title="OpportunityX Ecosystem"
          >
            <img 
              src="/favicon.png" 
              alt="OpportunityX Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain" 
            />
            <div className="flex flex-col">
              <span className="font-sans text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-0.5 leading-none">
                Opportunity<span className="text-orange-500">X</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
                Credential Verification Registry
              </span>
            </div>
          </a>

          <span className="hidden sm:inline-block h-4 w-px bg-slate-800 ml-1" />

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Lock size={11} className="text-orange-400" />
            <span>Public Lookup Node</span>
          </div>
        </div>

        {/* System Online Status & Theme Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs font-mono text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden xs:inline">Node:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>

          {/* Professional Dual Theme Toggle Switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 text-xs font-semibold text-slate-200 transition-all shadow-sm active:scale-95"
            aria-label="Toggle visual theme"
            title={theme === 'light' ? 'Switch to AMOLED Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <>
                <Sun size={14} className="text-amber-400 shrink-0" />
                <span className="text-[11px] font-mono font-bold text-amber-400">LIGHT</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-cyan-400 shrink-0" />
                <span className="text-[11px] font-mono font-bold text-cyan-400">AMOLED</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
