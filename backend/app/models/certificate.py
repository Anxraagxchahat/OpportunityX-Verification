from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class CertificateStatus(str, Enum):
    VALID = "Valid"
    INVALID = "Invalid"
    REVOKED = "Revoked"
    EXPIRED = "Expired"
    SUSPENDED = "Suspended"

class CertificateType(str, Enum):
    INTERNSHIP = "Internship Certificate"
    CAREER = "Career Certificate"
    WORKSHOP = "Workshop Certificate"
    BADGE = "Badge Certificate"
    ASSESSMENT = "Assessment Certificate"
    COMPETITION = "Competition Certificate"

class VerificationMetadata(BaseModel):
    issuing_authority: str = "OpportunityX"
    algorithm: str = "ECDSA-SHA256"
    blockchain_anchored: bool = True
    qr_status: str = "Verified & Tamper-Evident"
    digital_signature_status: str = "Cryptographically Validated (ECDSA-256)"
    verification_standard: str = "W3C Verifiable Credentials Standard v1.1"

class PublicVerificationResponse(BaseModel):
    found: bool
    status: CertificateStatus
    certificate_id: str
    type: Optional[CertificateType] = None
    type_label: Optional[str] = None
    recipient: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    issued_date: Optional[str] = None
    issued_by: str = "OpportunityX"
    verification_url: Optional[str] = None
    qr_url: Optional[str] = None
    digital_signature: Optional[str] = None
    verification_timestamp: str
    trust_statement: str = "This certificate has been issued by OpportunityX and successfully verified."
    reason: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    metadata: Optional[VerificationMetadata] = None

class CertificateRecord(BaseModel):
    certificate_id: str
    certificate_type: CertificateType
    recipient_name: str
    recipient_email_masked: str
    role: str
    issued_date: str
    duration: str
    status: CertificateStatus
    revocation_reason: Optional[str] = None
    expiration_date: Optional[str] = None
    verification_url: str
    qr_url: str
    digital_signature: str
    skills_verified: list[str] = []
    performance_score: Optional[str] = None
    created_at: str
    updated_at: str
