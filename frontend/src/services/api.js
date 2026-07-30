const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://opportunityx-verification.onrender.com' : 'http://localhost:8000');
const API_BASE_URL = `${API_BASE.replace(/\/$/, '')}/api`;

export async function fetchCertificateVerification(certificateId) {
  const cleanId = encodeURIComponent(certificateId.trim().toUpperCase());
  
  try {
    const response = await fetch(`${API_BASE_URL}/verify/${cleanId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 404) {
      return {
        found: false,
        status: 'Invalid',
        certificate_id: certificateId,
        trust_statement: 'Certificate identification failed. The requested certificate does not exist in the OpportunityX registry.',
        reason: 'Invalid Certificate ID or record does not exist.',
        verification_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server returned error status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Verification error:', error);
    return {
      found: false,
      status: 'Invalid',
      certificate_id: certificateId,
      trust_statement: 'Unable to connect to verification server. Please check your network connection.',
      reason: error.message || 'Verification service temporarily unreachable.',
      verification_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    };
  }
}
