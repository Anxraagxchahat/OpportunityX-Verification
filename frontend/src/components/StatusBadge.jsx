import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Clock, AlertCircle } from 'lucide-react';

export function StatusBadge({ status, size = 'normal' }) {
  const normalized = (status || '').toLowerCase();
  const isLarge = size === 'large';

  const paddingClass = isLarge ? 'px-4 py-1.5 text-xs sm:text-sm gap-2' : 'px-2.5 py-1 text-xs gap-1.5';
  const iconSize = isLarge ? 18 : 14;

  if (normalized === 'valid') {
    return (
      <span className={`inline-flex items-center font-bold rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono tracking-wider ${paddingClass}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ShieldCheck size={iconSize} className="text-emerald-600 dark:text-emerald-400" />
        <span className="uppercase">VERIFIED</span>
      </span>
    );
  }

  if (normalized === 'revoked') {
    return (
      <span className={`inline-flex items-center font-bold rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono tracking-wider ${paddingClass}`}>
        <ShieldX size={iconSize} className="text-rose-600 dark:text-rose-400" />
        <span className="uppercase">REVOKED</span>
      </span>
    );
  }

  if (normalized === 'expired') {
    return (
      <span className={`inline-flex items-center font-bold rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono tracking-wider ${paddingClass}`}>
        <Clock size={iconSize} className="text-amber-600 dark:text-amber-400" />
        <span className="uppercase">EXPIRED</span>
      </span>
    );
  }

  if (normalized === 'suspended') {
    return (
      <span className={`inline-flex items-center font-bold rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 font-mono tracking-wider ${paddingClass}`}>
        <AlertCircle size={iconSize} className="text-yellow-600 dark:text-yellow-400" />
        <span className="uppercase">SUSPENDED</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-bold rounded-md bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 font-mono tracking-wider ${paddingClass}`}>
      <ShieldAlert size={iconSize} className="text-rose-600 dark:text-rose-400" />
      <span className="uppercase">INVALID</span>
    </span>
  );
}
