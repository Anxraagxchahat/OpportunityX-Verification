from typing import Dict
from app.models.certificate import CertificateRecord

# Registry begins clean. Only officially issued certificates will populate the database.
SEED_CERTIFICATES: Dict[str, CertificateRecord] = {}
