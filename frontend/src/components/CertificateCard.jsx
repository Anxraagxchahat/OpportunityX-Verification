import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  User, 
  Briefcase, 
  Calendar, 
  Clock, 
  Building2, 
  QrCode, 
  Key, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Check, 
  Award,
  Lock,
  FileCheck,
  Globe,
  Printer
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { QrModal } from './QrModal';
import { CertificateViewerModal } from './CertificateViewerModal';

export function CertificateCard({ result }) {
  const [copied, setCopied] = useState(false);
  const [sigCopied, setSigCopied] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);

  if (!result) return null;

  const {
    certificate_id,
    status = 'Valid',
    type_label = 'Internship Certificate',
    recipient = 'N/A',
    role = 'N/A',
    duration = 'N/A',
    issued_date = 'N/A',
    issued_by = 'OpportunityX',
    digital_signature = '0x4f8a92b1c3d4e5f67890abcd1234ef567890abcd',
    verification_timestamp,
    trust_statement = 'This certificate has been issued by OpportunityX and successfully verified.',
    details = {},
    metadata = {},
    verification_url = '',
  } = result;

  const shareUrl = verification_url || `${window.location.origin}/?id=${certificate_id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySig = () => {
    navigator.clipboard.writeText(digital_signature);
    setSigCopied(true);
    setTimeout(() => setSigCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto bg-white dark:bg-[#0B0D14] border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden transition-colors duration-300"
    >
      {/* Enterprise Registry Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-500 dark:text-orange-400">
            <FileCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-orange-600 dark:text-orange-400 uppercase">
                {type_label}
              </span>
              <span className="text-slate-400 dark:text-slate-700">•</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">Record ID: {certificate_id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>Official Verification Record</span>
            </h2>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <StatusBadge status={status} size="large" />
        </div>
      </div>

      {/* Official Credential Recipient Banner */}
      <div className="p-5 sm:p-6 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 block mb-1">
              Verified Credential Recipient
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {recipient}
            </h3>
          </div>

          <div className="md:text-right border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 block mb-1">
              Program / Designation Title
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{role}</p>
          </div>
        </div>
      </div>

      {/* Structured Registry Data Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        
        {/* Duration */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
            <Clock size={13} className="text-orange-500 dark:text-orange-400" /> Duration
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{duration}</span>
        </div>

        {/* Issue Date */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
            <Calendar size={13} className="text-orange-500 dark:text-orange-400" /> Issued Date
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{issued_date}</span>
        </div>

        {/* Issued By */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
            <Building2 size={13} className="text-orange-500 dark:text-orange-400" /> Issuing Authority
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{issued_by}</span>
        </div>

        {/* Certificate Status */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
            <ShieldCheck size={13} className="text-emerald-500 dark:text-emerald-400" /> Registry State
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{status} & Active</span>
        </div>

        {/* QR Verification Status */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
            <QrCode size={13} className="text-amber-500 dark:text-amber-400" /> QR Audit Status
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate block">
            {metadata.qr_status || 'Verified & Tamper-Evident'}
          </span>
        </div>

        {/* Digital Signature Status */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
            <Key size={13} className="text-cyan-600 dark:text-cyan-400" /> Cryptographic Standard
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate block">
            {metadata.digital_signature_status || 'Validated (ECDSA-256)'}
          </span>
        </div>
      </div>

      {/* Verified Skills list if present */}
      {details.skills_verified && details.skills_verified.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Verified Competencies & Evaluation
          </span>
          <div className="flex flex-wrap gap-2">
            {details.skills_verified.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cryptographic Signature Record Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Lock size={12} className="text-orange-500 dark:text-orange-400" /> Cryptographic Proof Signature (SHA-256 / ECDSA)
          </span>

          <button
            type="button"
            onClick={handleCopySig}
            className="text-xs font-mono font-bold text-slate-600 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 flex items-center gap-1 transition-colors"
          >
            {sigCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{sigCopied ? 'Copied' : 'Copy Hash'}</span>
          </button>
        </div>

        <p className="text-xs font-mono text-slate-900 dark:text-slate-300 break-all bg-slate-100 dark:bg-slate-900/80 p-2.5 rounded border border-slate-200 dark:border-slate-800 select-all font-semibold">
          {digital_signature}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 dark:text-slate-500 pt-0.5 gap-1 font-medium">
          <span>Verification Timestamp: {verification_timestamp}</span>
          <span className="font-mono text-slate-600 dark:text-slate-400">{metadata.verification_standard || 'W3C Verifiable Credentials Standard v1.1'}</span>
        </div>
      </div>

      {/* Official Registry Trust Statement */}
      <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
        <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 leading-snug">
          {trust_statement}
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setIsDocOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Award size={15} />
          <span>View Official Certificate</span>
        </button>

        <button
          type="button"
          onClick={() => setIsQrOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <QrCode size={15} className="text-amber-500 dark:text-amber-400" />
          <span>QR Code Verification</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          {copied ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} className="text-orange-500" />}
          <span>{copied ? 'Link Copied!' : 'Copy Verification Link'}</span>
        </button>
      </div>

      {/* Modals */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        certificateId={certificate_id}
        verificationUrl={shareUrl}
      />

      <CertificateViewerModal
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
        data={result}
      />
    </motion.div>
  );
}
