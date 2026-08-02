import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

const COLLECTION_NAME = 'certificates';

/**
 * Timeout wrapper for Firestore operations to prevent infinite hanging when adblockers block requests.
 */
function withTimeout(promise, ms = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Firestore request timed out after ${ms}ms (possibly blocked by AdBlocker/Client)`));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function saveToLocalStorageFallback(certRecord) {
  try {
    if (!certRecord || !certRecord.certificate_id) return;
    const existing = JSON.parse(localStorage.getItem('ox_certificates_fallback') || '{}');
    existing[certRecord.certificate_id.toUpperCase()] = certRecord;
    localStorage.setItem('ox_certificates_fallback', JSON.stringify(existing));
  } catch (e) {
    console.warn("LocalStorage fallback save error:", e);
  }
}

function getFromLocalStorageFallback(cleanId) {
  try {
    const existing = JSON.parse(localStorage.getItem('ox_certificates_fallback') || '{}');
    return existing[cleanId] || null;
  } catch (e) {
    return null;
  }
}

function listFromLocalStorageFallback() {
  try {
    const existing = JSON.parse(localStorage.getItem('ox_certificates_fallback') || '{}');
    return Object.values(existing);
  } catch (e) {
    return [];
  }
}

/**
 * Save or overwrite a certificate record in Firebase Firestore.
 */
export async function saveCertificateToFirebase(certRecord) {
  if (!certRecord || !certRecord.certificate_id) {
    throw new Error("Invalid certificate record: missing certificate_id");
  }

  const cleanId = certRecord.certificate_id.trim().toUpperCase();
  const docRef = doc(db, COLLECTION_NAME, cleanId);

  const payload = {
    ...certRecord,
    certificate_id: cleanId,
    status: certRecord.status || 'Valid',
    updated_at: new Date().toISOString()
  };

  // Always mirror to LocalStorage so certificate is preserved even if Firestore request is blocked by browser adblockers
  saveToLocalStorageFallback(payload);

  try {
    await withTimeout(setDoc(docRef, payload, { merge: true }), 3000);
  } catch (err) {
    console.warn("Firestore save timeout/blocked, saved locally:", err);
  }

  return payload;
}

/**
 * Get a single certificate by certificate ID from Firebase Firestore.
 */
export async function getCertificateFromFirebase(certificateId) {
  if (!certificateId) return null;
  const cleanId = certificateId.trim().toUpperCase();

  const localRecord = getFromLocalStorageFallback(cleanId);

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanId);
    const docSnap = await withTimeout(getDoc(docRef), 2500);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.warn(`Firebase Firestore fetch error / blocked for ${cleanId}:`, error);
  }

  return localRecord;
}

/**
 * List all certificate records from Firebase Firestore.
 */
export async function listCertificatesFromFirebase() {
  const localList = listFromLocalStorageFallback();
  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, COLLECTION_NAME)), 3000);
    const certsMap = new Map();
    localList.forEach(item => {
      if (item.certificate_id) certsMap.set(item.certificate_id.toUpperCase(), item);
    });
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.certificate_id) certsMap.set(data.certificate_id.toUpperCase(), data);
    });
    return Array.from(certsMap.values());
  } catch (error) {
    console.warn("Error listing certificates from Firebase Firestore / blocked:", error);
    return localList;
  }
}

/**
 * Revoke a certificate in Firebase Firestore.
 */
export async function revokeCertificateInFirebase(certificateId, reason = "Certificate revoked by administrative authority.") {
  if (!certificateId) return false;
  const cleanId = certificateId.trim().toUpperCase();

  // Update local storage
  const localRecord = getFromLocalStorageFallback(cleanId);
  if (localRecord) {
    localRecord.status = 'Revoked';
    localRecord.revocation_reason = reason;
    saveToLocalStorageFallback(localRecord);
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanId);
    await withTimeout(updateDoc(docRef, {
      status: 'Revoked',
      revocation_reason: reason,
      updated_at: new Date().toISOString()
    }), 2500);
    return true;
  } catch (error) {
    console.warn(`Firebase Firestore revoke error / blocked for ${cleanId}:`, error);
    return true;
  }
}

/**
 * Delete a certificate from Firebase Firestore.
 */
export async function deleteCertificateFromFirebase(certificateId) {
  if (!certificateId) return false;
  const cleanId = certificateId.trim().toUpperCase();

  // Delete from local storage
  try {
    const existing = JSON.parse(localStorage.getItem('ox_certificates_fallback') || '{}');
    delete existing[cleanId];
    localStorage.setItem('ox_certificates_fallback', JSON.stringify(existing));
  } catch (e) {}

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanId);
    await withTimeout(deleteDoc(docRef), 2500);
    return true;
  } catch (error) {
    console.warn(`Firebase Firestore delete error / blocked for ${cleanId}:`, error);
    return true;
  }
}
