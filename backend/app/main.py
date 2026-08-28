import logging
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.verify import router as verify_router
from app.routes.admin import router as admin_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("opportunityx.main")

app = FastAPI(
    title="OpportunityX Verification Service",
    description="Standalone Verification Engine & Admin Issuance Service for OpportunityX Certificates",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for standalone frontend & potential OpportunityX ecosystem integration
allowed_origins = [
    "https://www.verify.opportunityx.co.in",
    "https://verify.opportunityx.co.in",
    "https://opportunityx.co.in",
    "https://www.opportunityx.co.in",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.opportunityx\.co\.in|https://.*\.onrender\.com|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify_router)
app.include_router(admin_router)

@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"], summary="System Health Check")
async def health_check():
    return {
        "status": "ok"
    }

@app.api_route("/", methods=["GET", "HEAD"], tags=["Health"])
async def root_ping():
    return {
        "name": "OpportunityX Verification API",
        "documentation": "/docs",
        "status": "online"
    }
