from enum import Enum
from typing import Optional, Dict, Any, List
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
    ACHIEVEMENT = "Certificate of Achievement"
    RESEARCH_FELLOWSHIP = "Research Fellowship Certificate"
    COURSE_COMPLETION = "Course Completion Certificate"
    CONTRIBUTION_ASSOCIATION = "Certificate of Contribution & Association"
    # Backward compatibility mappings
    CAREER = "Career Certificate"
    WORKSHOP = "Workshop Certificate"
    BADGE = "Badge Certificate"
    ASSESSMENT = "Assessment Certificate"
    COMPETITION = "Competition Certificate"

class VerificationMetadata(BaseModel):
    issuing_authority: str = "OpportunityX"
    issuing_person: str = "Anurag Verma"
    issuing_designation: str = "Founder & CEO, OpportunityX"
    algorithm: str = "ECDSA-SHA256"
    blockchain_anchored: bool = True
    qr_status: str = "Verified & Tamper-Evident"
    digital_signature_status: str = "Cryptographically Validated (ECDSA-256)"
    verification_standard: str = "W3C Verifiable Credentials Standard v1.1"

class PublicVerificationResponse(BaseModel):
    found: bool
    status: CertificateStatus
    certificate_id: str
    type: Optional[str] = None
    type_label: Optional[str] = None
    recipient: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    issued_date: Optional[str] = None
    issued_by: str = "OpportunityX"
    issuing_person: str = "Anurag Verma"
    issuing_designation: str = "Founder & CEO, OpportunityX"
    verification_url: Optional[str] = None
    qr_url: Optional[str] = None
    digital_signature: Optional[str] = None
    verification_timestamp: str
    trust_statement: str = "This certificate has been issued by OpportunityX and successfully verified."
    reason: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    metadata: Optional[VerificationMetadata] = None
    # Dynamic fields for all certificate types
    product: Optional[str] = None
    period: Optional[str] = None
    key_contributions: Optional[List[str]] = None
    achievement_title: Optional[str] = None
    achievement_description: Optional[str] = None
    research_title: Optional[str] = None
    research_area: Optional[str] = None
    course_name: Optional[str] = None

class CertificateRecord(BaseModel):
    certificate_id: str
    certificate_type: CertificateType
    recipient_name: str
    recipient_email_masked: str
    role: str
    issued_date: str
    duration: str = ""
    status: CertificateStatus = CertificateStatus.VALID
    revocation_reason: Optional[str] = None
    expiration_date: Optional[str] = None
    verification_url: str
    qr_url: str
    digital_signature: str
    skills_verified: List[str] = []
    performance_score: Optional[str] = None
    # Dynamic fields
    product: Optional[str] = None
    period: Optional[str] = None
    key_contributions: Optional[List[str]] = []
    achievement_title: Optional[str] = None
    achievement_description: Optional[str] = None
    research_title: Optional[str] = None
    research_area: Optional[str] = None
    course_name: Optional[str] = None
    issued_by: str = "OpportunityX"
    issuing_person: str = "Anurag Verma"
    issuing_designation: str = "Founder & CEO, OpportunityX"
    created_at: str
    updated_at: str
