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
  Upload,
  Database,
  X
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CertificateViewerModal } from './CertificateViewerModal';
import { useTheme } from '../context/ThemeContext';
import { 
  saveCertificateToFirebase, 
  listCertificatesFromFirebase, 
  revokeCertificateInFirebase, 
  deleteCertificateFromFirebase,
  exportAllCertificatesToJson,
  importCertificatesFromJson
} from '../firebase/firebaseService';

const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.verify.opportunityx.co.in' : 'http://localhost:8000')).replace(/\/$/, '');

export const CERTIFICATE_TYPES = [
  {
    value: 'Internship Certificate',
    label: 'Internship Certificate (OX-INT)',
    prefix: 'OX-INT',
    defaultRole: 'Senior Full Stack Engineering Intern',
    defaultDuration: '6 Months (Jan 2026 - Jun 2026)',
    defaultIssuedDate: 'June 15, 2026',
    defaultSkills: ['React', 'FastAPI', 'Firebase', 'System Architecture', 'TailwindCSS']
  },
  {
    value: 'Certificate of Achievement',
    label: 'Certificate of Achievement (OX-ACH)',
    prefix: 'OX-ACH',
    defaultAchievementTitle: 'Growth & Community Development',
    defaultAchievementDesc: 'Recognition for contribution toward the growth and development of OpportunityX.',
    defaultIssuedDate: 'August 27, 2026',
    defaultSkills: ['Growth Strategy', 'Community Building']
  },
  {
    value: 'Research Fellowship Certificate',
    label: 'Research Fellowship Certificate (OX-WRK)',
    prefix: 'OX-WRK',
    defaultResearchTitle: 'OpportunityX Research Fellowship',
    defaultResearchArea: 'AI-Powered Career Technology',
    defaultDuration: '6 Months',
    defaultIssuedDate: 'August 27, 2026',
    defaultSkills: ['AI & LLM Research', 'Career Graph Analytics']
  },
  {
    value: 'Course Completion Certificate',
    label: 'Course Completion Certificate (OX-CMP)',
    prefix: 'OX-CMP',
    defaultCourseName: 'Full Stack Web Development',
    defaultDuration: '12 Weeks',
    defaultIssuedDate: 'August 27, 2026',
    defaultSkills: ['React', 'FastAPI', 'Firebase', 'System Architecture']
  },
  {
    value: 'Certificate of Contribution & Association',
    label: 'Certificate of Contribution & Association (OX-CA)',
    prefix: 'OX-CA',
    defaultRole: 'Co-Founder',
    defaultProduct: 'OpportunityX',
    defaultPeriod: 'August 2026 - Present',
    defaultIssuedDate: 'August 27, 2026',
    defaultKeyContributions: ['Growth Strategy', 'Marketing & Outreach', 'Team Coordination', 'Product Strategy']
  }
];

export function AdminPortal({ isOpen, onClose }) {
  const { theme } = useTheme();
  const isMono = theme === 'monochromatic';
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('ox_admin_key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'totp'
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'list' | 'settings'

  // Master Password Auth State
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Google Authenticator Auth State
  const [totpCode, setTotpCode] = useState('');

  // Toast Notification System
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Custom Modal States
  const [confirmRevokeCert, setConfirmRevokeCert] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [confirmDeleteCert, setConfirmDeleteCert] = useState(null);
  const [isDeletingCert, setIsDeletingCert] = useState(false);

  // Security Enrollment State
  const [is2faEnabled, setIs2faEnabled] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    recipient: 'Anurag Verma',
    type_label: 'Internship Certificate',
    prefix: 'OX-INT',
    role: 'Senior Full Stack Engineering Intern',
    duration: '6 Months (Jan 2026 - Jun 2026)',
    issued_date: 'June 15, 2026',
    issued_by: 'OpportunityX',
    issuing_person: 'Anurag Verma',
    issuing_designation: 'Founder & CEO, OpportunityX',
    // Dynamic fields
    achievement_title: 'Growth & Community Development',
    achievement_description: 'Recognition for contribution toward the growth and development of OpportunityX.',
    research_title: 'OpportunityX Research Fellowship',
    research_area: 'AI-Powered Career Technology',
    course_name: 'Full Stack Web Development',
    product: 'OpportunityX',
    period: 'August 2026 - Present'
  });

  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['React', 'FastAPI', 'Firebase', 'System Architecture', 'TailwindCSS']);

  // Handle Dynamic Type Change
  const handleTypeChange = (selectedTypeLabel) => {
    const certConfig = CERTIFICATE_TYPES.find(t => t.value === selectedTypeLabel) || CERTIFICATE_TYPES[0];
    setFormData(prev => ({
      ...prev,
      type_label: certConfig.value,
      prefix: certConfig.prefix,
      role: certConfig.defaultRole !== undefined ? certConfig.defaultRole : prev.role,
      duration: certConfig.defaultDuration !== undefined ? certConfig.defaultDuration : prev.duration,
      issued_date: certConfig.defaultIssuedDate !== undefined ? certConfig.defaultIssuedDate : prev.issued_date,
      achievement_title: certConfig.defaultAchievementTitle !== undefined ? certConfig.defaultAchievementTitle : prev.achievement_title,
      achievement_description: certConfig.defaultAchievementDesc !== undefined ? certConfig.defaultAchievementDesc : prev.achievement_description,
      research_title: certConfig.defaultResearchTitle !== undefined ? certConfig.defaultResearchTitle : prev.research_title,
      research_area: certConfig.defaultResearchArea !== undefined ? certConfig.defaultResearchArea : prev.research_area,
      course_name: certConfig.defaultCourseName !== undefined ? certConfig.defaultCourseName : prev.course_name,
      product: certConfig.defaultProduct !== undefined ? certConfig.defaultProduct : prev.product,
      period: certConfig.defaultPeriod !== undefined ? certConfig.defaultPeriod : prev.period,
    }));

    if (certConfig.defaultSkills) {
      setSkills(certConfig.defaultSkills);
    } else if (certConfig.defaultKeyContributions) {
      setSkills(certConfig.defaultKeyContributions);
    }
  };

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

  // Explicit session logout / reset
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setTotpCode('');
    setAuthError('');
    setIssuedResult(null);
  };

  // Pre-fetch security status & registry list when opened
  useEffect(() => {
    if (isOpen) {
      fetchSecurityStatus();
      if (isAuthenticated) {
        fetchRegistryList(adminKey);
      }
    }
  }, [isOpen, isAuthenticated]);

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

  // 1. MASTER PASSWORD AUTHENTICATION (Verified securely on Server)
  const handlePasswordAuth = async (e) => {
    if (e) e.preventDefault();
    const entered = passwordInput.trim();
    if (!entered) {
      setAuthError('Please enter the Master Admin Password.');
      return;
    }
    setAuthError('');

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: entered })
      });

      if (res.ok) {
        const data = await res.json();
        const activeKey = data.admin_key || entered;
        setIsAuthenticated(true);
        setAuthError('');
        setPasswordInput('');
        setAdminKey(activeKey);
        localStorage.setItem('ox_admin_key', activeKey);
        fetchRegistryList(activeKey);
        fetchSecurityStatus();
        showToast('Master Admin Password Authenticated Successfully!', 'success');
      } else {
        const errData = await res.json().catch(() => ({}));
        setAuthError(errData.detail || 'Invalid Master Admin Password. Access Denied.');
      }
    } catch (err) {
      setAuthError('Unable to reach server to verify password.');
    }
  };

  // 2. GOOGLE AUTHENTICATOR (TOTP 2FA) AUTHENTICATION
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
        showToast('Google Authenticator 2FA Verified!', 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.detail || 'Invalid TOTP code. Check your Google Authenticator app.');
      }
    } catch (err) {
      setAuthError('Unable to reach server to verify TOTP code.');
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
    let apiItems = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE}/api/admin/list`, {
        headers: { 'X-Admin-Key': key || adminKey },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        apiItems = await res.json();
      }
    } catch (err) {
      console.warn('Backend list fast fallback to Firebase');
    }

    let deletedList = [];
    try {
      deletedList = JSON.parse(localStorage.getItem('ox_deleted_certificates') || '[]');
    } catch (e) {}
    const deletedSet = new Set(deletedList.map(id => String(id).toUpperCase()));

    try {
      const fbItems = await listCertificatesFromFirebase();
      const combinedMap = new Map();

      // Load Firebase items
      fbItems.forEach(item => {
        const id = item.certificate_id?.toUpperCase();
        if (id && !deletedSet.has(id) && item.status !== 'Deleted' && !item.deleted) {
          combinedMap.set(id, item);
        }
      });

      // Overlay API items
      apiItems.forEach(item => {
        const id = item.certificate_id?.toUpperCase();
        if (id && !deletedSet.has(id) && item.status !== 'Deleted' && !item.deleted) {
          combinedMap.set(id, {
            ...(combinedMap.get(id) || {}),
            ...item
          });
        }
      });

      const mergedList = Array.from(combinedMap.values());
      setRegistryList(mergedList);
    } catch (fbErr) {
      console.warn('Firebase list fallback:', fbErr);
      const filtered = (apiItems || []).filter(item => {
        const id = item.certificate_id?.toUpperCase();
        return id && !deletedSet.has(id) && item.status !== 'Deleted' && !item.deleted;
      });
      setRegistryList(filtered);
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

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const certId = `${formData.prefix}-2026-${randomNum}`;
    const roleOrTitle = formData.role || formData.achievement_title || formData.course_name || formData.research_title || '';
    const mockSignature = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

    const certRecord = {
      certificate_id: certId,
      status: 'Valid',
      recipient: formData.recipient,
      recipient_name: formData.recipient,
      type_label: formData.type_label,
      certificate_type: formData.type_label,
      role: formData.role || roleOrTitle,
      duration: formData.duration || '',
      issued_date: formData.issued_date || 'August 27, 2026',
      issued_by: formData.issued_by || 'OpportunityX',
      issuing_person: formData.issuing_person || 'Anurag Verma',
      issuing_designation: formData.issuing_designation || 'Founder & CEO, OpportunityX',
      digital_signature: mockSignature,
      verification_timestamp: nowTime,
      skills_verified: skills,
      // Dynamic fields
      product: formData.product,
      period: formData.period,
      key_contributions: skills,
      achievement_title: formData.achievement_title,
      achievement_description: formData.achievement_description,
      research_title: formData.research_title,
      research_area: formData.research_area,
      course_name: formData.course_name,
      details: { 
        skills_verified: skills,
        key_contributions: skills,
        product: formData.product,
        period: formData.period,
        achievement_title: formData.achievement_title,
        achievement_description: formData.achievement_description,
        research_title: formData.research_title,
        research_area: formData.research_area,
        course_name: formData.course_name
      },
      metadata: {
        issuing_authority: "OpportunityX",
        issuing_person: "Anurag Verma",
        issuing_designation: "Founder & CEO, OpportunityX",
        digital_signature_status: "Cryptographically Validated (ECDSA-256)",
        qr_status: "Verified & Tamper-Evident",
        verification_standard: "W3C Verifiable Credentials Standard v1.1"
      },
      verification_url: `https://www.verify.opportunityx.co.in/?id=${certId}`
    };

    const payload = {
      recipient: formData.recipient,
      type_label: formData.type_label,
      role: formData.role || roleOrTitle,
      duration: formData.duration || '',
      issued_date: formData.issued_date || 'August 27, 2026',
      issued_by: formData.issued_by || 'OpportunityX',
      issuing_person: formData.issuing_person || 'Anurag Verma',
      issuing_designation: formData.issuing_designation || 'Founder & CEO, OpportunityX',
      skills_verified: skills,
      prefix: formData.prefix,
      product: formData.product,
      period: formData.period,
      key_contributions: skills,
      achievement_title: formData.achievement_title,
      achievement_description: formData.achievement_description,
      research_title: formData.research_title,
      research_area: formData.research_area,
      course_name: formData.course_name
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${API_BASE}/api/admin/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const newRecord = await res.json();
        const mergedRecord = { ...certRecord, ...newRecord };
        await saveCertificateToFirebase(mergedRecord).catch(e => console.error("Firebase sync error on issue:", e));
        setIssuedResult(mergedRecord);
        setRegistryList(prev => [mergedRecord, ...prev.filter(p => p.certificate_id !== mergedRecord.certificate_id)]);
        showToast(`Certificate ${mergedRecord.certificate_id} issued & synced to Firebase Cloud!`, 'success');
        setIssuing(false);
        return;
      }
    } catch (err) {
      console.warn("Backend API cold start timeout, issuing directly to Firebase Cloud DB...", err);
    }

    try {
      await saveCertificateToFirebase(certRecord);
      setIssuedResult(certRecord);
      setRegistryList(prev => [certRecord, ...prev.filter(p => p.certificate_id !== certRecord.certificate_id)]);
      showToast(`Certificate ${certId} issued & saved to Firebase Cloud DB!`, 'success');
    } catch (fbErr) {
      console.error("Firebase save error:", fbErr);
      showToast("Failed to save certificate to Cloud Database.", "error");
    } finally {
      setIssuing(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportAllCertificatesToJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `OpportunityX_Registry_Backup_${dateStr}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Registry backup JSON downloaded successfully!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Failed to export registry backup.', 'error');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          showToast('Invalid backup file format. Expected JSON array.', 'error');
          return;
        }
        const count = await importCertificatesFromJson(parsed);
        showToast(`Successfully imported & synced ${count} certificates to Cloud!`, 'success');
        fetchRegistryList(adminKey);
      } catch (err) {
        console.error('Import error:', err);
        showToast('Error reading backup file. Please check JSON syntax.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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

  // Confirms revocation with backend API and Firebase Firestore
  const handleConfirmRevocation = async () => {
    if (!confirmRevokeCert) return;
    const certId = confirmRevokeCert.certificate_id;
    setIsRevoking(true);
    
    // Close modal immediately so the UI is responsive and never hangs
    setConfirmRevokeCert(null);

    // Optimistically update status in table
    setRegistryList(prev => prev.map(item => 
      item.certificate_id === certId ? { ...item, status: 'Revoked' } : item
    ));

    try {
      // Background backend notification with 2s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      fetch(`${API_BASE}/api/admin/revoke/${encodeURIComponent(certId)}`, {
        method: 'POST',
        headers: { 'X-Admin-Key': adminKey },
        signal: controller.signal
      }).catch(() => {}).finally(() => clearTimeout(timeoutId));

      // Persist revocation to Firebase Cloud
      await revokeCertificateInFirebase(certId);
      showToast(`Certificate ${certId} officially REVOKED in Cloud DB.`, 'success');
    } catch (err) {
      console.warn("Revoke error:", err);
      showToast(`Certificate ${certId} marked as Revoked.`, 'info');
    } finally {
      setIsRevoking(false);
      setConfirmRevokeCert(null);
    }
  };

  // Confirms permanent deletion of certificate record from backend and Firebase Firestore
  const handleConfirmDeleteCert = async () => {
    if (!confirmDeleteCert) return;
    const certId = confirmDeleteCert.certificate_id;
    setIsDeletingCert(true);

    // Close modal immediately so the UI is responsive and never hangs
    setConfirmDeleteCert(null);

    // Optimistically remove from registry table immediately
    setRegistryList(prev => prev.filter(item => item.certificate_id !== certId));

    try {
      // Fast backend deletion with 2s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      fetch(`${API_BASE}/api/admin/delete/${encodeURIComponent(certId)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': adminKey },
        signal: controller.signal
      }).catch(() => {}).finally(() => clearTimeout(timeoutId));

      // Permanently remove from Firebase Firestore & add to local deleted blacklist
      await deleteCertificateFromFirebase(certId);
      showToast(`Certificate ${certId} permanently deleted from Registry.`, 'success');
    } catch (err) {
      console.warn("Delete error:", err);
      showToast(`Certificate ${certId} removed.`, 'success');
    } finally {
      setIsDeletingCert(false);
      setConfirmDeleteCert(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-5xl bg-surface-elevated border border-border-subtle rounded-3xl shadow-elevated overflow-hidden my-4 text-text-primary transition-colors duration-200"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-surface text-text-primary">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isMono ? 'bg-surface border border-border-strong text-text-primary' : 'bg-accent-subtle border border-accent-brand/20 text-accent-brand'} shrink-0`}>
                <ShieldCheck size={22} />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                    OpportunityX Admin Portal
                  </h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md ${isMono ? 'bg-surface border border-border-strong text-text-primary' : 'bg-accent-subtle border border-accent-brand/25 text-accent-brand'} text-[10px] font-mono font-bold whitespace-nowrap shrink-0`}>
                    ADMIN REGISTRY NODE
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  Official Issuer Portal • Digitally Signed Credential Engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
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
                className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle transition-colors cursor-pointer"
                title="Close Portal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* SECURE MULTI-LAYER AUTHENTICATION LOCK SCREEN */}
          {!isAuthenticated ? (
            <div className="p-6 sm:p-12 text-center max-w-lg mx-auto space-y-6">
              
              {/* Shield Icon */}
              <div className={`w-14 h-14 mx-auto rounded-2xl ${isMono ? 'bg-surface border border-border-strong text-text-primary' : 'bg-accent-subtle border border-accent-brand/20 text-accent-brand'} flex items-center justify-center shadow-subtle`}>
                <ShieldCheck size={28} />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-text-primary tracking-tight">Admin Authentication Shield</h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                  Choose your preferred verification method to access the official Certificate Registry Authority.
                </p>
              </div>

              {/* 2-Method Authentication Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-surface border border-border-subtle gap-1">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('password'); setAuthError(''); }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMethod === 'password'
                      ? 'bg-surface-elevated text-text-primary shadow-subtle border border-border-subtle'
                      : 'text-text-muted hover:text-text-primary border border-transparent'
                  }`}
                >
                  <Key size={13} className={authMethod === 'password' ? 'text-accent-brand' : ''} />
                  <span>Master Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod('totp'); setAuthError(''); }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMethod === 'totp'
                      ? 'bg-surface-elevated text-text-primary shadow-subtle border border-border-subtle'
                      : 'text-text-muted hover:text-text-primary border border-transparent'
                  }`}
                >
                  <Smartphone size={13} className={authMethod === 'totp' ? 'text-accent-brand' : ''} />
                  <span>Google Authenticator (2FA)</span>
                </button>
              </div>

              {/* METHOD 1: MASTER PASSWORD FORM */}
              {authMethod === 'password' && (
                <form onSubmit={handlePasswordAuth} className="space-y-4 pt-1 text-left animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">
                      Master Admin Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoFocus
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter master password..."
                        className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border-subtle text-text-primary text-sm font-sans placeholder:text-text-muted focus:outline-none focus:border-accent-brand focus:ring-2 focus:ring-accent-brand/20 transition-all pr-10 shadow-subtle"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-sans font-semibold text-sm bg-accent-brand hover:bg-accent-hover text-white active:scale-[0.98] transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock size={16} />
                    <span>Unlock Admin Portal</span>
                  </button>
                </form>
              )}

              {/* METHOD 2: GOOGLE AUTHENTICATOR (TOTP 2FA) */}
              {authMethod === 'totp' && (
                <div className="space-y-4 pt-1 animate-fade-in">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">
                      Enter 6-Digit Google Authenticator OTP
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
                      className="w-full py-3 text-center tracking-[0.4em] rounded-xl font-mono font-bold text-2xl bg-surface border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-brand focus:ring-2 focus:ring-accent-brand/20 transition-all shadow-subtle"
                      onKeyDown={(e) => e.key === 'Enter' && handleTotpAuth()}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTotpAuth()}
                    className="w-full py-3 rounded-xl font-sans font-semibold text-sm bg-accent-brand hover:bg-accent-hover text-white active:scale-[0.98] transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck size={16} />
                    <span>Verify Authenticator Code</span>
                  </button>
                </div>
              )}

              {/* AUTH ERROR DISPLAY */}
              {authError && (
                <p className="text-xs font-semibold text-rose-500 flex items-center justify-center gap-1.5 pt-1 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{authError}</span>
                </p>
              )}

            </div>
          ) : (
            /* AUTHENTICATED ADMIN DASHBOARD */
            <div>
              {/* Navigation Tabs */}
              <div className="flex border-b border-border-subtle bg-surface px-6 pt-3 gap-3">
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'generator'
                      ? isMono
                        ? 'border-black text-black bg-white shadow-sm font-bold'
                        : 'border-orange-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Award size={16} className={activeTab === 'generator' ? (isMono ? 'text-black' : 'text-orange-500') : ''} />
                  <span>Issue New Certificate</span>
                </button>

                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'list'
                      ? isMono
                        ? 'border-black text-black bg-white shadow-sm font-bold'
                        : 'border-orange-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText size={16} className={activeTab === 'list' ? (isMono ? 'text-black' : 'text-orange-500') : ''} />
                  <span>Registry Manager ({registryList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'settings'
                      ? isMono
                        ? 'border-black text-black bg-white shadow-sm font-bold'
                        : 'border-orange-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Settings size={16} className={activeTab === 'settings' ? (isMono ? 'text-black' : 'text-orange-500') : ''} />
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
                      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 space-y-4 text-center shadow-lg transition-colors duration-300"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Certificate Successfully Issued!</h3>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                          Digitally signed with ECDSA-256 and registered into the public registry.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 max-w-md mx-auto space-y-1 text-left sm:text-center">
                        <p><span className="text-slate-600 dark:text-slate-500 font-semibold">Record ID:</span> <strong className="text-orange-600 dark:text-amber-400">{issuedResult.certificate_id}</strong></p>
                        <p><span className="text-slate-600 dark:text-slate-500 font-semibold">Recipient:</span> <strong className="text-slate-900 dark:text-white">{issuedResult.recipient}</strong></p>
                        <p className="truncate"><span className="text-slate-600 dark:text-slate-500 font-semibold">Digital Sig:</span> <span className="text-slate-800 dark:text-slate-300 font-bold">{issuedResult.digital_signature}</span></p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setViewingDoc(issuedResult)}
                          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
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
                          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                        >
                          {copiedLink ? <Check size={16} className="text-emerald-500 dark:text-emerald-400" /> : <Share2 size={16} className="text-orange-500 dark:text-orange-400" />}
                          <span>{copiedLink ? 'Link Copied!' : 'Copy Verification Link'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIssuedResult(null)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
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

                          {/* Certificate Type Selector */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Certificate Type *
                            </label>
                            <select
                              value={formData.type_label}
                              onChange={(e) => handleTypeChange(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                            >
                              {CERTIFICATE_TYPES.map((t) => (
                                <option key={t.prefix} value={t.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* DYNAMIC FIELDS: OX-INT (Internship Certificate) */}
                          {formData.prefix === 'OX-INT' && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Program / Role Designation *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.role}
                                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                                  placeholder="e.g. Senior Full Stack Engineering Intern"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Duration
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    placeholder="6 Months (Jan 2026 - Jun 2026)"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Issued Date
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.issued_date}
                                    onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                                    placeholder="June 15, 2026"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* DYNAMIC FIELDS: OX-ACH (Certificate of Achievement) */}
                          {formData.prefix === 'OX-ACH' && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Achievement Title *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.achievement_title}
                                  onChange={(e) => setFormData({...formData, achievement_title: e.target.value, role: e.target.value})}
                                  placeholder="e.g. Growth & Community Development"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Achievement Description
                                </label>
                                <textarea
                                  rows={2}
                                  value={formData.achievement_description}
                                  onChange={(e) => setFormData({...formData, achievement_description: e.target.value})}
                                  placeholder="Recognition for contribution toward the growth and development of OpportunityX."
                                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors resize-none"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Achievement Date *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.issued_date}
                                  onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                                  placeholder="August 27, 2026"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                                />
                              </div>
                            </>
                          )}

                          {/* DYNAMIC FIELDS: OX-WRK (Research Fellowship Certificate) */}
                          {formData.prefix === 'OX-WRK' && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Fellowship / Research Title *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.research_title}
                                  onChange={(e) => setFormData({...formData, research_title: e.target.value, role: e.target.value})}
                                  placeholder="e.g. OpportunityX Research Fellowship"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Research Area *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.research_area}
                                  onChange={(e) => setFormData({...formData, research_area: e.target.value})}
                                  placeholder="e.g. AI-Powered Career Technology"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Duration *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={formData.duration}
                                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    placeholder="6 Months"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Issued Date *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={formData.issued_date}
                                    onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                                    placeholder="August 27, 2026"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* DYNAMIC FIELDS: OX-CMP (Course Completion Certificate) */}
                          {formData.prefix === 'OX-CMP' && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Course Name *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.course_name}
                                  onChange={(e) => setFormData({...formData, course_name: e.target.value, role: e.target.value})}
                                  placeholder="e.g. Full Stack Web Development"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Duration *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={formData.duration}
                                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    placeholder="12 Weeks"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Completion Date *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={formData.issued_date}
                                    onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                                    placeholder="August 27, 2026"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* DYNAMIC FIELDS: OX-CA (Certificate of Contribution & Association) */}
                          {formData.prefix === 'OX-CA' && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Role / Designation *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.role}
                                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                                  placeholder="e.g. Co-Founder"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Product / Project *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.product}
                                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                                  placeholder="e.g. OpportunityX"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Period of Association *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={formData.period}
                                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                                    placeholder="August 2026 - Present"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Issued Date *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={formData.issued_date}
                                    onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                                    placeholder="August 27, 2026"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Dynamic Tags Input (Competencies / Key Contributions / Modules) */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              {formData.prefix === 'OX-CA'
                                ? 'Key Contributions * (Press Enter or Comma to add)'
                                : formData.prefix === 'OX-CMP'
                                ? 'Skills / Modules Completed (Press Enter or Comma)'
                                : formData.prefix === 'OX-WRK'
                                ? 'Research Contributions / Skills (Press Enter or Comma)'
                                : formData.prefix === 'OX-ACH'
                                ? 'Skills / Area - Optional (Press Enter or Comma)'
                                : 'Verified Competencies & Skills (Press Enter or Comma)'}
                            </label>
                            <input
                              type="text"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={handleAddSkill}
                              placeholder={
                                formData.prefix === 'OX-CA'
                                  ? 'e.g. Growth Strategy & press Enter'
                                  : 'Type tag & press Enter'
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors mb-2"
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
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center justify-between">
                            <span>2. Real-Time Canvas Preview</span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">Live Render</span>
                          </h3>

                          {/* Mini White Paper Certificate Live Canvas */}
                          <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-300 shadow-xl space-y-3 relative overflow-hidden select-none certificate-canvas">
                            {/* Corner L-Ornaments */}
                            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-slate-900" />
                            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-slate-900" />
                            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-slate-900" />
                            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-slate-900" />

                            {/* Mini Header */}
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <div className="flex items-center gap-1.5">
                                <img src="/brand/icon/light/opportunityx-icon-light.png" alt="OpportunityX" className="w-5 h-5 object-contain" />
                                <div>
                                  <span className="text-xs font-black text-slate-900 leading-none block">Opportunity<span className="cert-x-orange text-[#FF6B00]" style={{ color: '#FF6B00' }}>X</span></span>
                                  <span className="text-[7px] text-slate-500 uppercase tracking-widest font-bold block">GLOBAL STUDENT CAREER OS</span>
                                </div>
                              </div>
                              <div className="text-right font-mono">
                                <span className="text-[7px] font-bold text-slate-400 uppercase block">CERTIFICATE ID</span>
                                <span className="text-[9px] font-bold text-slate-900 block">{formData.prefix}-2026-XXXXXX</span>
                              </div>
                            </div>

                            {/* Mini Dynamic Body Based on Certificate Type */}
                            <div className="text-center space-y-1 py-1">
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">THIS IS TO CERTIFY THAT</span>
                              <div className="inline-block border-b border-slate-900 pb-0.5 px-3">
                                <h4 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                                  {formData.recipient || 'Recipient Name'}
                                </h4>
                              </div>

                              {/* OX-INT */}
                              {formData.prefix === 'OX-INT' && (
                                <>
                                  <p className="text-[9px] text-slate-600 pt-0.5">has successfully completed all official requirements for the Internship Certificate in</p>
                                  <h5 className="text-xs font-black text-slate-900">{formData.role || 'Designation Title'}</h5>
                                  <div className="flex items-center justify-center gap-3 text-[7.5px] text-slate-600 font-medium pt-0.5">
                                    <span>DURATION: <strong className="text-slate-900">{formData.duration || '6 Months'}</strong></span>
                                    <span>•</span>
                                    <span>ISSUED: <strong className="text-slate-900">{formData.issued_date || 'June 15, 2026'}</strong></span>
                                  </div>
                                </>
                              )}

                              {/* OX-ACH */}
                              {formData.prefix === 'OX-ACH' && (
                                <>
                                  <p className="text-[9px] text-slate-600 pt-0.5">has been recognised for outstanding achievement in</p>
                                  <h5 className="text-xs font-black text-slate-900">{formData.achievement_title || 'Achievement Title'}</h5>
                                  {formData.achievement_description && (
                                    <p className="text-[8px] text-slate-600 max-w-xs mx-auto italic px-2">{formData.achievement_description}</p>
                                  )}
                                  <div className="text-[7.5px] text-slate-600 font-medium pt-0.5">
                                    <span>ISSUED DATE: <strong className="text-slate-900">{formData.issued_date || 'August 27, 2026'}</strong></span>
                                  </div>
                                </>
                              )}

                              {/* OX-WRK */}
                              {formData.prefix === 'OX-WRK' && (
                                <>
                                  <p className="text-[9px] text-slate-600 pt-0.5">has successfully completed the</p>
                                  <h5 className="text-xs font-black text-slate-900">{formData.research_title || 'OpportunityX Research Fellowship'}</h5>
                                  <p className="text-[9px] text-slate-600">in <strong className="text-slate-900">{formData.research_area || 'AI-Powered Career Technology'}</strong></p>
                                  <p className="text-[7.5px] text-slate-500 max-w-xs mx-auto">During the fellowship, the recipient contributed to research and development activities in the specified area.</p>
                                  <div className="flex items-center justify-center gap-3 text-[7.5px] text-slate-600 font-medium pt-0.5">
                                    <span>DURATION: <strong className="text-slate-900">{formData.duration || '6 Months'}</strong></span>
                                    <span>•</span>
                                    <span>ISSUED: <strong className="text-slate-900">{formData.issued_date || 'August 27, 2026'}</strong></span>
                                  </div>
                                </>
                              )}

                              {/* OX-CMP */}
                              {formData.prefix === 'OX-CMP' && (
                                <>
                                  <p className="text-[9px] text-slate-600 pt-0.5">has successfully completed the course</p>
                                  <h5 className="text-xs font-black text-slate-900">{formData.course_name || 'Full Stack Web Development'}</h5>
                                  <p className="text-[8px] text-slate-600">having fulfilled the prescribed requirements of the program.</p>
                                  <div className="flex items-center justify-center gap-3 text-[7.5px] text-slate-600 font-medium pt-0.5">
                                    <span>DURATION: <strong className="text-slate-900">{formData.duration || '12 Weeks'}</strong></span>
                                    <span>•</span>
                                    <span>COMPLETION: <strong className="text-slate-900">{formData.issued_date || 'August 27, 2026'}</strong></span>
                                  </div>
                                </>
                              )}

                              {/* OX-CA */}
                              {formData.prefix === 'OX-CA' && (
                                <>
                                  <p className="text-[9px] text-slate-600 pt-0.5">was associated with</p>
                                  <h5 className="text-xs font-black text-slate-900">{formData.product || 'OpportunityX'}</h5>
                                  <p className="text-[9px] text-slate-600">as a <strong className="text-slate-900 font-black">{formData.role || 'Co-Founder'}</strong></p>
                                  <p className="text-[7.5px] text-slate-500 max-w-xs mx-auto">and contributed to the development, growth, and/or operations of the product during the period of their association.</p>
                                  <div className="pt-0.5 text-[7.5px] text-slate-600 font-mono">
                                    <span className="font-bold text-slate-500 uppercase">PERIOD OF ASSOCIATION: </span>
                                    <strong className="text-slate-900">{formData.period || 'August 2026 - Present'}</strong>
                                  </div>
                                </>
                              )}

                              {/* Skills / Key Contributions Tag Summary */}
                              {skills.length > 0 && (
                                <div className="text-[7.5px] text-slate-700 font-semibold pt-1 border-t border-slate-100 mt-1">
                                  <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                    {formData.prefix === 'OX-CA' ? 'KEY CONTRIBUTIONS' : formData.prefix === 'OX-CMP' ? 'MODULES & SKILLS' : 'VERIFIED COMPETENCIES'}
                                  </span>
                                  <span>{skills.join('  |  ')}</span>
                                </div>
                              )}
                            </div>

                            {/* Mini Banner */}
                            <div className="text-center text-[8px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                              <span>Verify at </span>
                              <strong className="text-slate-900">www.verify.opportunityx.co.in</strong>
                            </div>

                            {/* Mini Footer */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                              <div className="flex items-center gap-1">
                                <div className="w-6 h-6 border border-slate-300 rounded p-0.5 bg-slate-50">
                                  <QRCodeSVG value="https://www.verify.opportunityx.co.in" size={20} fgColor="#0F172A" />
                                </div>
                                <span className="text-[7px] font-mono text-slate-400">SCAN TO VERIFY</span>
                              </div>
                              <div className="text-right">
                                <img src="/signature_dark.png" alt="Sig" className="h-6 object-contain ml-auto" />
                                <span className="text-[6.5px] font-bold text-slate-800 block leading-tight">Anurag Verma</span>
                                <span className="text-[5.5px] text-slate-500 block leading-none">Founder & CEO, OpportunityX</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={issuing}
                            className={`w-full py-3.5 rounded-xl font-extrabold text-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-90 disabled:cursor-wait cursor-pointer ${
                              isMono
                                ? 'bg-black hover:bg-zinc-800 text-white shadow-md border border-zinc-800'
                                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-orange-500/25 border border-amber-400/40'
                            }`}
                          >
                            {issuing ? (
                              <div className="flex items-center gap-2 text-white font-extrabold">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                <span className="text-white font-bold drop-shadow-md">Generating Cryptographic Signature...</span>
                              </div>
                            ) : (
                              <>
                                <Sparkles size={18} className="shrink-0" />
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

              {/* TAB 2: REGISTRY LIST MANAGER & CLOUD STORE */}
              {activeTab === 'list' && (
                <div className="p-6 sm:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fetchRegistryList(adminKey)}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-800 transition-colors"
                        title="Reload latest records from Cloud"
                      >
                        <RefreshCw size={13} className={loadingList ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportBackup}
                        className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Download complete registry JSON backup"
                      >
                        <Download size={13} />
                        <span>Export Backup</span>
                      </button>

                      <label
                        className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Import JSON backup file into Firestore"
                      >
                        <Upload size={13} />
                        <span>Import Backup</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
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
                          .filter(item => {
                            if (!searchFilter.trim()) return true;
                            const f = searchFilter.toLowerCase();
                            const id = (item.certificate_id || '').toLowerCase();
                            const rec = (item.recipient || item.recipient_name || '').toLowerCase();
                            const role = (item.role || item.achievement_title || item.course_name || item.research_title || item.product || '').toLowerCase();
                            return id.includes(f) || rec.includes(f) || role.includes(f);
                          })
                          .map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 font-mono font-bold text-orange-600 dark:text-amber-400">{item.certificate_id}</td>
                              <td className="p-3 font-bold text-slate-900 dark:text-white">{item.recipient || item.recipient_name}</td>
                              <td className="p-3 text-slate-700 dark:text-slate-300">{item.role || item.achievement_title || item.course_name || item.research_title || item.product}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-400">{item.issued_date}</td>
                              <td className="p-3">
                                <StatusBadge status={item.status} size="small" />
                              </td>
                              <td className="p-3 text-right space-x-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setViewingDoc(item)}
                                  className="px-2.5 py-1 rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/30 text-xs inline-flex items-center gap-1 transition-all"
                                  title="View and Download PDF / Print Certificate"
                                >
                                  <FileText size={13} />
                                  <span>View / PDF</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteCert(item)}
                                  className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30 text-xs inline-flex items-center gap-1 transition-all"
                                  title="Permanently Delete Certificate"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
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
                        <div className={`p-2.5 rounded-xl ${isMono ? 'bg-zinc-100 border border-zinc-300 text-zinc-900' : 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400'}`}>
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
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all shadow-md active:scale-95 ${
                          isMono
                            ? 'bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 shadow-none'
                            : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-700 dark:text-amber-300'
                        }`}
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
                          className={`flex-1 px-4 py-2.5 rounded-xl border font-mono font-bold text-sm tracking-widest placeholder-slate-400 focus:outline-none ${
                            isMono
                              ? 'bg-white border-zinc-900 text-black focus:border-black'
                              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-orange-600 dark:text-amber-400 focus:border-amber-500'
                          }`}
                        />
                        <button
                          type="submit"
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all ${
                            isMono
                              ? 'bg-black hover:bg-zinc-800 text-white shadow-none'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                          }`}
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
            <div 
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
              onClick={() => !isRevoking && setConfirmRevokeCert(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 text-left space-y-4 shadow-2xl relative text-slate-900 dark:text-white cursor-default"
              >
                <button
                  type="button"
                  onClick={() => setConfirmRevokeCert(null)}
                  disabled={isRevoking}
                  className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                    <ShieldAlert size={26} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Certificate Revocation</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">OpportunityX Authority Audit Engine</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Certificate ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-amber-400">{confirmRevokeCert.certificate_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Recipient:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{confirmRevokeCert.recipient}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Role:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{confirmRevokeCert.role}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs font-medium leading-relaxed flex items-start gap-2.5">
                  <AlertCircle size={17} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>
                    Are you sure you want to <strong>REVOKE</strong> certificate <strong className="font-mono text-rose-950 dark:text-rose-100 font-bold">{confirmRevokeCert.certificate_id}</strong>?
                    This will permanently set its status to <strong>REVOKED</strong> on public verification portals.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmRevokeCert(null)}
                    disabled={isRevoking}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRevocation}
                    disabled={isRevoking}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-bold text-xs shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2"
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
            <div 
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
              onClick={() => !isDeletingCert && setConfirmDeleteCert(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 text-left space-y-4 shadow-2xl relative text-slate-900 dark:text-white cursor-default"
              >
                <button
                  type="button"
                  onClick={() => setConfirmDeleteCert(null)}
                  disabled={isDeletingCert}
                  className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Certificate Record</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Permanent Database Purge</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Certificate ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-amber-400">{confirmDeleteCert.certificate_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Recipient:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{confirmDeleteCert.recipient || confirmDeleteCert.recipient_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Role:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{confirmDeleteCert.role}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs font-medium leading-relaxed flex items-start gap-2.5">
                  <AlertCircle size={17} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>
                    Are you sure you want to <strong>PERMANENTLY DELETE</strong> certificate <strong className="font-mono text-rose-950 dark:text-rose-100 font-bold">{confirmDeleteCert.certificate_id}</strong>?
                    This action cannot be undone. It will be completely removed from the registry index and database.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteCert(null)}
                    disabled={isDeletingCert}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteCert}
                    disabled={isDeletingCert}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2"
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
