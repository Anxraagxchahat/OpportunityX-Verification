import React from 'react';
import { ShieldCheck, ExternalLink, Lock } from 'lucide-react';

export function Footer({ onOpenAdmin }) {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/60 bg-slate-100 dark:bg-black py-10 mt-16 text-slate-600 dark:text-slate-400">
      <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Branding & Trust Note */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="p-1 -m-1 rounded-md text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-110 active:scale-95 transition-all focus:outline-none"
              title="OpportunityX Security Node"
              aria-label="Security Node"
            >
              <ShieldCheck size={19} className="text-orange-500" />
            </button>
            <span className="font-sans font-bold text-slate-900 dark:text-slate-200 text-sm tracking-wide">
              OpportunityX Verification Platform
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-500 max-w-md">
            Official cryptographic verification service for credentials, internship completion certificates, and achievements issued by OpportunityX.
          </p>
        </div>

        {/* Right: Quick Links & Security Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-slate-600 dark:text-slate-400">
          <a
            href="https://opportunityx.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <span>OpportunityX Ecosystem</span>
            <ExternalLink size={13} />
          </a>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-500">
            <Lock size={12} className="text-slate-500 dark:text-slate-400" />
            ECDSA 256-bit Encrypted
          </span>

          <span className="hidden sm:inline text-slate-700">•</span>

          <span className="text-slate-500">
            © {new Date().getFullYear()} OpportunityX. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
