import os
import re
import json
import uuid
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from web3 import Web3
from jose import jwt, JWTError
from database import (
    supabase,
    create_offer,
    get_offer_by_id,
    update_offer_status,
    get_offers_by_wallet,
    save_verification,
    get_latest_verification,
    get_or_create_reputation,
    update_reputation,
    log_breach,
    get_breach_registry,
    get_breach_count,
)
from models import (
    CompanyVerifyRequest,
    CandidateVerifyRequest,
    DegreeVerifyRequest,
    OfferCreateRequest,
    OfferUpdateStatusRequest,
    VerificationResult,
    SignupRequest,
    LoginRequest,
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

    result_details = {
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

    # Persist verification to Supabase
    save_verification(
        wallet_address=req.wallet_address,
        verification_type="company_gst",
        status="PASS" if True else "FAIL",
        confidence=trust_score / 100.0,
        details=result_details,
    )
    update_reputation(req.wallet_address, offer_completed=False, offer_breached=False)

    return VerificationResult(
        status=True,
        trust_score=trust_score,
        details=result_details,
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
    result_details = {
        "digilocker_status": "SUCCESS",
        "candidate_name": record["name"],
        "aadhaar_verified": record["aadhaar_verified"],
        "degree": record["degree"],
        "university": record["university"],
        "graduation_year": record["year"],
        "aadhaar_hash_match": True,
    }

    # Persist verification to Supabase
    save_verification(
        wallet_address=req.wallet_address,
        verification_type="degree",
        status="PASS",
        confidence=0.9,
        details=result_details,
    )
    update_reputation(req.wallet_address, offer_completed=False, offer_breached=False)

    return VerificationResult(
        status=True,
        trust_score=90,
        details=result_details,
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


# ---------------------------------------------------------------------------
# POST /create-offer
# ---------------------------------------------------------------------------
@app.post("/create-offer")
async def create_offer_endpoint(req: OfferCreateRequest):
    offer_data = {
        "offer_id": str(uuid.uuid4()),
        "job_title": req.job_title,
        "salary": req.salary,
        "joining_date": req.joining_date.isoformat(),
        "company_gst": req.company_gst,
        "company_wallet": req.company_wallet,
        "candidate_wallet": req.candidate_wallet,
        "status": "PENDING",
        "tx_hash": None,
    }
    saved = create_offer(offer_data)
    return {"message": "Offer created successfully", "offer": saved}


# ---------------------------------------------------------------------------
# POST /verify-degree  –  Degree Verification via DigiLocker
# ---------------------------------------------------------------------------
@app.post("/verify-degree", response_model=VerificationResult)
async def verify_degree(req: DegreeVerifyRequest):
    token = req.digilocker_access_token.strip()
    if not token:
        raise HTTPException(status_code=400, detail="DigiLocker access token is required.")

    record = MOCK_DIGILOCKER_DB.get(token)
    if not record:
        fail_details = {
            "digilocker_status": "INVALID_TOKEN",
            "reason": "Token could not be validated against government records.",
        }
        save_verification(
            wallet_address=req.wallet_address,
            verification_type="degree",
            status="FAIL",
            confidence=0.1,
            details=fail_details,
        )
        return VerificationResult(status=False, trust_score=10, details=fail_details)

    # Check degree & university match
    degree_match = record["degree"].lower() == req.degree_name.lower()
    uni_match = record["university"].lower() == req.university.lower()
    year_match = record["year"] == req.graduation_year
    all_match = degree_match and uni_match and year_match
    trust_score = 95 if all_match else 50

    result_details = {
        "digilocker_status": "SUCCESS",
        "candidate_name": record["name"],
        "degree_verified": record["degree"],
        "university_verified": record["university"],
        "graduation_year_verified": record["year"],
        "degree_match": degree_match,
        "university_match": uni_match,
        "year_match": year_match,
    }

    save_verification(
        wallet_address=req.wallet_address,
        verification_type="degree",
        status="PASS" if all_match else "PARTIAL",
        confidence=trust_score / 100.0,
        details=result_details,
    )
    update_reputation(req.wallet_address, offer_completed=False, offer_breached=False)

    return VerificationResult(status=all_match, trust_score=trust_score, details=result_details)


# ---------------------------------------------------------------------------
# POST /offer/update-status
# ---------------------------------------------------------------------------
@app.post("/offer/update-status")
async def update_offer_status_endpoint(req: OfferUpdateStatusRequest):
    updated = update_offer_status(req.offer_id, req.status, req.tx_hash)

    if req.status == "COMPLETED":
        update_reputation(updated["company_wallet"], offer_completed=True, offer_breached=False)
        update_reputation(updated["candidate_wallet"], offer_completed=True, offer_breached=False)

    elif req.status == "BREACHED":
        if not req.reported_by or not req.accused_wallet:
            raise HTTPException(
                status_code=400,
                detail="reported_by and accused_wallet are required when status is BREACHED"
            )
        log_breach(req.offer_id, req.reported_by, req.accused_wallet, req.tx_hash)
        update_reputation(req.accused_wallet, offer_completed=False, offer_breached=True)

    return {"message": f"Offer status updated to {req.status}", "offer": updated}


# ---------------------------------------------------------------------------
# GET /offer/{offer_id}/status
# ---------------------------------------------------------------------------
@app.get("/offer/{offer_id}/status")
async def get_offer_status(offer_id: str):
    offer = get_offer_by_id(offer_id)
    return offer


# ---------------------------------------------------------------------------
# GET /reputation/{wallet}
# ---------------------------------------------------------------------------
@app.get("/reputation/{wallet}")
async def get_reputation(wallet: str):
    rep = get_or_create_reputation(wallet)
    return rep


# ---------------------------------------------------------------------------
# GET /breach-registry
# ---------------------------------------------------------------------------
@app.get("/breach-registry")
async def breach_registry():
    return get_breach_registry()


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"


async def get_current_user(authorization: str = Header(...)):
    """Dependency: extract & verify the Bearer token, return user id."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], options={"verify_aud": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")


# ---------------------------------------------------------------------------
# POST /auth/signup
# ---------------------------------------------------------------------------
@app.post("/auth/signup")
async def signup(req: SignupRequest):
    # Check if wallet already registered
    existing = supabase.table("users").select("id").eq("wallet_address", req.wallet_address).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Wallet already registered")

    # Create user in Supabase Auth
    try:
        auth_response = supabase.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Auth error: {str(e)}")

    user_id = auth_response.user.id

    # Insert into users table
    try:
        supabase.table("users").insert({
            "id": user_id,
            "email": req.email,
            "wallet_address": req.wallet_address,
            "role": req.role,
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {"message": "User registered successfully", "user_id": user_id}


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------
@app.post("/auth/login")
async def login(req: LoginRequest):
    # Sign in with Supabase Auth
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid credentials: {str(e)}")

    user_id = auth_response.user.id

    # Verify wallet matches
    user_row = supabase.table("users").select("wallet_address").eq("id", user_id).single().execute()
    if not user_row.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    if user_row.data["wallet_address"] != req.wallet_address:
        raise HTTPException(status_code=403, detail="Wallet address does not match")

    return {
        "access_token": auth_response.session.access_token,
        "token_type": "bearer",
        "user_id": user_id,
    }


# ---------------------------------------------------------------------------
# GET /auth/me  (protected)
# ---------------------------------------------------------------------------
@app.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user_row = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if not user_row.data:
        raise HTTPException(status_code=404, detail="User not found")
    return user_row.data
