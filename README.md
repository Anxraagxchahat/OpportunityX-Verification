# OpportunityX Verification Engine

A standalone, public, enterprise-grade certificate verification web application built for the OpportunityX ecosystem.

## 🚀 Features

- **Public Unauthenticated Verification**: HR, recruiters, companies, and clients can verify any certificate instantly without signing up or logging in.
- **OpportunityX Design System**: Built with exact visual fidelity using OpportunityX design tokens, Satoshi + Inter fonts, dark theme glassmorphism, glowing micro-interactions, and premium typography.
- **Modular Verification Engine**: Pluggable backend architecture supporting Internship Certificates (`OX-INT`), Career Certificates (`OX-CAR`), Workshop Certificates (`OX-WRK`), Badges (`OX-BDG`), Assessments (`OX-ASM`), and Competitions (`OX-CMP`).
- **Cryptographic Trust**: Verification validated via 256-bit ECDSA digital signatures, tamper-evident QR codes, W3C verifiable credentials metadata, and real-time backend API validation.
- **Interactive Certificate Document Viewer**: Embedded printable digital certificate modal with gold seal of authenticity, QR code, and PDF download support.
- **Security-First API**: Frontend never decides validity; backend enforces validation and returns only sanitized public payloads without exposing database internals.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, TailwindCSS, Framer Motion, Lucide Icons, QRCode.react
- **Backend**: Python 3.14, FastAPI, Pydantic v2, Firebase Firestore, Uvicorn

---

## ⚡ Quick Start

### 1. Run Backend (FastAPI)
```bash
cd backend
python run.py
```
Backend runs at: `http-[#]127.0.0.1:8000`  
Interactive API Docs: `http-[#]127.0.0.1:8000/docs`

### 2. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http-[#]localhost:5173/`

---

## 🔑 Sample Test IDs

- `OX-INT-2026-000145` — Valid Senior Full-Stack Engineering Internship Certificate
- `OX-INT-2026-000146` — Valid AI Systems & Machine Learning Internship Certificate
- `OX-CAR-2026-000301` — Valid Advanced Full-Stack Career Certificate
- `OX-WRK-2026-000502` — Valid Agentic AI Workshop Certificate
- `OX-INT-2026-000099` — Revoked Certificate (Demonstrates administrative revocation status)
- `OX-INT-2025-000012` — Expired Certificate (Demonstrates expiration status handling)
- `OX-FAKE-9999` — Invalid ID (Demonstrates clean, non-scary invalid certificate page)

---

## 📡 API Endpoint

`GET /api/verify/{certificateId}`

### Response (Verified)
```json
{
  "found": true,
  "status": "Valid",
  "certificate_id": "OX-INT-2026-000145",
  "type": "Internship Certificate",
  "type_label": "Internship Certificate",
  "recipient": "Anurag Verma",
  "role": "Senior Full Stack Engineering Intern",
  "duration": "6 Months (Jan 2026 - Jun 2026)",
  "issued_date": "June 15, 2026",
  "issued_by": "OpportunityX",
  "verification_url": "https://verify.opportunityx.co.in/verify/OX-INT-2026-000145",
  "qr_url": "https://verify.opportunityx.co.in/qr/OX-INT-2026-000145.png",
  "digital_signature": "0x4f8a92b1c3d4e5f67890abcd1234ef567890abcd1234ef567890abcd1234ef56",
  "verification_timestamp": "2026-07-30 10:12:04 UTC",
  "trust_statement": "This certificate has been issued by OpportunityX and successfully verified.",
  "details": {
    "skills_verified": ["React", "FastAPI", "Firebase", "System Architecture", "TailwindCSS"],
    "performance_score": "Top 1% Exceptional Distinction"
  }
}
```
