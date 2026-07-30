import os
import json
import time
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
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS passkeys (
                        credential_id TEXT PRIMARY KEY,
                        device_name TEXT,
                        public_key TEXT,
                        registered_at TEXT
                    )
                """)
                conn.commit()
            logger.info(f"SQLite persistent database ready at: {DB_PATH}")
        except Exception as e:
            logger.error(f"Failed to initialize SQLite database: {e}")

    def add_passkey(self, credential_id: str, device_name: str = "Registered Device", public_key: str = None) -> dict:
        clean_id = credential_id.strip()
        registered_at = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO passkeys (credential_id, device_name, public_key, registered_at)
                    VALUES (?, ?, ?, ?)
                """, (clean_id, device_name, public_key or "", registered_at))
                conn.commit()
            logger.info(f"Passkey {clean_id[:12]}... saved to SQLite database.")
        except Exception as e:
            logger.error(f"Error saving passkey to SQLite: {e}")

        return {
            "credential_id": clean_id,
            "device_name": device_name,
            "public_key": public_key,
            "registered_at": registered_at
        }

    def is_passkey_valid(self, credential_id: str) -> bool:
        clean_id = credential_id.strip()
        if not clean_id:
            return False
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT credential_id FROM passkeys WHERE credential_id = ?", (clean_id,))
                row = cursor.fetchone()
                return row is not None
        except Exception as e:
            logger.error(f"Error validating passkey in SQLite: {e}")
            return False

    def list_passkeys(self) -> List[dict]:
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT credential_id, device_name, registered_at FROM passkeys")
                rows = cursor.fetchall()
                return [
                    {"credential_id": r[0], "device_name": r[1], "registered_at": r[2]}
                    for r in rows
                ]
        except Exception as e:
            logger.error(f"Error listing passkeys from SQLite: {e}")
            return []

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
        
        record = self.get_certificate(clean_id)
        if not record:
            return False

        record.status = CertificateStatus.REVOKED
        record.revocation_reason = "Certificate revoked by administrative authority."
        SEED_CERTIFICATES[clean_id] = record

        # Update in SQLite with updated data_json blob
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
            logger.info(f"Certificate {clean_id} status updated to REVOKED in SQLite database.")
        except Exception as e:
            logger.error(f"Error revoking in SQLite: {e}")

        # Update in Firestore if available
        if self.firestore_db:
            try:
                doc_ref = self.firestore_db.collection("certificates").document(clean_id)
                doc_ref.set(record.dict())
            except Exception as e:
                logger.error(f"Error revoking in Firestore: {e}")

        return True

db = CertificateDatabase()

