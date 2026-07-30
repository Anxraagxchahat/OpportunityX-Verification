from app.engine.base import BaseVerificationValidator
from app.models.certificate import CertificateRecord, PublicVerificationResponse, CertificateStatus

class InternshipVerificationValidator(BaseVerificationValidator):
    """
    Validator engine for OpportunityX Internship Certificates.
    """

    def validate(self, record: CertificateRecord) -> PublicVerificationResponse:
        current_time = self.get_timestamp()

        # Security check: frontend never decides validity, backend logic enforces status
        status = record.status
        reason = None

        if status == CertificateStatus.REVOKED:
            reason = record.revocation_reason or "This certificate was officially revoked by OpportunityX authority."
        elif status == CertificateStatus.EXPIRED:
            reason = "This certificate reached its validity expiration date."
        elif status == CertificateStatus.SUSPENDED:
            reason = "This certificate is currently undergoing administrative review."

        return PublicVerificationResponse(
            found=True,
            status=status,
            certificate_id=record.certificate_id,
            type=record.certificate_type,
            type_label=record.certificate_type.value,
            recipient=record.recipient_name,
            role=record.role,
            duration=record.duration,
            issued_date=record.issued_date,
            issued_by="OpportunityX",
            verification_url=record.verification_url,
            qr_url=record.qr_url,
            digital_signature=record.digital_signature,
            verification_timestamp=current_time,
            trust_statement="This certificate has been issued by OpportunityX and successfully verified.",
            reason=reason,
            details={
                "skills_verified": record.skills_verified,
                "performance_score": record.performance_score,
                "recipient_masked": record.recipient_email_masked,
            },
            metadata=self.build_verification_metadata()
        )

class GenericVerificationValidator(BaseVerificationValidator):
    """
    Generic Validator for plug-and-play certificate categories
    (Career Certificates, Workshop Certificates, Badges, Assessments, Competitions).
    """

    def validate(self, record: CertificateRecord) -> PublicVerificationResponse:
        current_time = self.get_timestamp()
        status = record.status
        reason = None

        if status != CertificateStatus.VALID:
            reason = record.revocation_reason or f"Certificate status is {status.value}."

        return PublicVerificationResponse(
            found=True,
            status=status,
            certificate_id=record.certificate_id,
            type=record.certificate_type,
            type_label=record.certificate_type.value,
            recipient=record.recipient_name,
            role=record.role,
            duration=record.duration,
            issued_date=record.issued_date,
            issued_by="OpportunityX",
            verification_url=record.verification_url,
            qr_url=record.qr_url,
            digital_signature=record.digital_signature,
            verification_timestamp=current_time,
            trust_statement="This certificate has been issued by OpportunityX and successfully verified.",
            reason=reason,
            details={
                "skills_verified": record.skills_verified,
                "performance_score": record.performance_score,
                "recipient_masked": record.recipient_email_masked,
            },
            metadata=self.build_verification_metadata()
        )
