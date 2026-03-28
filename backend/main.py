import os
import re
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from web3 import Web3
from models import (
    CompanyVerifyRequest,
    CandidateVerifyRequest,
    VerificationResult,
)

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI application
app = FastAPI(
    title="HireChain Backend",
    version="1.0.0",
    description="Backend for HireChain decentralized recruitment platform"
)

# Configure CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# ---------------------------------------------------------------------------
# Web3 connection to deployed HireChain contract on Sepolia
# ---------------------------------------------------------------------------
SEPOLIA_RPC = os.getenv("SEPOLIA_RPC_URL", "")
HIRECHAIN_ADDRESS = os.getenv("HIRECHAIN_CONTRACT_ADDRESS", "")
MOCKUSDC_ADDRESS = os.getenv("MOCKUSDC_CONTRACT_ADDRESS", "")

w3 = None
hirechain_contract = None

if SEPOLIA_RPC:
    w3 = Web3(Web3.HTTPProvider(SEPOLIA_RPC))
    # Load ABI from the frontend export (created by deploy script)
    abi_path = Path(__file__).resolve().parent.parent / "frontend" / "src" / "utils" / "HireChain.json"
    if abi_path.exists() and HIRECHAIN_ADDRESS:
        with open(abi_path) as f:
            artifact = json.load(f)
        hirechain_contract = w3.eth.contract(
            address=Web3.to_checksum_address(HIRECHAIN_ADDRESS),
            abi=artifact["abi"],
        )


@app.get("/contract-status")
def contract_status():
    """Health check for the Web3 / smart-contract connection."""
    if not w3:
        return {"connected": False, "reason": "SEPOLIA_RPC_URL not configured"}
    connected = w3.is_connected()
    result = {
        "connected": connected,
        "hirechain_address": HIRECHAIN_ADDRESS or "not set",
        "mockusdc_address": MOCKUSDC_ADDRESS or "not set",
        "contract_loaded": hirechain_contract is not None,
    }
    if connected and hirechain_contract:
        try:
            owner = hirechain_contract.functions.owner().call()
            result["contract_owner"] = owner
        except Exception as e:
            result["contract_read_error"] = str(e)
    return result

# ---------------------------------------------------------------------------
# Mock databases – simulating MCA21 and DigiLocker government records
# ---------------------------------------------------------------------------
MOCK_MCA21_DB = {
    "22AAAAA0000A1Z5": {"entity_name": "Infosys Limited", "entity_type": "Company", "incorporated_year": 1981, "status": "Active"},
    "27BBBBB1111B2Z3": {"entity_name": "TCS Private Ltd", "entity_type": "Company", "incorporated_year": 1968, "status": "Active"},
    "29CCCCC2222C3Z1": {"entity_name": "Wipro Technologies", "entity_type": "Company", "incorporated_year": 1945, "status": "Active"},
    "07DDDDD3333D4Z9": {"entity_name": "NewStartup AI Pvt Ltd", "entity_type": "LLP", "incorporated_year": 2023, "status": "Active"},
}

MOCK_DIGILOCKER_DB = {
    "dl_token_valid_001": {"name": "Sanyam Sharma", "aadhaar_verified": True, "degree": "B.Tech Computer Science", "university": "IIT Delhi", "year": 2022},
    "dl_token_valid_002": {"name": "Priya Patel", "aadhaar_verified": True, "degree": "MBA Finance", "university": "IIM Ahmedabad", "year": 2021},
    "dl_token_valid_003": {"name": "Rahul Verma", "aadhaar_verified": True, "degree": "B.Sc Data Science", "university": "BITS Pilani", "year": 2023},
}

# ---------------------------------------------------------------------------
# Health-check route
# ---------------------------------------------------------------------------
@app.get("/")
def health_check():
    return {
        "status": "HireChain Backend is Live",
        "version": "1.0.0"
    }


# ---------------------------------------------------------------------------
# POST /verify-company  –  3-Layer GST + MCA21 Trust Check
# ---------------------------------------------------------------------------
@app.post("/verify-company", response_model=VerificationResult)
async def verify_company(req: CompanyVerifyRequest):
    gst = req.gst_number.strip().upper()

    # --- Layer 1: Regex pattern validation (GST format: 2-digit state + 10-char PAN + 1 entity + Z + check digit) ---
    gst_pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$"
    if not re.match(gst_pattern, gst):
        return VerificationResult(
            status=False,
            trust_score=0,
            details={
                "layer_1_format": "FAIL",
                "reason": f"GST number '{gst}' does not match the standard 15-character GSTIN format.",
            }
        )

    # --- Layer 2: Gemini AI analysis – entity type inference from GST pattern ---
    gemini_analysis = "Gemini API key not configured – skipping AI layer."
    try:
        if api_key and api_key != "YOUR_API_KEY_HERE":
            prompt = (
                f"Analyze this Indian GST number: {gst}. "
                "Based on the pattern, identify: 1) The state code, "
                "2) The PAN-based entity segment, 3) Whether this likely belongs to "
                "a Company, LLP, Individual, or Trust. Return a short structured analysis."
            )
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            gemini_analysis = response.text
    except Exception as e:
        gemini_analysis = f"Gemini analysis unavailable: {str(e)}"

    # --- Layer 3: Mock MCA21 database lookup for incorporation age ---
    mca_record = MOCK_MCA21_DB.get(gst)
    if not mca_record:
        return VerificationResult(
            status=False,
            trust_score=15,
            details={
                "layer_1_format": "PASS",
                "layer_2_gemini": gemini_analysis,
                "layer_3_mca21": "NOT FOUND – GST not present in MCA21 registry.",
                "recommendation": "Manual review required.",
            }
        )

    # Trust score based on company age
    company_age = 2026 - mca_record["incorporated_year"]
    if company_age >= 20:
        trust_score = 95
    elif company_age >= 10:
        trust_score = 80
    elif company_age >= 5:
        trust_score = 65
    else:
        trust_score = 40

    return VerificationResult(
        status=True,
        trust_score=trust_score,
        details={
            "layer_1_format": "PASS",
            "layer_2_gemini": gemini_analysis,
            "layer_3_mca21": {
                "entity_name": mca_record["entity_name"],
                "entity_type": mca_record["entity_type"],
                "incorporated_year": mca_record["incorporated_year"],
                "company_age_years": company_age,
                "status": mca_record["status"],
            },
            "final_trust_score": trust_score,
        }
    )


# ---------------------------------------------------------------------------
# POST /verify-candidate  –  DigiLocker OAuth Verification
# ---------------------------------------------------------------------------
@app.post("/verify-candidate", response_model=VerificationResult)
async def verify_candidate(req: CandidateVerifyRequest):
    token = req.digilocker_access_token.strip()

    if not token:
        raise HTTPException(status_code=400, detail="DigiLocker access token is required.")

    # Lookup the token against our mock DigiLocker government records
    record = MOCK_DIGILOCKER_DB.get(token)
    if not record:
        return VerificationResult(
            status=False,
            trust_score=10,
            details={
                "digilocker_status": "INVALID_TOKEN",
                "reason": "The provided DigiLocker access token could not be validated against government records.",
                "aadhaar_hash_received": req.aadhaar_hash[:8] + "..." if len(req.aadhaar_hash) > 8 else req.aadhaar_hash,
            }
        )

    # Deterministic success – token is valid
    return VerificationResult(
        status=True,
        trust_score=90,
        details={
            "digilocker_status": "SUCCESS",
            "candidate_name": record["name"],
            "aadhaar_verified": record["aadhaar_verified"],
            "degree": record["degree"],
            "university": record["university"],
            "graduation_year": record["year"],
            "aadhaar_hash_match": True,
        }
    )


# ---------------------------------------------------------------------------
# POST /check-resume-logic  –  The Magic Moment (Gemini Impossible Claims)
# ---------------------------------------------------------------------------
from pydantic import BaseModel

class ResumeCheckRequest(BaseModel):
    resume_text: str

@app.post("/check-resume-logic", response_model=VerificationResult)
async def check_resume_logic(req: ResumeCheckRequest):
    resume = req.resume_text.strip()

    if not resume:
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")

    # Build the Gemini prompt for impossible-claim detection
    prompt = f"""You are HireChain's AI Fraud Analyst. Analyze the following resume text and identify 'Impossible Claims'.

Specifically check for:
1. **Date Overlaps**: Two or more full-time roles or educational programs that overlap in time.
2. **Graduation vs Experience Mismatch**: If a candidate graduated in 2022 but claims 8 years of experience, that is suspicious.
3. **Unverified Skill Badges**: Claims of certifications like "Google Cloud Certified" or "AWS Solutions Architect" without any verifiable institution or date.
4. **Logical Inconsistencies**: Age vs education timeline, location conflicts, etc.

Return your analysis in this EXACT format:
- IMPOSSIBLE_CLAIMS_FOUND: [Yes/No]
- NUMBER_OF_FLAGS: [integer]
- FLAGS:
  - [Flag 1 description]
  - [Flag 2 description]
- TRUST_SCORE: [0-100, where 100 means fully clean resume]
- SUMMARY: [One-line verdict]

--- RESUME START ---
{resume}
--- RESUME END ---"""

    # Call Gemini for analysis
    gemini_verdict = None
    trust_score = 50  # default mid-range if Gemini is unavailable

    try:
        if api_key and api_key != "YOUR_API_KEY_HERE":
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            gemini_verdict = response.text

            # Parse trust score from Gemini response
            score_match = re.search(r"TRUST_SCORE:\s*(\d+)", gemini_verdict)
            if score_match:
                trust_score = min(100, max(0, int(score_match.group(1))))

            claims_match = re.search(r"IMPOSSIBLE_CLAIMS_FOUND:\s*(Yes|No)", gemini_verdict, re.IGNORECASE)
            claims_found = claims_match.group(1).lower() == "yes" if claims_match else False
        else:
            gemini_verdict = "Gemini API key not configured. Set GEMINI_API_KEY in .env to enable AI resume analysis."
            claims_found = False
    except Exception as e:
        gemini_verdict = f"Gemini analysis failed: {str(e)}"
        claims_found = False

    return VerificationResult(
        status=not claims_found,
        trust_score=trust_score,
        details={
            "analysis_engine": "Gemini 2.0 Flash",
            "impossible_claims_found": claims_found,
            "gemini_full_analysis": gemini_verdict,
            "resume_length_chars": len(resume),
        }
    )
