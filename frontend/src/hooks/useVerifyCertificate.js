import { useState, useCallback } from 'react';
import { fetchCertificateVerification } from '../services/api';

export function useVerifyCertificate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [searchedId, setSearchedId] = useState('');

  const verify = useCallback(async (certificateId) => {
    if (!certificateId || !certificateId.trim()) return;

    setLoading(true);
    setError(null);
    setSearchedId(certificateId.trim().toUpperCase());

    // Add minimal artificial delay (400ms) for high-end feel & smooth transition
    const startTime = Date.now();

    try {
      const data = await fetchCertificateVerification(certificateId);
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 450 - elapsedTime);

      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, remainingTime);
    } catch (err) {
      setResult(null);
      setError(err.message || 'An unexpected error occurred during verification.');
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setLoading(false);
    setError(null);
    setSearchedId('');
  }, []);

  return {
    loading,
    result,
    error,
    searchedId,
    verify,
    reset,
  };
}
