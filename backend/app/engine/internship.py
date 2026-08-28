from app.engine.base import BaseVerificationValidator
from app.models.certificate import CertificateRecord, PublicVerificationResponse, CertificateStatus

class InternshipVerificationValidator(BaseVerificationValidator):
    """
    Validator engine for OpportunityX Internship Certificates (OX-INT).
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

        type_label = record.certificate_type.value if hasattr(record.certificate_type, 'value') else str(record.certificate_type)

        return PublicVerificationResponse(
            found=True,
            status=status,
            certificate_id=record.certificate_id,
            type=type_label,
            type_label=type_label,
            recipient=record.recipient_name,
            role=record.role,
            duration=record.duration,
            issued_date=record.issued_date,
            issued_by=record.issued_by or "OpportunityX",
            issuing_person=record.issuing_person or "Anurag Verma",
            issuing_designation=record.issuing_designation or "Founder & CEO, OpportunityX",
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
            metadata=self.build_verification_metadata(),
            product=record.product,
            period=record.period,
            key_contributions=record.key_contributions,
            achievement_title=record.achievement_title,
            achievement_description=record.achievement_description,
            research_title=record.research_title,
            research_area=record.research_area,
            course_name=record.course_name
        )

class GenericVerificationValidator(BaseVerificationValidator):
    """
    Generic Validator for all OpportunityX certificate categories
    (OX-INT, OX-ACH, OX-WRK, OX-CMP, OX-CA).
    """

    def validate(self, record: CertificateRecord) -> PublicVerificationResponse:
        current_time = self.get_timestamp()
        status = record.status
        reason = None

        if status != CertificateStatus.VALID:
            reason = record.revocation_reason or f"Certificate status is {status.value if hasattr(status, 'value') else status}."

        type_label = record.certificate_type.value if hasattr(record.certificate_type, 'value') else str(record.certificate_type)

        return PublicVerificationResponse(
            found=True,
            status=status,
            certificate_id=record.certificate_id,
            type=type_label,
            type_label=type_label,
            recipient=record.recipient_name,
            role=record.role,
            duration=record.duration,
            issued_date=record.issued_date,
            issued_by=record.issued_by or "OpportunityX",
            issuing_person=record.issuing_person or "Anurag Verma",
            issuing_designation=record.issuing_designation or "Founder & CEO, OpportunityX",
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
            metadata=self.build_verification_metadata(),
            product=record.product,
            period=record.period,
            key_contributions=record.key_contributions,
            achievement_title=record.achievement_title,
            achievement_description=record.achievement_description,
            research_title=record.research_title,
            research_area=record.research_area,
            course_name=record.course_name
        )
