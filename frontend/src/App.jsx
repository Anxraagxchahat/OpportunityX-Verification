import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchSection } from './components/SearchSection';
import { SkeletonLoader } from './components/SkeletonLoader';
import { CertificateCard } from './components/CertificateCard';
import { InvalidCard } from './components/InvalidCard';
import { AdminPortal } from './components/AdminPortal';
import { useVerifyCertificate } from './hooks/useVerifyCertificate';
import { motion, AnimatePresence } from 'framer-motion';

function VerificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { loading, result, error, searchedId, verify, reset } = useVerifyCertificate();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const queryId = searchParams.get('id');
  const isAdminParam = searchParams.get('admin');

  // Open Admin portal if ?admin=true
  useEffect(() => {
    if (isAdminParam === 'true') {
      setIsAdminOpen(true);
    }
  }, [isAdminParam]);

  // Trigger search on mount or when ?id= changes
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
    <div className="min-h-screen flex flex-col justify-between bg-[#05070D] text-slate-100 relative selection:bg-orange-500/30 selection:text-white">
      {/* Subtle Background Grid Line Overlay */}
      <div className="grid-bg" />

      <div>
        <Navbar onOpenAdmin={() => setIsAdminOpen(true)} />

        <main className="container mx-auto px-4 lg:px-8 py-4 sm:py-6 space-y-6">
          {/* Hero & Enterprise Search Focus */}
          <SearchSection
            onSearch={handleSearch}
            loading={loading}
            initialValue={queryId || ''}
          />

          {/* Verification Results Container - Directly Below Search Box */}
          <section className="w-full pb-10">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  key="loading" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
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
                  className="w-full"
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
        </main>
      </div>

      <Footer />

      {/* Admin Issuance & Security Portal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}

export default function App() {
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
