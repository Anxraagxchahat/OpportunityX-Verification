import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MaintenancePage } from './pages/MaintenancePage';
import { MAINTENANCE_MODE } from './config/maintenance';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchSection } from './components/SearchSection';
import { SkeletonLoader } from './components/SkeletonLoader';
import { CertificateCard } from './components/CertificateCard';
import { InvalidCard } from './components/InvalidCard';
import { AdminPortal } from './components/AdminPortal';
import { useVerifyCertificate } from './hooks/useVerifyCertificate';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu, Key, FileCheck, CheckCircle2, Lock } from 'lucide-react';

const VERIFICATION_PILLARS = [
  {
    icon: Cpu,
    title: 'Real-Time Node Lookup',
    description: 'Instant verification directly against the official OpportunityX credential database with sub-second latency.',
  },
  {
    icon: Key,
    title: 'Cryptographic Validation',
    description: 'Every certificate is anchored by an ECDSA 256-bit digital signature and tamper-evident SHA-256 hash.',
  },
  {
    icon: ShieldCheck,
    title: 'Direct Issuing Authority',
    description: 'Verifies recipient identity, issuing date, roles, and verified competencies directly from OpportunityX.',
  },
];

const CREDENTIAL_FORMATS = [
  { prefix: 'OX-INT', label: 'Internship Program' },
  { prefix: 'OX-CA', label: 'Campus Associate' },
  { prefix: 'OX-ACH', label: 'Achievement / Award' },
  { prefix: 'OX-WRK', label: 'Research & Fellowship' },
];

function VerificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { loading, result, error, searchedId, verify, reset } = useVerifyCertificate();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Extract ID either from ?id= query param or from pathname (e.g. /verify/OX-INT-2026-000145)
  let queryId = searchParams.get('id');
  if (!queryId && location.pathname && location.pathname !== '/') {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length === 2 && pathParts[0].toLowerCase() === 'verify') {
      queryId = pathParts[1];
    } else if (pathParts.length === 1 && pathParts[0].toLowerCase() !== 'verify') {
      queryId = pathParts[0];
    }
  }

  const isAdminParam = searchParams.get('admin');

  // Open Admin portal if ?admin=true
  useEffect(() => {
    if (isAdminParam === 'true') {
      setIsAdminOpen(true);
    }
  }, [isAdminParam]);

  // Trigger search on mount or when ID changes
  useEffect(() => {
    if (queryId && queryId.trim() && queryId !== searchedId) {
      verify(queryId);
    }
  }, [queryId, verify, searchedId]);

  const handleSearch = (id) => {
    setSearchParams({ id });
    verify(id);
  };

  const handleReset = () => {
    setSearchParams({});
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas text-text-primary relative selection:bg-orange-500/30 selection:text-white transition-colors duration-200">
      <div className="relative z-10">
        <Navbar />

        <main className="container mx-auto px-4 lg:px-8 py-4 sm:py-6 space-y-6">
          {/* Hero & Enterprise Search Focus */}
          <SearchSection
            onSearch={handleSearch}
            loading={loading}
            initialValue={queryId || ''}
          />

          {/* Verification Results Container */}
          <section className="w-full">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  key="loading" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full py-4"
                >
                  <SkeletonLoader />
                </motion.div>
              )}

              {!loading && result && (
                <motion.div 
                  key="result" 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="w-full py-4"
                >
                  {result.found && (result.status === 'Valid' || result.status === 'VALID') ? (
                    <CertificateCard result={result} />
                  ) : (
                    <InvalidCard result={result} onReset={handleReset} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Institutional Architecture & Security Standards (Composition Rhythm) */}
          {!result && !loading && (
            <motion.section 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="max-w-4xl mx-auto pt-6 pb-4 space-y-8"
            >
              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px bg-border-subtle flex-1" />
                <span className="text-[11px] font-mono font-semibold tracking-wider text-text-muted uppercase">
                  Registry Security Architecture
                </span>
                <div className="h-px bg-border-subtle flex-1" />
              </div>

              {/* 3 Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {VERIFICATION_PILLARS.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  return (
                    <div 
                      key={idx}
                      className="p-5 rounded-xl bg-surface border border-border-subtle hover:border-border-strong transition-all duration-150 space-y-2.5 shadow-subtle group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center text-accent-brand">
                        <Icon size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-text-primary font-sans">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-sans">
                        {pillar.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Supported Credential Standards Strip */}
              <div className="p-4 rounded-xl bg-surface border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <FileCheck size={13} className="text-accent-brand" /> Supported Identifiers:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px]">
                  {CREDENTIAL_FORMATS.map((item, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-md bg-surface-elevated border border-border-subtle text-text-secondary font-medium"
                    >
                      <span className="text-accent-brand font-bold">{item.prefix}</span>
                      <span className="text-text-muted"> ({item.label})</span>
                    </span>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

        </main>
      </div>

      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Admin Issuance & Security Portal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}

export default function App() {
  if (MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<VerificationPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
