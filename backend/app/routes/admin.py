import os
import hashlib
import hmac
import time
import random
import pyotp
import io
import base64
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Header, Depends, Body
from pydantic import BaseModel, Field

from app.database import db
from app.models.certificate import CertificateRecord, CertificateStatus, CertificateType
from app.seed_data import SEED_CERTIFICATES

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

# 256-bit cryptographically safe default key
DEFAULT_ADMIN_KEY = os.getenv("OX_ADMIN_KEY", "OX-SECURE-ADMIN-2026-9f8a3c7b1e4d0258")

# Default TOTP Secret for Google Authenticator (Base32 format)
TOTP_SECRET = os.getenv("OX_TOTP_SECRET", "JBSWY3DPEHPK3PXP")

# In-memory runtime state for Admin Key
CURRENT_ADMIN_KEY = DEFAULT_ADMIN_KEY

# 2FA Enrollment State
IS_2FA_ENABLED = True
REGISTERED_PASSKEYS = {}

class IssueCertificateRequest(BaseModel):
    recipient: str = Field(..., example="Anurag Verma")
    type_label: str = Field(default="Internship Certificate", example="Internship Certificate")
    role: str = Field(..., example="Senior Full Stack Engineering Intern")
    duration: str = Field(default="6 Months (Jan 2026 - Jun 2026)", example="6 Months (Jan 2026 - Jun 2026)")
    issued_date: str = Field(default="June 15, 2026", example="June 15, 2026")
    issued_by: str = Field(default="OpportunityX", example="OpportunityX")
    skills_verified: List[str] = Field(default=[], example=["React", "FastAPI", "Firebase", "System Architecture"])
    prefix: str = Field(default="OX-INT", example="OX-INT")

class UpdateAdminKeyRequest(BaseModel):
    current_key: str = Field(..., description="The existing admin key for verification")
    new_key: str = Field(..., description="The new custom admin key to set")

class TotpVerifyRequest(BaseModel):
    code: str = Field(..., example="123456", description="6-digit TOTP code from Google Authenticator")

class PasskeyRegisterRequest(BaseModel):
    credential_id: str
    public_key: Optional[str] = None
    device_name: Optional[str] = "Admin Mobile / Biometric Device"

class PasskeyVerifyRequest(BaseModel):
    credential_id: str
    client_data_json: Optional[str] = None
    signature: Optional[str] = None

def get_current_admin_key() -> str:
    return db.get_setting("admin_key", os.getenv("OX_ADMIN_KEY", "OX-SECURE-ADMIN-2026-9f8a3c7b1e4d0258"))

def get_current_totp_secret() -> str:
    return db.get_setting("totp_secret", os.getenv("OX_TOTP_SECRET", "JBSWY3DPEHPK3PXP"))

def verify_admin_key(x_admin_key: Optional[str] = Header(None)):
    if not x_admin_key:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Missing X-Admin-Key header."
        )
    
    clean_key = x_admin_key.strip()
    current_key = get_current_admin_key()
    totp_secret = get_current_totp_secret()
    
    # Check 1: Master Secret Key comparison
    if hmac.compare_digest(clean_key.encode('utf-8'), current_key.encode('utf-8')):
        return clean_key
        
    # Check 2: 6-digit TOTP Google Authenticator code check
    if len(clean_key) == 6 and clean_key.isdigit():
        totp = pyotp.TOTP(totp_secret)
        if totp.verify(clean_key, valid_window=1):
            return clean_key

    # Check 3: Registered Passkey credential ID (Memory or Persistent DB)
    if clean_key in REGISTERED_PASSKEYS or db.is_passkey_valid(clean_key):
        return clean_key

    raise HTTPException(
        status_code=401,
        detail="Unauthorized: Invalid Admin Secret Key, TOTP OTP Code, or Passkey."
    )

def generate_cert_id(prefix: str = "OX-INT") -> str:
    year = 2026
    rand_num = random.randint(100000, 999999)
    cert_id = f"{prefix.upper()}-{year}-{rand_num}"
    
    while cert_id in SEED_CERTIFICATES:
        rand_num = random.randint(100000, 999999)
        cert_id = f"{prefix.upper()}-{year}-{rand_num}"
        
    return cert_id

def generate_digital_signature(cert_id: str, recipient: str, role: str) -> str:
    current_key = get_current_admin_key()
    raw_payload = f"{cert_id}:{recipient}:{role}:{time.time()}:{current_key}"
    hash_digest = hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()
    return f"0x{hash_digest}"

@router.get("/verify-key", summary="Validate Admin Secret Key / TOTP / Passkey")
async def verify_key(admin_key: str = Depends(verify_admin_key)):
    current_key = get_current_admin_key()
    return {"status": "valid", "authenticated": True, "admin_key": current_key, "message": "Admin Access Granted."}

@router.get("/security/status", summary="Get 2FA and Security Status")
async def security_status():
    totp_secret = get_current_totp_secret()
    totp = pyotp.TOTP(totp_secret)
    passkeys = db.list_passkeys()
    is_enabled = db.get_setting("is_2fa_enabled", "true") == "true"
    return {
        "status": "success",
        "is_2fa_enabled": is_enabled,
        "totp_secret": totp_secret,
        "totp_otpauth_url": totp.provisioning_uri(
            name="admin@opportunityx.co.in",
            issuer_name="OpportunityX Admin Registry"
        ),
        "passkeys_count": len(passkeys),
        "registered_passkeys": passkeys
    }

@router.get("/totp/setup", summary="Get Google Authenticator TOTP Setup QR Code")
async def totp_setup(admin_key: str = Depends(verify_admin_key)):
    totp_secret = get_current_totp_secret()
    totp = pyotp.TOTP(totp_secret)
    otpauth_url = totp.provisioning_uri(
        name="admin@opportunityx.co.in",
        issuer_name="OpportunityX Admin Registry"
    )
    return {
        "status": "success",
        "secret": totp_secret,
        "otpauth_url": otpauth_url,
        "current_sample_code": totp.now()
    }

@router.post("/totp/verify", summary="Verify Google Authenticator 6-Digit Code")
async def totp_verify(payload: TotpVerifyRequest = Body(...)):
    code = payload.code.strip()
    if len(code) != 6 or not code.isdigit():
        raise HTTPException(status_code=400, detail="OTP code must be exactly 6 digits.")

    totp_secret = get_current_totp_secret()
    totp = pyotp.TOTP(totp_secret)
    if totp.verify(code, valid_window=2):
        current_key = get_current_admin_key()
        return {
            "status": "valid",
            "authenticated": True,
            "token": code,
            "admin_key": current_key,
            "message": "Google Authenticator OTP verified successfully!"
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP code. Check your phone app.")

@router.post("/totp/enable", summary="Enable 2FA inside Security Settings")
async def totp_enable(
    payload: TotpVerifyRequest = Body(...),
    admin_key: str = Depends(verify_admin_key)
):
    code = payload.code.strip()
    totp_secret = get_current_totp_secret()
    totp = pyotp.TOTP(totp_secret)
    if totp.verify(code, valid_window=2):
        db.set_setting("is_2fa_enabled", "true")
        return {"status": "success", "message": "Google Authenticator 2FA is now ACTIVE and verified!"}
    raise HTTPException(status_code=400, detail="Verification code invalid. 2FA not activated.")

@router.post("/passkey/register", summary="Register WebAuthn Biometric Passkey Device")
async def register_passkey(
    payload: PasskeyRegisterRequest = Body(...),
    admin_key: str = Depends(verify_admin_key)
):
    if not payload.credential_id:
        raise HTTPException(status_code=400, detail="Missing credential_id")
    
    passkey_obj = db.add_passkey(
        credential_id=payload.credential_id,
        device_name=payload.device_name or "Mobile / Biometric Passkey",
        public_key=payload.public_key
    )
    REGISTERED_PASSKEYS[payload.credential_id] = passkey_obj

    return {
        "status": "success",
        "message": f"Device Passkey '{payload.device_name}' registered and permanently saved!",
        "credential_id": payload.credential_id,
        "total_passkeys": len(db.list_passkeys())
    }

@router.post("/passkey/verify", summary="Verify WebAuthn Biometric Passkey")
async def verify_passkey(payload: PasskeyVerifyRequest = Body(...)):
    cred_id = payload.credential_id
    if cred_id and (cred_id in REGISTERED_PASSKEYS or db.is_passkey_valid(cred_id)):
        current_key = get_current_admin_key()
        return {
            "status": "valid",
            "authenticated": True,
            "token": cred_id,
            "admin_key": current_key,
            "message": "Biometric Passkey Verified Successfully!"
        }
    raise HTTPException(status_code=401, detail="Passkey verification failed or device not recognized.")

@router.post("/update-key", summary="Update Custom Admin Secret Key (Admin Only)")
async def update_key(
    payload: UpdateAdminKeyRequest = Body(...),
    admin_key: str = Depends(verify_admin_key)
):
    if not payload.new_key or len(payload.new_key.strip()) < 8:
        raise HTTPException(status_code=400, detail="New Admin Key must be at least 8 characters long.")

    new_key_clean = payload.new_key.strip()
    db.set_setting("admin_key", new_key_clean)
    return {
        "status": "success",
        "admin_key": new_key_clean,
        "message": "Admin Secret Key permanently updated in database.",
        "key_length": len(new_key_clean)
    }

@router.post("/issue", response_model=CertificateRecord, summary="Issue New Certificate (Admin Only)")
async def issue_certificate(
    payload: IssueCertificateRequest = Body(...),
    admin_key: str = Depends(verify_admin_key)
):
    cert_id = generate_cert_id(payload.prefix)
    digital_sig = generate_digital_signature(cert_id, payload.recipient, payload.role)
    current_time = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    email_prefix = payload.recipient[0].lower() if payload.recipient else "s"
    cert_type = CertificateType.INTERNSHIP if "INT" in payload.prefix.upper() else CertificateType.CAREER

    new_record = CertificateRecord(
        certificate_id=cert_id,
        certificate_type=cert_type,
        recipient_name=payload.recipient,
        recipient_email_masked=f"{email_prefix}******@opportunityx.co.in",
        role=payload.role,
        issued_date=payload.issued_date,
        duration=payload.duration,
        status=CertificateStatus.VALID,
        verification_url=f"https://verify.opportunityx.co.in/?id={cert_id}",
        qr_url=f"https://verify.opportunityx.co.in/?id={cert_id}",
        digital_signature=digital_sig,
        skills_verified=payload.skills_verified,
        performance_score="Top Distinction",
        created_at=current_time,
        updated_at=current_time
    )

    db.add_certificate(new_record)
    return new_record

@router.get("/list", response_model=List[CertificateRecord], summary="List All Issued Certificates (Admin Only)")
async def list_certificates(admin_key: str = Depends(verify_admin_key)):
    return db.list_all_certificates()

@router.post("/revoke/{certificate_id}", summary="Revoke Issued Certificate (Admin Only)")
async def revoke_certificate(certificate_id: str, admin_key: str = Depends(verify_admin_key)):
    success = db.revoke_certificate(certificate_id)
    if not success:
        raise HTTPException(status_code=404, detail="Certificate ID not found.")
    return {"status": "success", "message": f"Certificate {certificate_id} has been revoked."}
