from abc import ABC, abstractmethod
from datetime import datetime
from app.models.certificate import CertificateRecord, PublicVerificationResponse, CertificateStatus, VerificationMetadata

class BaseVerificationValidator(ABC):
    """
    Abstract base validator for OpportunityX Verification Engine.
    Extensible for Internship, Career, Workshop, Badges, etc.
    """

    @abstractmethod
    def validate(self, record: CertificateRecord) -> PublicVerificationResponse:
        pass

    def build_verification_metadata(self) -> VerificationMetadata:
        return VerificationMetadata()

    def get_timestamp(self) -> str:
        return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
