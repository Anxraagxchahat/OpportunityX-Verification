import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Clock, AlertCircle } from 'lucide-react';

export function StatusBadge({ status, size = 'normal' }) {
  const normalized = (status || '').toLowerCase();
  const isLarge = size === 'large';

  const paddingClass = isLarge ? 'px-3.5 py-1 text-xs sm:text-sm gap-2 rounded-lg' : 'px-2.5 py-0.5 text-xs gap-1.5 rounded-md';
  const iconSize = isLarge ? 16 : 13;

  if (normalized === 'valid') {
    return (
      <span className={`inline-flex items-center font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 font-mono tracking-wider ${paddingClass}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ShieldCheck size={iconSize} className="text-emerald-500" />
        <span className="uppercase">VERIFIED</span>
      </span>
    );
  }

  if (normalized === 'revoked') {
    return (
      <span className={`inline-flex items-center font-bold bg-rose-500/10 border border-rose-500/25 text-rose-500 font-mono tracking-wider ${paddingClass}`}>
        <ShieldX size={iconSize} className="text-rose-500" />
        <span className="uppercase">REVOKED</span>
      </span>
    );
  }

  if (normalized === 'expired') {
    return (
      <span className={`inline-flex items-center font-bold bg-amber-500/10 border border-amber-500/25 text-amber-500 font-mono tracking-wider ${paddingClass}`}>
        <Clock size={iconSize} className="text-amber-500" />
        <span className="uppercase">EXPIRED</span>
      </span>
    );
  }

  if (normalized === 'suspended') {
    return (
      <span className={`inline-flex items-center font-bold bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 font-mono tracking-wider ${paddingClass}`}>
        <AlertCircle size={iconSize} className="text-yellow-500" />
        <span className="uppercase">SUSPENDED</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-bold bg-rose-500/10 border border-rose-500/25 text-rose-500 font-mono tracking-wider ${paddingClass}`}>
      <ShieldAlert size={iconSize} className="text-rose-500" />
      <span className="uppercase">INVALID</span>
    </span>
  );
}

export default StatusBadge;
