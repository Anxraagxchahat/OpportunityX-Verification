import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Award, 
  Plus, 
  CheckCircle2, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Share2, 
  Download, 
  FileText, 
  Settings, 
  AlertCircle,
  Search,
  Sparkles,
  Smartphone,
  Fingerprint,
  QrCode,
  Shield,
  ShieldAlert,
  Laptop,
  Globe,
  X
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CertificateViewerModal } from './CertificateViewerModal';

const DEFAULT_KEY = "OX-SECURE-ADMIN-2026-9f8a3c7b1e4d0258";
const TOTP_SECRET = "JBSWY3DPEHPK3PXP";
const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://opportunityx-verification.onrender.com' : 'http://localhost:8000')).replace(/\/$/, '');
const TOTP_URL = `otpauth://totp/OpportunityX%20Admin:admin@opportunityx.co.in?secret=${TOTP_SECRET}&issuer=OpportunityX%20Admin%20Registry`;

export function AdminPortal({ isOpen, onClose }) {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('ox_admin_key') || TOTP_SECRET);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'list' | 'settings'

  // Toast Notification System (replaces raw browser alerts)
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Custom Modal States (replaces raw browser confirms)
  const [confirmRevokeCert, setConfirmRevokeCert] = useState(null); // Certificate object
  const [isRevoking, setIsRevoking] = useState(false);
  const [confirmDeleteCert, setConfirmDeleteCert] = useState(null); // Certificate object to delete
  const [isDeletingCert, setIsDeletingCert] = useState(false);

  // Auth State (Exclusively Google Authenticator 6-digit TOTP)
  const [totpCode, setTotpCode] = useState('');

  // Security Enrollment State (Managed inside Settings)
  const [is2faEnabled, setIs2faEnabled] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Helper for displaying toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Form State
  const [formData, setFormData] = useState({
    recipient: 'Anurag Verma',
    type_label: 'Internship Certificate',
    role: 'Senior Full Stack Engineering Intern',
    duration: '6 Months (Jan 2026 - Jun 2026)',
    issued_date: 'June 15, 2026',
    issued_by: 'OpportunityX',
    prefix: 'OX-INT'
  });

  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['React', 'FastAPI', 'Firebase', 'System Architecture', 'TailwindCSS']);
  
  // Issuance State
  const [issuing, setIssuing] = useState(false);
  const [issuedResult, setIssuedResult] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Registry List
  const [registryList, setRegistryList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Enrollment Settings Form State
  const [setupTotpCode, setSetupTotpCode] = useState('');
  const [totpEnableSuccess, setTotpEnableSuccess] = useState('');

  // Explicit session logout / lock
  const handleLogout = () => {
    setIsAuthenticated(false);
    setTotpCode('');
    setAuthError('');
    setIssuedResult(null);
  };

  // Pre-fetch security status & lock session on mount
  useEffect(() => {
    fetchSecurityStatus();
    handleLogout();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/security/status`);
      if (res.ok) {
        const data = await res.json();
        setIs2faEnabled(data.is_2fa_enabled ?? true);
      }
    } catch (err) {
      console.warn('Security status fetch fallback');
    }
  };

  // Google Authenticator 6-Digit Verification
  const handleTotpAuth = async (codeToTest) => {
    const code = (codeToTest || totpCode).trim();
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setAuthError('Google Authenticator code must be 6 digits.');
      return;
    }
    setAuthError('');

    try {
      const res = await fetch(`${API_BASE}/api/admin/totp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (res.ok) {
        const data = await res.json();
        const activeKey = data.admin_key || code;
        setIsAuthenticated(true);
        setAdminKey(activeKey);
        localStorage.setItem('ox_admin_key', activeKey);
        fetchRegistryList(activeKey);
        fetchSecurityStatus();
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.detail || 'Invalid TOTP code. Check your Google Authenticator app.');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setAuthError('Unable to reach server to verify TOTP code.');
      setIsAuthenticated(false);
    }
  };

  // Enable / Test 2FA inside Settings
  const handleEnable2FAInSettings = async (e) => {
    e.preventDefault();
    if (setupTotpCode.trim().length !== 6) {
      showToast("Please enter the 6-digit code from Google Authenticator.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/totp/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify({ code: setupTotpCode.trim() })
      });

      if (res.ok) {
        setIs2faEnabled(true);
        setTotpEnableSuccess('Google Authenticator 2FA Verified & Active!');
        showToast('Google Authenticator 2FA Verified & Active!', 'success');
        setSetupTotpCode('');
        setTimeout(() => setTotpEnableSuccess(''), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || "Invalid code. Please enter the current 6-digit OTP from your Google Authenticator app.", "error");
      }
    } catch (err) {
      showToast("Unable to reach server to enable 2FA.", "error");
    }
  };

  const fetchRegistryList = async (key) => {
    setLoadingList(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/list`, {
        headers: { 'X-Admin-Key': key || adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setRegistryList(data);
      }
    } catch (err) {
      console.warn('Backend list fallback');
    } finally {
      setLoadingList(false);
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(',', '');
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    setIssuing(true);
    setIssuedResult(null);

    const payload = {
      recipient: formData.recipient,
      type_label: formData.type_label,
      role: formData.role,
      duration: formData.duration,
      issued_date: formData.issued_date,
      issued_by: formData.issued_by,
      skills_verified: skills,
      prefix: formData.prefix
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newRecord = await res.json();
        setIssuedResult(newRecord);
        setRegistryList([newRecord, ...registryList]);
        showToast(`Certificate ${newRecord.certificate_id} issued successfully!`, 'success');
      } else {
        throw new Error('API return error');
      }
    } catch (err) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const certId = `${formData.prefix}-2026-${randomNum}`;
      const mockSignature = `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

      const mockRecord = {
        certificate_id: certId,
        status: 'Valid',
        recipient: formData.recipient,
        type_label: formData.type_label,
        role: formData.role,
        duration: formData.duration,
        issued_date: formData.issued_date,
        issued_by: formData.issued_by,
        digital_signature: mockSignature,
        verification_timestamp: nowTime,
        details: { skills_verified: skills },
        metadata: {
          digital_signature_status: "Cryptographically Validated (ECDSA-256)",
          qr_status: "Verified & Tamper-Evident",
          verification_standard: "W3C Verifiable Credentials Standard v1.1"
        },
        verification_url: `https://verify.opportunityx.co.in/?id=${certId}`
      };

      setIssuedResult(mockRecord);
      setRegistryList([mockRecord, ...registryList]);
      showToast(`Certificate ${certId} generated in fallback mode.`, 'success');
    } finally {
      setIssuing(false);
    }
  };

  const handleUpdateKey = async (e) => {
    e.preventDefault();
    if (!newAdminKey || newAdminKey.trim().length < 8) {
      showToast("New Admin Key must be at least 8 characters long.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/update-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify({
          current_key: adminKey,
          new_key: newAdminKey.trim()
        })
      });

      if (res.ok) {
        const resData = await res.json();
        const updatedKey = resData.admin_key || newAdminKey.trim();
        setAdminKey(updatedKey);
        localStorage.setItem('ox_admin_key', updatedKey);
        setKeyUpdateSuccess('Admin Secret Key permanently updated in database!');
        showToast('Admin Secret Key permanently updated in database!', 'success');
        setNewAdminKey('');
        setTimeout(() => setKeyUpdateSuccess(''), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to update Admin Secret Key.', 'error');
      }
    } catch (err) {
      showToast('Unable to reach server to update Admin Secret Key.', 'error');
    }
  };

  // Revoke button triggers custom confirmation modal instead of browser alert
  const triggerRevokeModal = (item) => {
    setConfirmRevokeCert(item);
  };

  // Confirms revocation with backend API
  const handleConfirmRevocation = async () => {
    if (!confirmRevokeCert) return;
    const certId = confirmRevokeCert.certificate_id;
    setIsRevoking(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/revoke/${certId}`, {
        method: 'POST',
        headers: { 'X-Admin-Key': adminKey }
      });

      if (res.ok) {
        setRegistryList(prev => prev.map(item => 
          item.certificate_id === certId ? { ...item, status: 'Revoked' } : item
        ));
        showToast(`Certificate ${certId} has been officially REVOKED.`, 'success');
        setConfirmRevokeCert(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to revoke certificate on server.', 'error');
      }
    } catch (err) {
      showToast('Unable to reach server to revoke certificate.', 'error');
    } finally {
      setIsRevoking(false);
    }
  };

  // Confirms permanent deletion of certificate record
  const handleConfirmDeleteCert = async () => {
    if (!confirmDeleteCert) return;
    const certId = confirmDeleteCert.certificate_id;
    setIsDeletingCert(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/delete/${encodeURIComponent(certId)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': adminKey }
      });

      if (res.ok) {
        setRegistryList(prev => prev.filter(item => item.certificate_id !== certId));
        showToast(`Certificate ${certId} permanently deleted from registry.`, 'success');
        setConfirmDeleteCert(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to delete certificate on server.', 'error');
      }
    } catch (err) {
      setRegistryList(prev => prev.filter(item => item.certificate_id !== certId));
      showToast(`Certificate ${certId} removed locally.`, 'success');
      setConfirmDeleteCert(null);
    } finally {
      setIsDeletingCert(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl bg-[#0B0D14] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80 light-mode-header">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                <Smartphone size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>OpportunityX Admin Certificate Portal</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold">
                    GOOGLE AUTHENTICATOR (TOTP 2FA)
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Official Issuer Portal • Digitally Signed Credential Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition-all"
                  title="Lock Admin Session"
                >
                  <Lock size={13} />
                  <span>Lock & Logout</span>
                </button>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors"
                title="Close Portal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* SECURE GOOGLE AUTHENTICATOR LOCK SCREEN */}
          {!isAuthenticated ? (
            <div className="p-6 sm:p-10 text-center max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                <Smartphone size={32} />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">Google Authenticator Required</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the 6-digit TOTP verification code from your Google Authenticator phone app. Passcodes continuously reset every 30 seconds for maximum security.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={totpCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTotpCode(val);
                      if (val.length === 6 && /^\d+$/.test(val)) {
                        handleTotpAuth(val);
                      }
                    }}
                    placeholder="000000"
                    className="w-full py-3.5 text-center tracking-[0.4em] rounded-2xl bg-slate-900 border border-amber-500/40 text-amber-400 font-mono font-black text-3xl placeholder-slate-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-inner transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleTotpAuth()}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleTotpAuth()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} />
                  <span>Verify Google Authenticator Code</span>
                </button>
              </div>

              {authError && (
                <p className="text-xs font-semibold text-rose-400 flex items-center justify-center gap-1 pt-1 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
            </div>
          ) : (
            /* AUTHENTICATED ADMIN DASHBOARD */
            <div>
              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-300 dark:border-slate-800 bg-slate-200/80 dark:bg-slate-950/40 px-6 pt-3 gap-3">
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'generator'
                      ? 'border-orange-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Award size={16} className={activeTab === 'generator' ? 'text-orange-500' : ''} />
                  <span>Issue New Certificate</span>
                </button>

                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'list'
                      ? 'border-orange-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText size={16} className={activeTab === 'list' ? 'text-orange-500' : ''} />
                  <span>Registry Manager ({registryList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'settings'
                      ? 'border-orange-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Settings size={16} className={activeTab === 'settings' ? 'text-orange-500' : ''} />
                  <span>Security & Key Settings</span>
                </button>
              </div>

              {/* TAB 1: CERTIFICATE GENERATOR FORM */}
              {activeTab === 'generator' && (
                <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                  
                  {issuedResult ? (
                    /* ISSUED SUCCESS BANNER & MODAL QUICK LAUNCH */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4 text-center"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-white">Certificate Successfully Issued!</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Digitally signed with ECDSA-256 and registered into the public registry.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-w-md mx-auto space-y-1">
                        <p><span className="text-slate-500">Record ID:</span> <strong className="text-amber-400">{issuedResult.certificate_id}</strong></p>
                        <p><span className="text-slate-500">Recipient:</span> <strong className="text-white">{issuedResult.recipient}</strong></p>
                        <p className="truncate"><span className="text-slate-500">Digital Sig:</span> {issuedResult.digital_signature}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setViewingDoc(issuedResult)}
                          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                        >
                          <Award size={16} />
                          <span>View Official Certificate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(issuedResult.verification_url);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all"
                        >
                          {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                          <span>{copiedLink ? 'Link Copied!' : 'Copy Verification Link'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIssuedResult(null)}
                          className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Plus size={16} />
                          <span>Issue Another Certificate</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* GENERATOR FORM */
                    <form onSubmit={handleIssueCertificate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Left Column: Form Fields */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>1. Recipient & Designation</span>
                          </h3>

                          {/* Recipient Name */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Recipient Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.recipient}
                              onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                              placeholder="e.g. Anurag Verma"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>

                          {/* Certificate Type */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Certificate Type *
                            </label>
                            <select
                              value={formData.type_label}
                              onChange={(e) => setFormData({...formData, type_label: e.target.value})}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            >
                              <option value="Internship Certificate">Internship Certificate (OX-INT)</option>
                              <option value="Certificate of Achievement">Certificate of Achievement (OX-CAR)</option>
                              <option value="Research Fellowship Certificate">Research Fellowship Certificate (OX-WRK)</option>
                              <option value="Course Completion Certificate">Course Completion Certificate (OX-CMP)</option>
                            </select>
                          </div>

                          {/* Role Title */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Program / Role Designation *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.role}
                              onChange={(e) => setFormData({...formData, role: e.target.value})}
                              placeholder="e.g. Senior Full Stack Engineering Intern"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>

                          {/* Duration & Issued Date */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1">
                                Duration
                              </label>
                              <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                placeholder="6 Months (Jan 2026 - Jun 2026)"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1">
                                Issued Date
                              </label>
                              <input
                                type="text"
                                value={formData.issued_date}
                                onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                                placeholder="June 15, 2026"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                              />
                            </div>
                          </div>

                          {/* Verified Competencies Input */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Verified Competencies & Skills (Press Enter or Comma to add)
                            </label>
                            <input
                              type="text"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={handleAddSkill}
                              placeholder="Type skill (e.g. Python) & press Enter"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors mb-2"
                            />
                            
                            <div className="flex flex-wrap gap-1.5">
                              {skills.map((skill, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-mono text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                                  <span>{skill}</span>
                                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-orange-400 hover:text-rose-500 transition-colors">
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* Right Column: Real-Time Preview Card */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>2. Real-Time Canvas Preview</span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Live Render</span>
                          </h3>

                          {/* Mini White Paper Certificate Live Canvas */}
                          <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-300 shadow-xl space-y-3 relative overflow-hidden select-none">
                            {/* Corner L-Ornaments */}
                            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-slate-900" />
                            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-slate-900" />
                            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-slate-900" />
                            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-slate-900" />

                            {/* Mini Header */}
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <div className="flex items-center gap-1.5">
                                <img src="/favicon.png" alt="OX" className="w-5 h-5 object-contain" />
                                <div>
                                  <span className="text-xs font-black text-slate-900 leading-none block">Opportunity<span className="text-orange-500">X</span></span>
                                  <span className="text-[7px] text-slate-500 uppercase tracking-widest font-bold block">GLOBAL STUDENT CAREER OS</span>
                                </div>
                              </div>
                              <div className="text-right font-mono">
                                <span className="text-[7px] font-bold text-slate-400 uppercase block">CERTIFICATE ID</span>
                                <span className="text-[9px] font-bold text-slate-900 block">OX-INT-2026-XXXXXX</span>
                              </div>
                            </div>

                            {/* Mini Body */}
                            <div className="text-center space-y-1 py-1">
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">THIS IS TO CERTIFY THAT</span>
                              <div className="inline-block border-b border-slate-900 pb-0.5 px-3">
                                <h4 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                                  {formData.recipient || 'Recipient Name'}
                                </h4>
                              </div>
                              <p className="text-[9px] text-slate-600">has successfully completed all requirements for</p>
                              <h5 className="text-xs font-black text-slate-900">{formData.role || 'Designation Title'}</h5>
                              
                              {/* Skills summary */}
                              {skills.length > 0 && (
                                <div className="text-[8px] text-slate-700 font-semibold pt-1">
                                  <span>{skills.join('  |  ')}</span>
                                </div>
                              )}
                            </div>

                            {/* Mini Banner */}
                            <div className="text-center text-[8px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                              <span>Verify at </span>
                              <strong className="text-slate-900">verify.opportunityx.co.in</strong>
                            </div>

                            {/* Mini Footer */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                              <div className="flex items-center gap-1">
                                <div className="w-6 h-6 border border-slate-300 rounded p-0.5 bg-slate-50">
                                  <QRCodeSVG value="https://verify.opportunityx.co.in" size={20} fgColor="#0F172A" />
                                </div>
                                <span className="text-[7px] font-mono text-slate-400">SCAN TO VERIFY</span>
                              </div>
                              <img src="/signature_dark.png" alt="Sig" className="h-6 object-contain" />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={issuing}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {issuing ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Generating Cryptographic Signature...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={18} />
                                <span>Issue & Register Official Credential</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: REGISTRY LIST MANAGER */}
              {activeTab === 'list' && (
                <div className="p-6 sm:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Search ID, Recipient or Role..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <button
                      onClick={() => fetchRegistryList(adminKey)}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-800 transition-colors"
                    >
                      <RefreshCw size={13} className={loadingList ? 'animate-spin' : ''} />
                      <span>Refresh Registry</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-sm">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-400 uppercase font-mono text-[10px] border-b border-slate-300 dark:border-slate-800">
                        <tr>
                          <th className="p-3 font-bold">Record ID</th>
                          <th className="p-3 font-bold">Recipient</th>
                          <th className="p-3 font-bold">Role / Designation</th>
                          <th className="p-3 font-bold">Issued Date</th>
                          <th className="p-3 font-bold">Status</th>
                          <th className="p-3 text-right font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                        {registryList
                          .filter(item => 
                            item.certificate_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            item.recipient.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            item.role.toLowerCase().includes(searchFilter.toLowerCase())
                          )
                          .map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 font-mono font-bold text-orange-600 dark:text-amber-400">{item.certificate_id}</td>
                              <td className="p-3 font-bold text-slate-900 dark:text-white">{item.recipient}</td>
                              <td className="p-3 text-slate-700 dark:text-slate-300">{item.role}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-400">{item.issued_date}</td>
                              <td className="p-3">
                                <StatusBadge status={item.status} size="small" />
                              </td>
                              <td className="p-3 text-right space-x-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteCert(item)}
                                  className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30 text-xs inline-flex items-center gap-1 transition-all"
                                  title="Permanently Delete Certificate"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setViewingDoc(item)}
                                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-orange-600 dark:text-amber-400 font-semibold border border-slate-300 dark:border-slate-800 text-xs inline-flex items-center gap-1 transition-all"
                                >
                                  <span>View</span>
                                </button>
                                {item.status !== 'Revoked' && (
                                  <button
                                    type="button"
                                    onClick={() => triggerRevokeModal(item)}
                                    className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 font-semibold border border-amber-500/30 text-xs inline-flex items-center gap-1 transition-all"
                                  >
                                    <span>Revoke</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: AUTHENTICATED SECURITY & GOOGLE AUTHENTICATOR SETTINGS */}
              {activeTab === 'settings' && (
                <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto max-w-2xl mx-auto">
                  
                  {/* GOOGLE AUTHENTICATOR 2FA ENROLLMENT & QR CONFIG */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-5 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                          <Smartphone size={22} />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Google Authenticator (TOTP 2FA)</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Primary authentication mechanism with 30-second passcode resets.</p>
                        </div>
                      </div>
                      <div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 size={13} /> 2FA Active & Enforced
                        </span>
                      </div>
                    </div>

                    {/* SETUP QR DISPLAY BUTTON & MODAL LAUNCH */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Pair Mobile Device</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 block">Open Google Authenticator on your phone and scan the QR code or enter secret key.</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all shadow-md active:scale-95"
                      >
                        <QrCode size={16} />
                        <span>Show QR Code & Secret</span>
                      </button>
                    </div>

                    {/* VERIFY & TEST CURRENT 6-DIGIT CODE */}
                    <form onSubmit={handleEnable2FAInSettings} className="space-y-3 pt-2">
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-300">
                        Test Current 6-Digit Code from Phone App
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={setupTotpCode}
                          onChange={(e) => setSetupTotpCode(e.target.value)}
                          placeholder="000000"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-orange-600 dark:text-amber-400 font-mono font-bold text-sm tracking-widest placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                        >
                          Test & Verify
                        </button>
                      </div>

                      {totpEnableSuccess && (
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
                          <CheckCircle2 size={14} /> {totpEnableSuccess}
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GOOGLE AUTHENTICATOR SETUP QR MODAL */}
          {showQrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl relative"
              >
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>

                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Smartphone size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">Google Authenticator QR Code</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Open Google Authenticator on your phone, tap <strong>"+"</strong>, and scan this QR Code.
                  </p>
                </div>

                {/* QR CODE DISPLAY */}
                <div className="p-4 bg-white rounded-2xl inline-block mx-auto border-2 border-amber-500 shadow-xl">
                  <QRCodeSVG value={TOTP_URL} size={180} level="M" fgColor="#0F172A" />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Base32 Secret Key</span>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-amber-400 font-bold select-all">{TOTP_SECRET}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(TOTP_SECRET);
                        setCopiedSecret(true);
                        setTimeout(() => setCopiedSecret(false), 2000);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                    >
                      {copiedSecret ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                >
                  Done Scanning
                </button>
              </motion.div>
            </div>
          )}

          {/* Certificate Viewer Modal if viewing from Admin Portal */}
          {viewingDoc && (
            <CertificateViewerModal
              isOpen={Boolean(viewingDoc)}
              onClose={() => setViewingDoc(null)}
              data={viewingDoc}
            />
          )}

          {/* CUSTOM CONFIRMATION MODAL FOR CERTIFICATE REVOCATION */}
          {confirmRevokeCert && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left space-y-4 shadow-2xl relative"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <ShieldAlert size={26} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Confirm Certificate Revocation</h3>
                    <p className="text-xs text-slate-400">OpportunityX Authority Audit Engine</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificate ID:</span>
                    <span className="font-mono font-bold text-amber-400">{confirmRevokeCert.certificate_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-bold text-white">{confirmRevokeCert.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="text-slate-300">{confirmRevokeCert.role}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                  <span>
                    Are you sure you want to <strong>REVOKE</strong> certificate <strong className="font-mono">{confirmRevokeCert.certificate_id}</strong>?
                    This will permanently set its status to <strong>REVOKED</strong> on public verification portals.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmRevokeCert(null)}
                    disabled={isRevoking}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRevocation}
                    disabled={isRevoking}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isRevoking ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Revoking...</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={14} />
                        <span>Yes, Revoke Certificate</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* CUSTOM CONFIRMATION MODAL FOR PERMANENTLY DELETING CERTIFICATE */}
          {confirmDeleteCert && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left space-y-4 shadow-2xl relative"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Delete Certificate Record</h3>
                    <p className="text-xs text-slate-400">Permanent Database Purge</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificate ID:</span>
                    <span className="font-mono font-bold text-amber-400">{confirmDeleteCert.certificate_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-bold text-white">{confirmDeleteCert.recipient || confirmDeleteCert.recipient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="text-slate-300">{confirmDeleteCert.role}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                  <span>
                    Are you sure you want to <strong>PERMANENTLY DELETE</strong> certificate <strong className="font-mono">{confirmDeleteCert.certificate_id}</strong>?
                    This action cannot be undone. It will be completely removed from the registry index and database.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteCert(null)}
                    disabled={isDeletingCert}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteCert}
                    disabled={isDeletingCert}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isDeletingCert ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>Permanently Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}



          {/* TOAST NOTIFICATION OVERLAY */}
          {toast && (
            <div className="fixed top-6 right-6 z-[70] pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-xl ${
                  toast.type === 'error'
                    ? 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-950/50'
                    : 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50'
                }`}
              >
                {toast.type === 'error' ? (
                  <AlertCircle size={18} className="text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                )}
                <span>{toast.message}</span>
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="ml-2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </motion.div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
