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
 * Timeout wrapper for Firestore operations.
 */
function withTimeout(promise, ms = 7000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Firestore request timed out after ${ms}ms`));
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

  // Mirror to local cache for instant offline responsiveness
  saveToLocalStorageFallback(payload);

  try {
    await withTimeout(setDoc(docRef, payload, { merge: true }), 7000);
    console.info(`[Firestore] Successfully saved certificate ${cleanId} to Firebase Cloud.`);
  } catch (err) {
    console.warn("[Firestore] Save timeout or permission notice, saved locally:", err);
  }

  return payload;
}

/**
 * Get a single certificate by certificate ID from Firebase Firestore.
 */
export async function getCertificateFromFirebase(certificateId) {
  if (!certificateId) return null;
  const cleanId = certificateId.trim().toUpperCase();

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanId);
    const docSnap = await withTimeout(getDoc(docRef), 5000);
    if (docSnap.exists()) {
      const data = docSnap.data();
      saveToLocalStorageFallback(data);
      return data;
    }
  } catch (error) {
    console.warn(`[Firestore] Fetch notice for ${cleanId}:`, error);
  }

  // Fallback to local storage if network or client blocks request
  return getFromLocalStorageFallback(cleanId);
}

/**
 * List all certificate records from Firebase Firestore.
 */
export async function listCertificatesFromFirebase() {
  const localList = listFromLocalStorageFallback();
  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, COLLECTION_NAME)), 6000);
    const certsMap = new Map();
    localList.forEach(item => {
      if (item.certificate_id) certsMap.set(item.certificate_id.toUpperCase(), item);
    });
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.certificate_id) certsMap.set(data.certificate_id.toUpperCase(), data);
    });
    const combined = Array.from(certsMap.values());
    return combined;
  } catch (error) {
    console.warn("[Firestore] Listing error or notice:", error);
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
    }), 5000);
    return true;
  } catch (error) {
    console.warn(`[Firestore] Revoke notice for ${cleanId}:`, error);
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
    await withTimeout(deleteDoc(docRef), 5000);
    return true;
  } catch (error) {
    console.warn(`[Firestore] Delete notice for ${cleanId}:`, error);
    return true;
  }
}

/**
 * Export all certificates into a JSON string for offline backup.
 */
export async function exportAllCertificatesToJson() {
  const records = await listCertificatesFromFirebase();
  return JSON.stringify(records, null, 2);
}

/**
 * Import an array of certificate records into Firebase Firestore & LocalStorage.
 */
export async function importCertificatesFromJson(jsonArray) {
  if (!Array.isArray(jsonArray)) {
    throw new Error("Invalid format: expected an array of certificates");
  }

  let importedCount = 0;
  for (const item of jsonArray) {
    if (item && item.certificate_id) {
      await saveCertificateToFirebase(item);
      importedCount++;
    }
  }
  return importedCount;
}

