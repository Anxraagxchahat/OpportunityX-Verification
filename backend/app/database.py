import os
import json
import time
import sqlite3
import logging
from typing import Optional, List
from app.models.certificate import CertificateRecord, CertificateStatus
from app.seed_data import SEED_CERTIFICATES

logger = logging.getLogger("opportunityx.db")

# Path for persistent SQLite database & fail-safe JSON store
DB_PATH = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "certificates_registry.db"))
SECURITY_STORE_PATH = os.getenv("SECURITY_STORE_PATH", os.path.join(os.path.dirname(__file__), "security_store.json"))

class CertificateDatabase:
    def __init__(self):
        self.firestore_db = None
        self._init_sqlite()
        self._init_firebase()
        self._sync_security_store()
        self._load_sqlite_records()

    def _load_security_json(self) -> dict:
        try:
            if os.path.exists(SECURITY_STORE_PATH):
                with open(SECURITY_STORE_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error reading security_store.json: {e}")
        return {"settings": {}, "passkeys": []}

    def _save_security_json(self, store: dict):
        try:
            store_dir = os.path.dirname(os.path.abspath(SECURITY_STORE_PATH))
            if not os.path.exists(store_dir):
                os.makedirs(store_dir, exist_ok=True)
            with open(SECURITY_STORE_PATH, "w", encoding="utf-8") as f:
                json.dump(store, f, indent=2)
            logger.info("Security store JSON successfully saved.")
        except Exception as e:
            logger.error(f"Error saving security_store.json: {e}")

    def _sync_security_store(self):
        """Ensure settings and passkeys are synchronized between SQLite, security_store.json, and memory."""
        try:
            json_store = self._load_security_json()
            json_settings = json_store.get("settings", {})
            json_passkeys = json_store.get("passkeys", [])

            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()

                # Sync JSON settings into SQLite if missing
                for k, v in json_settings.items():
                    cursor.execute("SELECT value FROM settings WHERE key = ?", (k,))
                    if not cursor.fetchone():
                        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, str(v)))

                # Sync JSON passkeys into SQLite if missing
                for pk in json_passkeys:
                    cred_id = pk.get("credential_id")
                    if cred_id:
                        cursor.execute("SELECT credential_id FROM passkeys WHERE credential_id = ?", (cred_id,))
                        if not cursor.fetchone():
                            cursor.execute("""
                                INSERT OR REPLACE INTO passkeys (credential_id, device_name, public_key, registered_at, ip_address)
                                VALUES (?, ?, ?, ?, ?)
                            """, (
                                cred_id,
                                pk.get("device_name", "Registered Device"),
                                pk.get("public_key", ""),
                                pk.get("registered_at", time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())),
                                pk.get("ip_address", "127.0.0.1")
                            ))
                conn.commit()

            # Ensure JSON store has whatever is in SQLite
            db_passkeys = self.list_passkeys()
            db_settings = {}
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT key, value FROM settings")
                for r in cursor.fetchall():
                    db_settings[r[0]] = r[1]

            updated_json_store = {
                "settings": db_settings,
                "passkeys": db_passkeys
            }
            self._save_security_json(updated_json_store)
        except Exception as e:
            logger.error(f"Error synchronizing security stores: {e}")

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
                        registered_at TEXT,
                        ip_address TEXT
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS settings (
                        key TEXT PRIMARY KEY,
                        value TEXT
                    )
                """)
                # Migration check for ip_address column
                try:
                    cursor.execute("ALTER TABLE passkeys ADD COLUMN ip_address TEXT")
                except Exception:
                    pass

                # Pre-seed initial certificates into SQLite database if empty
                cursor.execute("SELECT COUNT(*) FROM certificates")
                count_row = cursor.fetchone()
                if count_row and count_row[0] == 0:
                    for cert_id, record in SEED_CERTIFICATES.items():
                        record_dict = record.dict()
                        data_json = json.dumps(record_dict)
                        cursor.execute("""
                            INSERT OR REPLACE INTO certificates (
                                certificate_id, status, recipient, type_label, role,
                                duration, issued_date, issued_by, digital_signature,
                                verification_timestamp, data_json
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            cert_id,
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
            logger.info(f"SQLite persistent database ready at: {DB_PATH}")
        except Exception as e:
            logger.error(f"Failed to initialize SQLite database: {e}")

    def get_setting(self, key: str, default: str = None) -> Optional[str]:
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
                row = cursor.fetchone()
                if row and row[0] is not None:
                    return row[0]
        except Exception as e:
            logger.error(f"Error reading setting {key} from SQLite: {e}")

        # Fallback to JSON store
        json_store = self._load_security_json()
        json_settings = json_store.get("settings", {})
        if key in json_settings:
            val = json_settings[key]
            # Backport to SQLite
            try:
                with sqlite3.connect(DB_PATH) as conn:
                    conn.cursor().execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, str(val)))
                    conn.commit()
            except Exception:
                pass
            return str(val)

        return default

    def set_setting(self, key: str, value: str):
        val_str = str(value)
        # Update SQLite
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, val_str))
                conn.commit()
            logger.info(f"Setting '{key}' saved to SQLite database.")
        except Exception as e:
            logger.error(f"Error saving setting {key} to SQLite: {e}")

        # Update JSON store
        json_store = self._load_security_json()
        if "settings" not in json_store:
            json_store["settings"] = {}
        json_store["settings"][key] = val_str
        self._save_security_json(json_store)

        # Sync to Firestore if available
        if self.firestore_db:
            try:
                self.firestore_db.collection("settings").document(key).set({"value": val_str})
            except Exception as e:
                logger.warning(f"Error syncing setting '{key}' to Firestore: {e}")

    def add_passkey(self, credential_id: str, device_name: str = "Registered Device", public_key: str = None, ip_address: str = "127.0.0.1") -> dict:
        clean_id = credential_id.strip()
        registered_at = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        passkey_obj = {
            "credential_id": clean_id,
            "device_name": device_name,
            "public_key": public_key or "",
            "registered_at": registered_at,
            "ip_address": ip_address
        }

        # Save to SQLite
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO passkeys (credential_id, device_name, public_key, registered_at, ip_address)
                    VALUES (?, ?, ?, ?, ?)
                """, (clean_id, device_name, public_key or "", registered_at, ip_address))
                conn.commit()
            logger.info(f"Passkey {clean_id[:12]}... saved to SQLite database.")
        except Exception as e:
            logger.error(f"Error saving passkey to SQLite: {e}")

        # Save to JSON store
        json_store = self._load_security_json()
        passkeys_list = json_store.get("passkeys", [])
        # Remove existing if any
        passkeys_list = [p for p in passkeys_list if p.get("credential_id") != clean_id]
        passkeys_list.append(passkey_obj)
        json_store["passkeys"] = passkeys_list
        self._save_security_json(json_store)

        # Sync to Firestore if available
        if self.firestore_db:
            try:
                self.firestore_db.collection("passkeys").document(clean_id).set(passkey_obj)
            except Exception as e:
                logger.warning(f"Error syncing passkey to Firestore: {e}")

        return passkey_obj

    def is_passkey_valid(self, credential_id: str) -> bool:
        clean_id = credential_id.strip()
        if not clean_id:
            return False
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT credential_id FROM passkeys WHERE credential_id = ?", (clean_id,))
                row = cursor.fetchone()
                if row is not None:
                    return True
        except Exception as e:
            logger.error(f"Error validating passkey in SQLite: {e}")

        # Fallback check in JSON store
        json_store = self._load_security_json()
        for p in json_store.get("passkeys", []):
            if p.get("credential_id") == clean_id:
                return True

        return False

    def list_passkeys(self) -> List[dict]:
        passkeys = []
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT credential_id, device_name, registered_at, ip_address FROM passkeys")
                rows = cursor.fetchall()
                passkeys = [
                    {
                        "credential_id": r[0],
                        "device_name": r[1],
                        "registered_at": r[2],
                        "ip_address": r[3] if len(r) > 3 and r[3] else "127.0.0.1"
                    }
                    for r in rows
                ]
        except Exception as e:
            logger.error(f"Error listing passkeys from SQLite: {e}")

        if not passkeys:
            json_store = self._load_security_json()
            passkeys = json_store.get("passkeys", [])

        return passkeys

    def delete_passkey(self, credential_id: str) -> bool:
        clean_id = credential_id.strip()
        deleted = False
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM passkeys WHERE credential_id = ?", (clean_id,))
                conn.commit()
                deleted = cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error deleting passkey {clean_id} from SQLite: {e}")

        # Update JSON store
        json_store = self._load_security_json()
        passkeys_list = json_store.get("passkeys", [])
        initial_len = len(passkeys_list)
        passkeys_list = [p for p in passkeys_list if p.get("credential_id") != clean_id]
        if len(passkeys_list) < initial_len:
            deleted = True
        json_store["passkeys"] = passkeys_list
        self._save_security_json(json_store)

        # Sync to Firestore if available
        if self.firestore_db:
            try:
                self.firestore_db.collection("passkeys").document(clean_id).delete()
            except Exception as e:
                logger.warning(f"Error deleting passkey from Firestore: {e}")

        return deleted

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
        cred_json_str = os.getenv("FIREBASE_CREDENTIALS_JSON")
        
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            if not firebase_admin._apps:
                if cred_path and os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                elif cred_json_str:
                    cred_dict = json.loads(cred_json_str)
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                else:
                    firebase_admin.initialize_app(options={'projectId': os.getenv('FIREBASE_PROJECT_ID', 'verify-opportunityx')})

            self.firestore_db = firestore.client()
            logger.info("Firebase Firestore initialized successfully.")
        except Exception as e:
            logger.info(f"Firebase initialization info/fallback: {e}")

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

    def delete_certificate(self, certificate_id: str) -> bool:
        clean_id = certificate_id.strip().upper()
        if clean_id in SEED_CERTIFICATES:
            del SEED_CERTIFICATES[clean_id]

        deleted = False
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM certificates WHERE certificate_id = ?", (clean_id,))
                conn.commit()
                deleted = cursor.rowcount > 0
            logger.info(f"Certificate {clean_id} permanently deleted from SQLite database.")
        except Exception as e:
            logger.error(f"Error deleting certificate {clean_id} from SQLite: {e}")

        # Delete from Firestore if available
        if self.firestore_db:
            try:
                self.firestore_db.collection("certificates").document(clean_id).delete()
                logger.info(f"Certificate {clean_id} deleted from Firestore.")
            except Exception as e:
                logger.error(f"Error deleting certificate {clean_id} from Firestore: {e}")

        return deleted

db = CertificateDatabase()

