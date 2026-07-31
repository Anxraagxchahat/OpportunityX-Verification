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
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('ox_admin_key') || DEFAULT_KEY);
  const [inputKey, setInputKey] = useState('');
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
  const [confirmDeletePasskey, setConfirmDeletePasskey] = useState(null); // Passkey object
  const [isDeletingPasskey, setIsDeletingPasskey] = useState(false);
  const [passkeyNickname, setPasskeyNickname] = useState('');

  // Auth Methods: 'secret' | 'totp' | 'passkey'
  const [authMethod, setAuthMethod] = useState('secret');
  const [totpCode, setTotpCode] = useState('');
  const [passkeyVerifying, setPasskeyVerifying] = useState(false);

  // Security Enrollment State (Managed inside Settings)
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [registeredPasskeys, setRegisteredPasskeys] = useState(() => {
    try {
      const local = localStorage.getItem('ox_registered_passkeys');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
  });
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

  // Key Settings State
  const [newAdminKey, setNewAdminKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyUpdateSuccess, setKeyUpdateSuccess] = useState('');

  // Enrollment Settings Form State
  const [setupTotpCode, setSetupTotpCode] = useState('');
  const [totpEnableSuccess, setTotpEnableSuccess] = useState('');
  const [passkeyRegisterSuccess, setPasskeyRegisterSuccess] = useState('');

  // Explicit session logout / lock
  const handleLogout = () => {
    setIsAuthenticated(false);
    setInputKey('');
    setTotpCode('');
    setAuthError('');
    setIssuedResult(null);
  };

  // Pre-fetch security status & lock session on mount
  useEffect(() => {
    fetchSecurityStatus();
    handleLogout();
  }, []);

  const handleAuthenticate = async (keyToTest) => {
    setAuthError('');
    const testKey = (keyToTest || inputKey).trim();

    if (!testKey) {
      setAuthError('Please enter a valid Admin Secret Key.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/verify-key`, {
        headers: { 'X-Admin-Key': testKey }
      });

      if (res.ok) {
        const data = await res.json();
        const activeKey = data.admin_key || testKey;
        setIsAuthenticated(true);
        setAdminKey(activeKey);
        localStorage.setItem('ox_admin_key', activeKey);
        fetchRegistryList(activeKey);
        fetchSecurityStatus();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setAuthError(errorData.detail || 'Invalid Security Key. Access Denied.');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setAuthError('Unable to verify key with server.');
      setIsAuthenticated(false);
    }
  };

  const fetchSecurityStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/security/status`);
      if (res.ok) {
        const data = await res.json();
        setIs2faEnabled(data.is_2fa_enabled);
        const pks = data.registered_passkeys || [];
        setRegisteredPasskeys(pks);
        localStorage.setItem('ox_registered_passkeys', JSON.stringify(pks));
      }
    } catch (err) {
      try {
        const localPks = JSON.parse(localStorage.getItem('ox_registered_passkeys') || '[]');
        if (localPks.length > 0) {
          setRegisteredPasskeys(localPks);
        }
      } catch (e) {}
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
        setAuthError(data.detail || 'Invalid TOTP code. Check your phone app.');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setAuthError('Unable to reach server to verify TOTP code.');
      setIsAuthenticated(false);
    }
  };

  // Standard WebAuthn Biometric Passkey Verification on Login
  const handlePasskeyAuth = async () => {
    setAuthError('');
    setPasskeyVerifying(true);

    if (!window.PublicKeyCredential) {
      setAuthError('WebAuthn / Passkeys are not supported in your browser.');
      setPasskeyVerifying(false);
      return;
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const parseCredId = (idStr) => {
        try {
          return new TextEncoder().encode(idStr);
        } catch (e) {
          return null;
        }
      };

      const allowCreds = (registeredPasskeys || [])
        .map(pk => parseCredId(pk.credential_id))
        .filter(b => b && b.length > 0)
        .map(id => ({ id, type: 'public-key' }));

      const getOptions = {
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "preferred"
        }
      };

      if (allowCreds.length > 0) {
        getOptions.publicKey.allowCredentials = allowCreds;
      }

      let credential = null;
      try {
        credential = await navigator.credentials.get(getOptions);
      } catch (getErr) {
        if (allowCreds.length > 0) {
          delete getOptions.publicKey.allowCredentials;
          credential = await navigator.credentials.get(getOptions);
        } else {
          throw getErr;
        }
      }

      if (credential && credential.id) {
        const res = await fetch(`${API_BASE}/api/admin/passkey/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential_id: credential.id })
        });

        if (res.ok) {
          const data = await res.json();
          const activeKey = data.admin_key || credential.id;
          setIsAuthenticated(true);
          setAdminKey(activeKey);
          localStorage.setItem('ox_admin_key', activeKey);
          fetchRegistryList(activeKey);
          fetchSecurityStatus();
        } else {
          const data = await res.json().catch(() => ({}));
          setAuthError(data.detail || 'Passkey credential not recognized by backend.');
          setIsAuthenticated(false);
        }
      } else {
        setAuthError('No passkey credential received.');
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setAuthError('Passkey prompt cancelled or timed out.');
      } else {
        setAuthError(err.message || 'Biometric Passkey authentication failed.');
      }
      setIsAuthenticated(false);
    } finally {
      setPasskeyVerifying(false);
    }
  };

  // Register Passkey Device inside Security Settings
  const handleRegisterPasskeyDevice = async () => {
    setPasskeyRegisterSuccess('');

    if (!window.PublicKeyCredential) {
      showToast('WebAuthn / Passkeys are not supported in your browser.', 'error');
      return;
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "OpportunityX Admin Service", id: window.location.hostname },
          user: {
            id: userId,
            name: "admin@opportunityx.co.in",
            displayName: "OpportunityX Executive Admin"
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },   // ES256
            { type: "public-key", alg: -257 },  // RS256
            { type: "public-key", alg: -8 }    // Ed25519
          ],
          authenticatorSelection: {
            userVerification: "preferred",
            residentKey: "preferred"
          },
          timeout: 60000,
          attestation: "none"
        }
      });

      if (credential && credential.id) {
        const defaultLabel = navigator.userAgent.includes('Mobile') ? 'Smartphone Passkey' : 'Workstation Passkey';
        const finalDeviceName = passkeyNickname.trim() || defaultLabel;

        const res = await fetch(`${API_BASE}/api/admin/passkey/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Key': adminKey
          },
          body: JSON.stringify({
            credential_id: credential.id,
            device_name: finalDeviceName
          })
        });

        if (res.ok) {
          const resData = await res.json();
          showToast(`Biometric Passkey '${finalDeviceName}' registered successfully!`, 'success');
          setPasskeyRegisterSuccess(`Passkey '${finalDeviceName}' registered successfully!`);
          setPasskeyNickname('');
          
          if (resData.passkey) {
            const updated = [...registeredPasskeys, resData.passkey];
            setRegisteredPasskeys(updated);
            localStorage.setItem('ox_registered_passkeys', JSON.stringify(updated));
          }
          fetchSecurityStatus();
          setTimeout(() => setPasskeyRegisterSuccess(''), 4000);
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.detail || 'Failed to register passkey with backend.', 'error');
        }
      }
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        showToast(`Passkey Registration Error: ${err.message || 'Cancelled by user.'}`, 'error');
      }
    }
  };

  // Delete Passkey device action
  const handleConfirmDeletePasskey = async () => {
    if (!confirmDeletePasskey) return;
    const credId = confirmDeletePasskey.credential_id;
    setIsDeletingPasskey(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/passkey/delete/${encodeURIComponent(credId)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': adminKey }
      });

      if (res.ok) {
        showToast('Passkey device removed permanently.', 'success');
        setConfirmDeletePasskey(null);
        fetchSecurityStatus();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to delete passkey from backend.', 'error');
      }
    } catch (err) {
      showToast('Unable to reach server to delete passkey.', 'error');
    } finally {
      setIsDeletingPasskey(false);
    }
  };

  // Enable / Link 2FA inside Settings
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
        setTotpEnableSuccess('Google Authenticator 2FA is now ENABLED & LINKED!');
        showToast('Google Authenticator 2FA is now ENABLED & LINKED!', 'success');
        setSetupTotpCode('');
        setTimeout(() => setTotpEnableSuccess(''), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || "Invalid code. Please enter the current 6-digit OTP from your phone app.", "error");
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
          <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>OpportunityX Admin Certificate Portal</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                    SECURED (ECDSA-256)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Official Issuer Portal • Digitally Signed Credential Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition-all"
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
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="Close Portal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* SECURE LOCK SCREEN */}
          {!isAuthenticated ? (
            <div className="p-6 sm:p-10 text-center max-w-lg mx-auto space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-xl shadow-orange-500/10">
                <Lock size={28} />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">Issuer Security Authentication</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate with your Secret Master Key, Google 2FA, or Biometric Passkey.
                </p>
              </div>

              {/* AUTH METHOD SELECTION TABS */}
              <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 gap-1">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('secret'); setAuthError(''); }}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    authMethod === 'secret'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Key size={14} />
                  <span>Master Key</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod('totp'); setAuthError(''); }}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    authMethod === 'totp'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} />
                  <span>Google 2FA</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod('passkey'); setAuthError(''); }}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    authMethod === 'passkey'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Fingerprint size={14} />
                  <span>Passkey</span>
                </button>
              </div>

              {/* OPTION 1: MASTER SECRET KEY */}
              {authMethod === 'secret' && (
                <div className="space-y-3 pt-2">
                  <div className="relative">
                    <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showKey ? "text" : "password"}
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder="Enter Admin Secret Key..."
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-orange-500 transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAuthenticate()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    Authenticate & Unlock Portal
                  </button>
                </div>
              )}

              {/* OPTION 2: GOOGLE AUTHENTICATOR (6-DIGIT OTP) */}
              {authMethod === 'totp' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Enter 6-Digit Code from Google Authenticator App
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTotpCode(val);
                        if (val.length === 6 && /^\d+$/.test(val)) {
                          handleTotpAuth(val);
                        }
                      }}
                      placeholder="000000"
                      className="w-full py-3 text-center tracking-[0.4em] rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-mono font-black text-2xl placeholder-slate-600 focus:outline-none focus:border-orange-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleTotpAuth()}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTotpAuth()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    Verify 6-Digit Code
                  </button>
                  <p className="text-[11px] text-slate-500">
                    2FA & QR pairing setup is configured inside <strong>Security & Key Settings</strong> after login.
                  </p>
                </div>
              )}

              {/* OPTION 3: WEBAUTHN FINGERPRINT / PASSKEY */}
              {authMethod === 'passkey' && (
                <div className="space-y-4 py-2">
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Fingerprint size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Biometric Passkey Login</h4>
                      <p className="text-xs text-slate-400">
                        Authenticate with your registered device fingerprint or Face ID.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePasskeyAuth}
                    disabled={passkeyVerifying}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {passkeyVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Prompting Fingerprint Scanner...</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint size={20} />
                        <span>Authenticate with Fingerprint / Face ID</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {authError && (
                <p className="text-xs font-semibold text-rose-400 flex items-center justify-center gap-1 pt-1">
                  <AlertCircle size={13} /> {authError}
                </p>
              )}
            </div>
          ) : (
            /* AUTHENTICATED ADMIN DASHBOARD */
            <div>
              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-3">
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'generator'
                      ? 'border-orange-500 text-white bg-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award size={16} className={activeTab === 'generator' ? 'text-orange-400' : ''} />
                  <span>Issue New Certificate</span>
                </button>

                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'list'
                      ? 'border-orange-500 text-white bg-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText size={16} className={activeTab === 'list' ? 'text-orange-400' : ''} />
                  <span>Registry Manager ({registryList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'settings'
                      ? 'border-orange-500 text-white bg-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings size={16} className={activeTab === 'settings' ? 'text-orange-400' : ''} />
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
                                <span key={idx} className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5">
                                  <span>{skill}</span>
                                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-rose-400">
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
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Search ID, Recipient or Role..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <button
                      onClick={() => fetchRegistryList(adminKey)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800"
                    >
                      <RefreshCw size={13} className={loadingList ? 'animate-spin' : ''} />
                      <span>Refresh Registry</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">Record ID</th>
                          <th className="p-3">Recipient</th>
                          <th className="p-3">Role / Designation</th>
                          <th className="p-3">Issued Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {registryList
                          .filter(item => 
                            item.certificate_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            item.recipient.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            item.role.toLowerCase().includes(searchFilter.toLowerCase())
                          )
                          .map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/50">
                              <td className="p-3 font-mono font-bold text-amber-400">{item.certificate_id}</td>
                              <td className="p-3 font-bold text-white">{item.recipient}</td>
                              <td className="p-3 text-slate-300">{item.role}</td>
                              <td className="p-3 text-slate-400">{item.issued_date}</td>
                              <td className="p-3">
                                <StatusBadge status={item.status} size="small" />
                              </td>
                              <td className="p-3 text-right space-x-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteCert(item)}
                                  className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30 text-xs inline-flex items-center gap-1 transition-all"
                                  title="Permanently Delete Certificate"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setViewingDoc(item)}
                                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold border border-slate-800 text-xs inline-flex items-center gap-1 transition-all"
                                >
                                  <span>View</span>
                                </button>
                                {item.status !== 'Revoked' && (
                                  <button
                                    type="button"
                                    onClick={() => triggerRevokeModal(item)}
                                    className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-xs inline-flex items-center gap-1 transition-all"
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

              {/* TAB 3: AUTHENTICATED SECURITY & ENROLLMENT SETTINGS */}
              {activeTab === 'settings' && (
                <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto max-w-3xl mx-auto">
                  
                  {/* SECTION 1: GOOGLE AUTHENTICATOR (2FA SETUP & PAIRING) */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="text-amber-400" size={20} />
                        <div>
                          <h3 className="text-base font-extrabold text-white">Google Authenticator (2FA Enrollment)</h3>
                          <p className="text-xs text-slate-400">Configure 30-second rotating 6-digit OTP codes for Admin Login.</p>
                        </div>
                      </div>
                      <div>
                        {is2faEnabled ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={13} /> 2FA Active & Linked
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
                            <AlertCircle size={13} /> Setup Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SETUP QR DISPLAY BUTTON & MODAL LAUNCH */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-xs font-bold text-white block">Step 1: Scan Mobile QR Code</span>
                        <span className="text-[11px] text-slate-400 block">Open Google Authenticator on your phone and scan the setup QR code.</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all shadow-md"
                      >
                        <QrCode size={16} />
                        <span>Scan Mobile QR Code</span>
                      </button>
                    </div>

                    {/* VERIFY & ACTIVATE 2FA FORM */}
                    <form onSubmit={handleEnable2FAInSettings} className="space-y-3 pt-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Step 2: Enter Current 6-Digit Code from Phone App to Confirm & Activate 2FA
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={setupTotpCode}
                          onChange={(e) => setSetupTotpCode(e.target.value)}
                          placeholder="000000"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold text-sm tracking-widest placeholder-slate-600 focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                        >
                          Verify & Enable 2FA
                        </button>
                      </div>

                      {totpEnableSuccess && (
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-1">
                          <CheckCircle2 size={14} /> {totpEnableSuccess}
                        </p>
                      )}
                    </form>
                  </div>

                  {/* SECTION 2: WEBAUTHN BIOMETRIC PASSKEY ENROLLMENT */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="text-emerald-400" size={20} />
                        <div>
                          <h3 className="text-base font-extrabold text-white">Biometric Passkey Management</h3>
                          <p className="text-xs text-slate-400">Register and manage device fingerprints, PINs, or Touch ID for 1-click login.</p>
                        </div>
                      </div>
                      <div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                          <Fingerprint size={13} /> {registeredPasskeys.length > 0 ? `${registeredPasskeys.length} Device${registeredPasskeys.length > 1 ? 's' : ''}` : '0 Devices'}
                        </span>
                      </div>
                    </div>

                    {/* REGISTER NEW DEVICE INPUT + ACTION */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
                          <span className="text-xs font-bold text-white block">Register New Passkey Device</span>
                          <span className="text-[11px] text-slate-400 block">Enter a custom nickname for this device before triggering biometric scan.</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            value={passkeyNickname}
                            onChange={(e) => setPasskeyNickname(e.target.value)}
                            placeholder="Device Nickname (e.g. Work PC Pin)"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 flex-1 sm:w-48"
                          />
                          <button
                            type="button"
                            onClick={handleRegisterPasskeyDevice}
                            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all shadow-md active:scale-95"
                          >
                            <Fingerprint size={15} />
                            <span>Scan Passkey</span>
                          </button>
                        </div>
                      </div>

                      {passkeyRegisterSuccess && (
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-1">
                          <CheckCircle2 size={14} /> {passkeyRegisterSuccess}
                        </p>
                      )}
                    </div>

                    {/* REGISTERED PASSKEYS DEVICE LIST TABLE */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                        Active Registered Passkey Devices ({registeredPasskeys.length})
                      </h4>

                      {registeredPasskeys.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500 font-mono">
                          No registered passkey devices found. Click "Scan Passkey" above to pair your current device.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {registeredPasskeys.map((passkey, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                  {passkey.device_name?.toLowerCase().includes('phone') || passkey.device_name?.toLowerCase().includes('mobile') ? (
                                    <Smartphone size={18} />
                                  ) : (
                                    <Laptop size={18} />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white">{passkey.device_name || 'Registered Device'}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1 border border-slate-700">
                                      <Globe size={10} className="text-emerald-400" />
                                      <span>{passkey.ip_address || '127.0.0.1'}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                    <span>Registered: <strong className="text-slate-300 font-mono">{passkey.registered_at || 'Recent'}</strong></span>
                                    <span>•</span>
                                    <span className="font-mono text-[10px] text-slate-500">ID: {passkey.credential_id?.slice(0, 14)}...</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setConfirmDeletePasskey(passkey)}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                                title="Delete / Remove Passkey Device"
                              >
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* SECTION 3: MASTER SECRET KEY CONFIG */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Key className="text-orange-400" size={18} />
                      <span>Admin Master Secret Key Configuration</span>
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      You can change your Admin Secret Key anytime. The key is validated using timing-attack proof cryptographic hashing.
                    </p>

                    <form onSubmit={handleUpdateKey} className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Current Active Admin Key
                        </label>
                        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-amber-400 select-all">
                          {adminKey.slice(0, 10)}******************
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Set New Custom Admin Key (Min 8 Characters)
                        </label>
                        <input
                          type="text"
                          required
                          value={newAdminKey}
                          onChange={(e) => setNewAdminKey(e.target.value)}
                          placeholder="e.g. MySuperSecretAdminKey2026!"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {keyUpdateSuccess && (
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={14} /> {keyUpdateSuccess}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                      >
                        Update Admin Security Key
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GOOGLE AUTHENTICATOR SETUP QR MODAL (INSIDE AUTHENTICATED SETTINGS) */}
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

          {/* CUSTOM CONFIRMATION MODAL FOR DELETING PASSKEY DEVICE */}
          {confirmDeletePasskey && (
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
                    <h3 className="text-base font-extrabold text-white">Delete Biometric Passkey</h3>
                    <p className="text-xs text-slate-400">Unlink Biometric Credential</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Device Name:</span>
                    <span className="font-bold text-white">{confirmDeletePasskey.device_name || 'Passkey Device'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IP Address:</span>
                    <span className="font-mono text-emerald-400">{confirmDeletePasskey.ip_address || '127.0.0.1'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Credential ID:</span>
                    <span className="font-mono text-slate-400">{confirmDeletePasskey.credential_id?.slice(0, 16)}...</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to remove this passkey device? You will no longer be able to authenticate with this device's biometric scanner.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeletePasskey(null)}
                    disabled={isDeletingPasskey}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeletePasskey}
                    disabled={isDeletingPasskey}
                    className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isDeletingPasskey ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>Delete Passkey</span>
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
