import React from 'react';
import { Sun, Moon, CircleDot, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo } from './ui/BrandLogo';

export function Navbar() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'monochromatic', label: 'Mono', icon: CircleDot },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-canvas/85 border-b border-border-subtle transition-colors">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Registry Brand Header */}
        <div className="flex items-center gap-3">
          <a 
            href="https://opportunityx.co.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-lg p-0.5 transition-opacity hover:opacity-90"
            title="OpportunityX Ecosystem"
          >
            <BrandLogo 
              variant="full" 
              height={30} 
              showSubtext={true} 
              subtext="Credential Verification Registry"
            />
          </a>

          <span className="hidden sm:inline-block h-4 w-px bg-border-subtle ml-1" />

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-subtle text-[11px] font-mono text-text-secondary">
            <Lock size={11} className="text-accent-brand shrink-0" />
            <span>Public Lookup Node</span>
          </div>
        </div>

        {/* System Online Status & Theme Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Node Status Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-[11px] sm:text-xs font-mono text-text-secondary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden xs:inline text-text-muted">Node:</span>
            <span className="text-emerald-500 font-bold tracking-wide">ONLINE</span>
          </div>

          {/* Canonical 3-Mode Theme Switcher: Dark | Light | Mono */}
          <div
            role="radiogroup"
            aria-label="Color theme switcher"
            className="inline-flex items-center rounded-lg border border-border-subtle bg-surface p-0.5 sm:p-1 shadow-subtle"
          >
            {themes.map((t) => {
              const isSelected = theme === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${t.label} theme`}
                  onClick={() => setTheme(t.id)}
                  className={`relative flex items-center gap-1 sm:gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium font-sans transition-all duration-150 active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    isSelected
                      ? 'bg-surface-elevated text-text-primary shadow-subtle border border-border-subtle font-semibold'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-hover border border-transparent'
                  }`}
                  title={`Switch to ${t.label} mode`}
                >
                  <Icon
                    size={13}
                    className={`shrink-0 ${
                      isSelected
                        ? theme === 'monochromatic'
                          ? 'text-text-primary'
                          : t.id === 'light'
                          ? 'text-amber-500'
                          : 'text-text-primary'
                        : 'text-text-muted'
                    }`}
                  />
                  <span className="hidden sm:inline text-[11px]">{t.label}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </header>
  );
}

export default Navbar;
