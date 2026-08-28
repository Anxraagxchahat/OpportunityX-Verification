import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, RefreshCw, AlertTriangle, FileQuestion, ShieldX, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function InvalidCard({ result, onReset }) {
  const certificateId = result?.certificate_id || 'Unknown';
  const status = result?.status || 'Invalid';
  const reason = result?.reason || 'Certificate identification failed. The requested certificate does not exist in the OpportunityX registry.';

  const isRevoked = status.toLowerCase() === 'revoked';
  const isExpired = status.toLowerCase() === 'expired';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto bg-surface-elevated border border-border-subtle rounded-2xl shadow-elevated p-5 sm:p-8 space-y-6 transition-colors duration-200"
    >
      {/* Registry Record Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isRevoked ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
            isExpired ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
            'bg-surface border-border-subtle text-text-muted'
          }`}>
            {isRevoked ? <ShieldX size={22} /> : isExpired ? <Clock size={22} /> : <FileQuestion size={22} />}
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
              Registry Lookup Result
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight font-sans">
              Certificate Record ID: <span className="font-mono text-accent-brand">{certificateId}</span>
            </h2>
          </div>
        </div>

        <div>
          <StatusBadge status={status} size="large" />
        </div>
      </div>

      {/* Primary Audit Status Notice */}
      <div className={`p-4 sm:p-5 rounded-xl border flex gap-3.5 items-start ${
        isRevoked ? 'bg-rose-500/5 border-rose-500/20' :
        isExpired ? 'bg-amber-500/5 border-amber-500/20' :
        'bg-surface border-border-subtle'
      }`}>
        <AlertTriangle size={18} className={`shrink-0 mt-0.5 ${
          isRevoked ? 'text-rose-500' : isExpired ? 'text-amber-500' : 'text-text-muted'
        }`} />
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-text-primary font-sans">
            {isRevoked ? 'Certificate Officially Revoked' : isExpired ? 'Certificate Validity Expired' : 'Certificate Not Found in Registry'}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
            {reason}
          </p>
        </div>
      </div>

      {/* Verification Audit Diagnostic Checklist */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <HelpCircle size={13} className="text-accent-brand" />
          Verification Diagnostic Checks:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wide block font-sans">1. Check Identifier</span>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Verify string syntax and hyphen placement (e.g., OX-INT-2026-XXXXXX).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wide block font-sans">2. Status Revocation</span>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Revoked or expired credentials fail tamper checks automatically.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wide block font-sans">3. Registry Sync</span>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Recently issued credentials sync to the public node within 60 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Audit Bar */}
      <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-text-muted">
          Official Audit Node: OpportunityX Registry Security Engine
        </p>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-xs bg-surface-elevated hover:bg-surface-hover border border-border-subtle hover:border-border-strong text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-subtle"
        >
          <RefreshCw size={13} />
          <span>New Lookup Search</span>
        </button>
      </div>
    </motion.div>
  );
}

export default InvalidCard;
