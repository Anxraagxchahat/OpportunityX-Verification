import os
import json
import sqlite3
import logging
from typing import Optional, List
from app.models.certificate import CertificateRecord, CertificateStatus
from app.seed_data import SEED_CERTIFICATES

logger = logging.getLogger("opportunityx.db")

# Path for persistent SQLite database
DB_PATH = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "certificates_registry.db"))

class CertificateDatabase:
    def __init__(self):
        self.firestore_db = None
        self._init_sqlite()
        self._init_firebase()
        self._load_sqlite_records()

    def _init_sqlite(self):
        """Initialize zero-config persistent SQLite database."""
        try:
            db_dir = os.path.dirname(os.path.abspath(DB_PATH))
            if not os.path.exists(db_dir):
                os.makedirs(db_dir, exist_ok=True)

            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS certificates (
                        certificate_id TEXT PRIMARY KEY,
                        status TEXT,
                        recipient TEXT,
                        type_label TEXT,
                        role TEXT,
                        duration TEXT,
                        issued_date TEXT,
                        issued_by TEXT,
                        digital_signature TEXT,
                        verification_timestamp TEXT,
                        data_json TEXT
                    )
                """)
                conn.commit()
            logger.info(f"SQLite persistent database ready at: {DB_PATH}")
        except Exception as e:
            logger.error(f"Failed to initialize SQLite database: {e}")

    def _load_sqlite_records(self):
        """Load persistent records into memory index on startup."""
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT data_json FROM certificates")
                rows = cursor.fetchall()
                for row in rows:
                    if row[0]:
                        data = json.loads(row[0])
                        record = CertificateRecord(**data)
                        SEED_CERTIFICATES[record.certificate_id.strip().upper()] = record
            logger.info(f"Loaded {len(rows)} persistent certificates from SQLite.")
        except Exception as e:
            logger.error(f"Error loading records from SQLite: {e}")

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

        # Check memory / seed cache first
        if clean_id in SEED_CERTIFICATES:
            return SEED_CERTIFICATES[clean_id]

        # Check SQLite DB
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT data_json FROM certificates WHERE certificate_id = ?", (clean_id,))
                row = cursor.fetchone()
                if row and row[0]:
                    data = json.loads(row[0])
                    record = CertificateRecord(**data)
                    SEED_CERTIFICATES[clean_id] = record
                    return record
        except Exception as e:
            logger.warning(f"SQLite query error for {clean_id}: {e}")

        # Try Firestore if initialized
        if self.firestore_db:
            try:
                doc_ref = self.firestore_db.collection("certificates").document(clean_id)
                doc = doc_ref.get()
                if doc.exists:
                    data = doc.to_dict()
                    record = CertificateRecord(**data)
                    SEED_CERTIFICATES[clean_id] = record
                    return record
            except Exception as e:
                logger.warning(f"Firestore query error for {clean_id}: {e}")

        return None

    def add_certificate(self, record: CertificateRecord):
        clean_id = record.certificate_id.strip().upper()
        SEED_CERTIFICATES[clean_id] = record

        # Save to SQLite DB
        try:
            record_dict = record.dict()
            data_json = json.dumps(record_dict)
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO certificates (
                        certificate_id, status, recipient, type_label, role,
                        duration, issued_date, issued_by, digital_signature,
                        verification_timestamp, data_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    clean_id,
                    record.status.value,
                    record.recipient_name,
                    record.certificate_type.value,
                    record.role,
                    record.duration,
                    record.issued_date,
                    "OpportunityX",
                    record.digital_signature,
                    record.created_at,
                    data_json
                ))
                conn.commit()
            logger.info(f"Certificate {clean_id} permanently saved to SQLite database.")
        except Exception as e:
            logger.error(f"Error saving certificate {clean_id} to SQLite: {e}")

        # Save to Firestore if initialized
        if self.firestore_db:
            try:
                doc_ref = self.firestore_db.collection("certificates").document(clean_id)
                doc_ref.set(record.dict())
                logger.info(f"Certificate {clean_id} successfully saved to Firestore.")
            except Exception as e:
                logger.error(f"Error saving certificate {clean_id} to Firestore: {e}")

    def list_all_certificates(self) -> List[CertificateRecord]:
        # Merge SQLite records into memory
        self._load_sqlite_records()

        # Try Firestore if available
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
        
        # Update in memory
        if clean_id in SEED_CERTIFICATES:
            SEED_CERTIFICATES[clean_id].status = CertificateStatus.REVOKED

        # Update in SQLite
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("UPDATE certificates SET status = ? WHERE certificate_id = ?", (CertificateStatus.REVOKED.value, clean_id))
                conn.commit()
        except Exception as e:
            logger.error(f"Error revoking in SQLite: {e}")

        # Update in Firestore if available
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

