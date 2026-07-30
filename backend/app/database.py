import os
import logging
from typing import Optional, List
from app.models.certificate import CertificateRecord, CertificateStatus
from app.seed_data import SEED_CERTIFICATES

logger = logging.getLogger("opportunityx.db")

class CertificateDatabase:
    def __init__(self):
        self.firestore_db = None
        self._init_firebase()

    def _init_firebase(self):
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if cred_path and os.path.exists(cred_path):
            try:
                import firebase_admin
                from firebase_admin import credentials, firestore
                if not firebase_admin._apps:
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                self.firestore_db = firestore.client()
                logger.info("Firebase Firestore initialized successfully.")
            except Exception as e:
                logger.warning(f"Firebase initialization failed, running in seeded local mode: {e}")
        else:
            logger.info("No Firebase credentials provided. Operating in high-integrity local registry mode.")

    def get_certificate(self, certificate_id: str) -> Optional[CertificateRecord]:
        clean_id = certificate_id.strip().upper()

        # Try Firestore first if initialized
        if self.firestore_db:
            try:
                doc_ref = self.firestore_db.collection("certificates").document(clean_id)
                doc = doc_ref.get()
                if doc.exists:
                    data = doc.to_dict()
                    return CertificateRecord(**data)
            except Exception as e:
                logger.warning(f"Firestore query error for {clean_id}: {e}")

        # Fallback / local lookup
        return SEED_CERTIFICATES.get(clean_id)

    def add_certificate(self, record: CertificateRecord):
        clean_id = record.certificate_id.strip().upper()
        SEED_CERTIFICATES[clean_id] = record

        if self.firestore_db:
            try:
                doc_ref = self.firestore_db.collection("certificates").document(clean_id)
                doc_ref.set(record.dict())
                logger.info(f"Certificate {clean_id} successfully saved to Firestore.")
            except Exception as e:
                logger.error(f"Error saving certificate {clean_id} to Firestore: {e}")

    def list_all_certificates(self) -> List[CertificateRecord]:
        if self.firestore_db:
            try:
                docs = self.firestore_db.collection("certificates").stream()
                records = [CertificateRecord(**doc.to_dict()) for doc in docs]
                if records:
                    return records
            except Exception as e:
                logger.warning(f"Error listing from Firestore: {e}")

        return list(SEED_CERTIFICATES.values())

    def revoke_certificate(self, certificate_id: str) -> bool:
        clean_id = certificate_id.strip().upper()
        if clean_id in SEED_CERTIFICATES:
            SEED_CERTIFICATES[clean_id].status = CertificateStatus.REVOKED

        if self.firestore_db:
            try:
                doc_ref = self.firestore_db.collection("certificates").document(clean_id)
                doc_ref.update({"status": CertificateStatus.REVOKED.value})
                return True
            except Exception as e:
                logger.error(f"Error revoking in Firestore: {e}")
                return False

        return clean_id in SEED_CERTIFICATES

db = CertificateDatabase()
