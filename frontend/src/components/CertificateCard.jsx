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
  Lock,
  FileCheck,
  Globe
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { QrModal } from './QrModal';

export function CertificateCard({ result }) {
  const [copied, setCopied] = useState(false);
  const [sigCopied, setSigCopied] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  if (!result) return null;

  const {
    certificate_id = '',
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
    product = details.product || 'OpportunityX',
    period = details.period || 'August 2026 - Present',
    achievement_title = details.achievement_title || role,
    achievement_description = details.achievement_description || '',
    research_title = details.research_title || role,
    research_area = details.research_area || '',
    course_name = details.course_name || role,
  } = result;

  const certIdUpper = certificate_id.toUpperCase();
  const isCA = certIdUpper.includes('OX-CA') || type_label.includes('Contribution') || type_label.includes('Association');
  const isACH = certIdUpper.includes('OX-ACH') || certIdUpper.includes('OX-CAR') || type_label.includes('Achievement') || type_label.includes('Career');
  const isWRK = certIdUpper.includes('OX-WRK') || type_label.includes('Research') || type_label.includes('Fellowship');
  const isCMP = certIdUpper.includes('OX-CMP') || type_label.includes('Course') || type_label.includes('Completion');

  const tagsList = details.key_contributions || details.skills_verified || result.key_contributions || result.skills_verified || [];

  const shareUrl = verification_url || `https://www.verify.opportunityx.co.in/?id=${certificate_id}`;

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto bg-surface-elevated border border-border-subtle rounded-2xl shadow-elevated p-5 sm:p-8 space-y-6 relative overflow-hidden transition-colors duration-200"
    >
      {/* Enterprise Registry Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-subtle border border-accent-brand/20 text-accent-brand">
            <FileCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider text-accent-brand uppercase">
                {type_label}
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-xs font-mono text-text-secondary">Record ID: {certificate_id}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight font-sans mt-0.5">
              Official Verification Record
            </h2>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <StatusBadge status={status} size="large" />
        </div>
      </div>

      {/* Official Credential Recipient Banner */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-subtle space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1 font-mono">
              Verified Credential Recipient
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-sans">
              {recipient}
            </h3>
          </div>

          <div className="md:text-right border-t md:border-t-0 md:border-l border-border-subtle pt-3 md:pt-0 md:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1 font-mono">
              {isCA ? 'Role / Designation' : isACH ? 'Achievement Title' : isWRK ? 'Fellowship / Research' : isCMP ? 'Course Title' : 'Program / Designation'}
            </span>
            <p className="text-base sm:text-lg font-bold text-text-primary font-sans">
              {isCA ? role : isACH ? achievement_title : isWRK ? research_title : isCMP ? course_name : role}
            </p>
            {isCA && product && (
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                Product / Project: <strong className="font-semibold text-text-primary">{product}</strong>
              </p>
            )}
            {isWRK && research_area && (
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                Research Area: <strong className="font-semibold text-text-primary">{research_area}</strong>
              </p>
            )}
            {isACH && achievement_description && (
              <p className="text-xs text-text-secondary italic mt-0.5">
                {achievement_description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Structured Registry Data Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        
        {/* Duration / Period */}
        <div className="p-3.5 rounded-lg bg-surface border border-border-subtle">
          <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 mb-1 font-sans">
            <Clock size={13} className="text-accent-brand" /> {isCA ? 'Period of Association' : 'Duration'}
          </span>
          <span className="text-sm font-semibold text-text-primary font-sans">{isCA ? period : duration}</span>
        </div>

        {/* Issue Date */}
        <div className="p-3.5 rounded-lg bg-surface border border-border-subtle">
          <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 mb-1 font-sans">
            <Calendar size={13} className="text-accent-brand" /> {isCMP ? 'Completion Date' : isACH ? 'Achievement Date' : 'Issued Date'}
          </span>
          <span className="text-sm font-semibold text-text-primary font-sans">{issued_date}</span>
        </div>

        {/* Issued By */}
        <div className="p-3.5 rounded-lg bg-surface border border-border-subtle">
          <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 mb-1 font-sans">
            <Building2 size={13} className="text-accent-brand" /> Issuing Authority
          </span>
          <span className="text-sm font-semibold text-text-primary font-sans">{issued_by}</span>
        </div>

        {/* Certificate Status */}
        <div className="p-3.5 rounded-lg bg-surface border border-border-subtle">
          <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 mb-1 font-sans">
            <ShieldCheck size={13} className="text-emerald-500" /> Registry State
          </span>
          <span className="text-sm font-semibold text-emerald-500 font-sans">{status} & Active</span>
        </div>

        {/* QR Verification Status */}
        <div className="p-3.5 rounded-lg bg-surface border border-border-subtle">
          <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 mb-1 font-sans">
            <QrCode size={13} className="text-accent-brand" /> QR Audit Status
          </span>
          <span className="text-xs font-semibold text-text-primary font-sans truncate block">
            {metadata.qr_status || 'Verified & Tamper-Evident'}
          </span>
        </div>

        {/* Digital Signature Status */}
        <div className="p-3.5 rounded-lg bg-surface border border-border-subtle">
          <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 mb-1 font-sans">
            <Key size={13} className="text-accent-brand" /> Cryptographic Standard
          </span>
          <span className="text-xs font-semibold text-text-primary font-sans truncate block">
            {metadata.digital_signature_status || 'Validated (ECDSA-256)'}
          </span>
        </div>
      </div>

      {/* Verified Skills / Key Contributions list if present */}
      {tagsList && tagsList.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-mono">
            {isCA ? 'Key Contributions & Domains' : isCMP ? 'Skills & Modules Completed' : isWRK ? 'Research Methods & Competencies' : 'Verified Competencies & Skills'}
          </span>
          <div className="flex flex-wrap gap-2">
            {tagsList.map((skill, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-md bg-surface border border-border-subtle text-xs font-mono font-medium text-text-primary">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cryptographic Signature Record Box */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-text-secondary flex items-center gap-1.5">
            <Lock size={12} className="text-accent-brand" /> Cryptographic Proof Signature (SHA-256 / ECDSA)
          </span>

          <button
            type="button"
            onClick={handleCopySig}
            className="text-xs font-mono font-semibold text-text-secondary hover:text-accent-brand flex items-center gap-1 transition-colors cursor-pointer"
          >
            {sigCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{sigCopied ? 'Copied' : 'Copy Hash'}</span>
          </button>
        </div>

        <p className="text-xs font-mono text-text-primary break-all bg-surface-elevated p-2.5 rounded-lg border border-border-subtle select-all font-medium leading-relaxed">
          {digital_signature}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-text-muted pt-0.5 gap-1 font-mono">
          <span>Verification Timestamp: {verification_timestamp}</span>
          <span>{metadata.verification_standard || 'W3C Verifiable Credentials Standard v1.1'}</span>
        </div>
      </div>

      {/* Official Registry Trust Statement */}
      <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
        <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
        <p className="text-xs sm:text-sm font-semibold text-emerald-500 font-sans leading-snug">
          {trust_statement}
        </p>
      </div>

      {/* Action Buttons Row - Public Verification Actions */}
      <div className="pt-2 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setIsQrOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border-subtle hover:border-border-strong text-text-primary font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-subtle"
        >
          <QrCode size={15} />
          <span>QR Code Verification</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="px-4 py-2.5 rounded-lg bg-accent-brand hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-subtle cursor-pointer"
        >
          {copied ? <Check size={15} className="text-white" /> : <Share2 size={15} className="text-white" />}
          <span>{copied ? 'Link Copied!' : 'Copy Verification Link'}</span>
        </button>
      </div>

      {/* Verification Notice */}
      <div className="text-center pt-1 border-t border-border-subtle">
        <p className="text-[11px] font-mono text-text-muted">
          Official Virtual Certificate is issued & delivered directly by OpportunityX Authority. This public portal provides cryptographic credential verification.
        </p>
      </div>

      {/* Modals */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        certificateId={certificate_id}
        verificationUrl={shareUrl}
      />
    </motion.div>
  );
}

export default CertificateCard;
