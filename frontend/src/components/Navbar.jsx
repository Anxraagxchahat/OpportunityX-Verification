import React from 'react';
import { ShieldCheck, Sun, Sparkles, Lock, Key } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#05070D]/90 border-b border-slate-800/80 transition-all">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Registry Brand Header */}
        <div className="flex items-center gap-3">
          <a 
            href="https://opportunityx.co.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 group"
            title="OpportunityX Ecosystem"
          >
            <img 
              src="/favicon.png" 
              alt="OpportunityX Logo" 
              className="w-8 h-8 object-contain" 
            />
            <div className="flex flex-col">
              <span className="font-sans text-base font-black tracking-tight text-white flex items-center gap-0.5">
                Opportunity<span className="text-orange-500">X</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Credential Verification Registry
              </span>
            </div>
          </a>

          <span className="hidden sm:inline-block h-4 w-px bg-slate-800 ml-2" />

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Lock size={11} className="text-orange-400" />
            <span>Public Lookup</span>
          </div>
        </div>

        {/* System Online Status & Theme Controls */}
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Registry Node:</span>
            <span className="text-emerald-400 font-semibold">ONLINE</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle visual theme"
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <Sun size={16} className="text-amber-500" />
            ) : (
              <Sparkles size={16} className="text-amber-400" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
