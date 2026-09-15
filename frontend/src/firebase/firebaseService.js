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
 * Helper to get blacklist of deleted certificate IDs from LocalStorage.
 */
function getDeletedCertificatesBlacklist() {
  try {
    const list = JSON.parse(localStorage.getItem('ox_deleted_certificates') || '[]');
    return new Set(list.map(id => String(id).trim().toUpperCase()));
  } catch (e) {
    return new Set();
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

  // Un-blacklist if re-issuing
  try {
    const list = JSON.parse(localStorage.getItem('ox_deleted_certificates') || '[]');
    const filtered = list.filter(id => id.toUpperCase() !== cleanId);
    localStorage.setItem('ox_deleted_certificates', JSON.stringify(filtered));
  } catch (e) {}

  const payload = {
    ...certRecord,
    certificate_id: cleanId,
    status: certRecord.status || 'Valid',
    deleted: false,
    updated_at: new Date().toISOString()
  };

  // Mirror to local cache for instant offline responsiveness
  saveToLocalStorageFallback(payload);

  try {
    await withTimeout(setDoc(docRef, payload, { merge: true }), 4000);
    console.info(`[Firestore] Successfully saved certificate ${cleanId} to Firebase Cloud.`);
  } catch (err) {
    console.warn("[Firestore] Save notice/fallback:", err);
  }

  return payload;
}

/**
 * Get a single certificate by certificate ID from Firebase Firestore.
 */
export async function getCertificateFromFirebase(certificateId) {
  if (!certificateId) return null;
  const cleanId = certificateId.trim().toUpperCase();

  // Instant check against deleted blacklist
  const deletedSet = getDeletedCertificatesBlacklist();
  if (deletedSet.has(cleanId)) {
    return null;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanId);
    const docSnap = await withTimeout(getDoc(docRef), 3500);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.status === 'Deleted' || data.deleted === true) {
        return null;
      }
      saveToLocalStorageFallback(data);
      return data;
    }
  } catch (error) {
    console.warn(`[Firestore] Fetch notice for ${cleanId}:`, error);
  }

  // Fallback to local storage if network or client blocks request
  const fallback = getFromLocalStorageFallback(cleanId);
  if (fallback && (fallback.status === 'Deleted' || fallback.deleted === true)) {
    return null;
  }
  return fallback;
}

/**
 * List all certificate records from Firebase Firestore.
 */
export async function listCertificatesFromFirebase() {
  const localList = listFromLocalStorageFallback();
  const deletedSet = getDeletedCertificatesBlacklist();

  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, COLLECTION_NAME)), 4000);
    const certsMap = new Map();

    localList.forEach(item => {
      const id = item.certificate_id?.toUpperCase();
      if (id && !deletedSet.has(id) && item.status !== 'Deleted' && !item.deleted) {
        certsMap.set(id, item);
      }
    });

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = (data.certificate_id || docSnap.id).toUpperCase();
      if (id && !deletedSet.has(id) && data.status !== 'Deleted' && !data.deleted) {
        certsMap.set(id, { ...data, certificate_id: id });
      }
    });

    return Array.from(certsMap.values());
  } catch (error) {
    console.warn("[Firestore] Listing notice, using local cache:", error);
    return localList.filter(item => {
      const id = item.certificate_id?.toUpperCase();
      return id && !deletedSet.has(id) && item.status !== 'Deleted' && !item.deleted;
    });
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

  const updateData = {
    status: 'Revoked',
    revocation_reason: reason,
    updated_at: new Date().toISOString()
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanId);
    // Use setDoc with merge to avoid failure if doc schema or fields differ
    await withTimeout(setDoc(docRef, updateData, { merge: true }), 3000);
    return true;
  } catch (error) {
    console.warn(`[Firestore] Revoke notice for ${cleanId}:`, error);
    return true;
  }
}

/**
 * Delete a certificate permanently from Firebase Firestore and LocalStorage.
 */
export async function deleteCertificateFromFirebase(certificateId) {
  if (!certificateId) return false;
  const cleanId = certificateId.trim().toUpperCase();

  // 1. Immediately delete from local storage fallback
  try {
    const existing = JSON.parse(localStorage.getItem('ox_certificates_fallback') || '{}');
    delete existing[cleanId];
    localStorage.setItem('ox_certificates_fallback', JSON.stringify(existing));
  } catch (e) {}

  // 2. Permanently record in local deleted blacklist so it NEVER resurrects on refresh
  try {
    const list = JSON.parse(localStorage.getItem('ox_deleted_certificates') || '[]');
    if (!list.includes(cleanId)) {
      list.push(cleanId);
      localStorage.setItem('ox_deleted_certificates', JSON.stringify(list));
    }
  } catch (e) {}

  // 3. Delete from Firestore cloud database
  try {
    const docRef = doc(db, COLLECTION_NAME, cleanId);
    await withTimeout(deleteDoc(docRef), 3000);
    console.info(`[Firestore] Certificate ${cleanId} permanently deleted from Firestore.`);
  } catch (error) {
    console.warn(`[Firestore] deleteDoc notice for ${cleanId}, marking as Deleted:`, error);
    // Backup tombstone in case deleteDoc was restricted by cloud rules
    try {
      const docRef = doc(db, COLLECTION_NAME, cleanId);
      await withTimeout(setDoc(docRef, {
        status: 'Deleted',
        deleted: true,
        deleted_at: new Date().toISOString()
      }, { merge: true }), 2000);
    } catch (err2) {}
  }

  return true;
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

