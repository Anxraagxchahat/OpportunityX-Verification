import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, HelpCircle, ArrowLeft, RefreshCw, AlertTriangle, FileQuestion, Lock, ShieldX, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function InvalidCard({ result, onReset }) {
  const certificateId = result?.certificate_id || 'Unknown';
  const status = result?.status || 'Invalid';
  const reason = result?.reason || 'Certificate identification failed. The requested certificate does not exist in the OpportunityX registry.';

  const isRevoked = status.toLowerCase() === 'revoked';
  const isExpired = status.toLowerCase() === 'expired';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto bg-[#0B0D14] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6"
    >
      {/* Registry Record Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isRevoked ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
            isExpired ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            {isRevoked ? <ShieldX size={24} /> : isExpired ? <Clock size={24} /> : <FileQuestion size={24} />}
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Registry Lookup Result
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Certificate Record ID: <span className="font-mono text-orange-400">{certificateId}</span>
            </h2>
          </div>
        </div>

        <div>
          <StatusBadge status={status} size="large" />
        </div>
      </div>

      {/* Primary Audit Status Notice */}
      <div className={`p-5 rounded-xl border flex gap-4 items-start ${
        isRevoked ? 'bg-rose-500/5 border-rose-500/20' :
        isExpired ? 'bg-amber-500/5 border-amber-500/20' :
        'bg-slate-900/80 border-slate-800'
      }`}>
        <AlertTriangle size={20} className={`shrink-0 mt-0.5 ${
          isRevoked ? 'text-rose-400' : isExpired ? 'text-amber-400' : 'text-slate-400'
        }`} />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            {isRevoked ? 'Certificate Officially Revoked' : isExpired ? 'Certificate Validity Expired' : 'Certificate Not Found in Registry'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {reason}
          </p>
        </div>
      </div>

      {/* Verification Audit Diagnostic Checklist */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <HelpCircle size={13} className="text-orange-400" />
          Verification Audit Steps:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide block">1. Check Identifier</span>
            <p className="text-xs text-slate-400 leading-normal">
              Verify string syntax and hyphen placement (e.g., OX-INT-2026-000145).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide block">2. Status Revocation</span>
            <p className="text-xs text-slate-400 leading-normal">
              Revoked or expired credentials fail tamper check automatically.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide block">3. Registry Sync</span>
            <p className="text-xs text-slate-400 leading-normal">
              Recently issued credentials sync to the public node within 60 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Audit Bar */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-slate-500">
          Official Audit Node: OpportunityX Registry Security Engine
        </p>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-2 rounded-lg font-semibold text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          <span>New Lookup Search</span>
        </button>
      </div>
    </motion.div>
  );
}
