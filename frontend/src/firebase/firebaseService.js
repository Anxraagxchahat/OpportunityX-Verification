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
 * Save or overwrite a certificate record in Firebase Firestore.
 */
export async function saveCertificateToFirebase(certRecord) {
  if (!certRecord || !certRecord.certificate_id) {
    throw new Error("Invalid certificate record: missing certificate_id");
  }

  const cleanId = certRecord.certificate_id.trim().upperCase ? certRecord.certificate_id.trim().toUpperCase() : certRecord.certificate_id.trim();
  const docRef = doc(db, COLLECTION_NAME, cleanId);

  const payload = {
    ...certRecord,
    certificate_id: cleanId,
    status: certRecord.status || 'Valid',
    updated_at: new Date().toISOString()
  };

  await setDoc(docRef, payload, { merge: true });
  return payload;
}

/**
 * Get a single certificate by certificate ID from Firebase Firestore.
 */
export async function getCertificateFromFirebase(certificateId) {
  if (!certificateId) return null;
  const cleanId = certificateId.trim().toUpperCase();
  const docRef = doc(db, COLLECTION_NAME, cleanId);

  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error(`Firebase Firestore fetch error for ${cleanId}:`, error);
  }
  return null;
}

/**
 * List all certificate records from Firebase Firestore.
 */
export async function listCertificatesFromFirebase() {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const certs = [];
    querySnapshot.forEach((docSnap) => {
      certs.push(docSnap.data());
    });
    return certs;
  } catch (error) {
    console.error("Error listing certificates from Firebase Firestore:", error);
    return [];
  }
}

/**
 * Revoke a certificate in Firebase Firestore.
 */
export async function revokeCertificateInFirebase(certificateId, reason = "Certificate revoked by administrative authority.") {
  if (!certificateId) return false;
  const cleanId = certificateId.trim().toUpperCase();
  const docRef = doc(db, COLLECTION_NAME, cleanId);

  try {
    await updateDoc(docRef, {
      status: 'Revoked',
      revocation_reason: reason,
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error(`Firebase Firestore revoke error for ${cleanId}:`, error);
    // If doc didn't exist yet, try creating it with status Revoked
    try {
      await setDoc(docRef, {
        certificate_id: cleanId,
        status: 'Revoked',
        revocation_reason: reason,
        updated_at: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (e) {
      console.error("Secondary revoke error:", e);
      return false;
    }
  }
}

/**
 * Delete a certificate from Firebase Firestore.
 */
export async function deleteCertificateFromFirebase(certificateId) {
  if (!certificateId) return false;
  const cleanId = certificateId.trim().toUpperCase();
  const docRef = doc(db, COLLECTION_NAME, cleanId);

  try {
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Firebase Firestore delete error for ${cleanId}:`, error);
    return false;
  }
}
