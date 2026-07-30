from typing import Dict
from app.engine.base import BaseVerificationValidator
from app.engine.internship import InternshipVerificationValidator, GenericVerificationValidator
from app.models.certificate import CertificateRecord, PublicVerificationResponse, CertificateStatus
from datetime import datetime

class VerificationEngine:
    """
    Core Modular Verification Engine for OpportunityX.
    Future-ready dispatcher supporting Internship, Career, Workshop, Badges, etc.
    """

    def __init__(self):
        self._validators: Dict[str, BaseVerificationValidator] = {}
        self._default_validator = GenericVerificationValidator()
        self.register_defaults()

    def register_validator(self, prefix: str, validator: BaseVerificationValidator):
        self._validators[prefix.upper()] = validator

    def register_defaults(self):
        internship_validator = InternshipVerificationValidator()
        self.register_validator("OX-INT", internship_validator)
        self.register_validator("OX-CAR", GenericVerificationValidator())
        self.register_validator("OX-WRK", GenericVerificationValidator())
        self.register_validator("OX-BDG", GenericVerificationValidator())
        self.register_validator("OX-ASM", GenericVerificationValidator())
        self.register_validator("OX-CMP", GenericVerificationValidator())

    def verify(self, certificate_id: str, record: CertificateRecord | None) -> PublicVerificationResponse:
        current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # If not found in database
        if not record:
            return PublicVerificationResponse(
                found=False,
                status=CertificateStatus.INVALID,
                certificate_id=certificate_id,
                issued_by="OpportunityX",
                verification_timestamp=current_time,
                trust_statement="Certificate identification failed. The requested certificate does not exist in the OpportunityX registry.",
                reason="Invalid Certificate ID or record does not exist."
            )

        # Detect validator by ID prefix (e.g. OX-INT-2026-000145 -> prefix OX-INT)
        parts = certificate_id.upper().split("-")
        prefix = f"{parts[0]}-{parts[1]}" if len(parts) >= 2 else parts[0]

        validator = self._validators.get(prefix, self._default_validator)
        return validator.validate(record)

verification_engine = VerificationEngine()
