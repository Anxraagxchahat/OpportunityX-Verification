from fastapi import APIRouter, HTTPException, Path
from app.database import db
from app.engine.registry import verification_engine
from app.models.certificate import PublicVerificationResponse

router = APIRouter(prefix="/api", tags=["Verification"])

@router.get(
    "/verify/{certificateId}",
    response_model=PublicVerificationResponse,
    summary="Verify OpportunityX Certificate",
    description="Public, unauthenticated API endpoint to verify certificates issued by OpportunityX."
)
async def verify_certificate(
    certificateId: str = Path(..., description="The unique certificate ID, e.g. OX-INT-2026-000145")
):
    clean_id = certificateId.strip().upper()
    if not clean_id or len(clean_id) < 5:
        raise HTTPException(status_code=400, detail="Invalid certificate format provided.")

    record = db.get_certificate(clean_id)
    verified_response = verification_engine.verify(clean_id, record)

    return verified_response
