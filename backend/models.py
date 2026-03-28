from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, Optional
from datetime import date

class CompanyVerifyRequest(BaseModel):
    gst_number: str
    wallet_address: str

class CandidateVerifyRequest(BaseModel):
    aadhaar_hash: str
    digilocker_access_token: str
    wallet_address: str

class DegreeVerifyRequest(BaseModel):
    wallet_address: str
    degree_name: str
    university: str
    graduation_year: int
    digilocker_access_token: str

class OfferCreateRequest(BaseModel):
    job_title: str
    salary: int = Field(..., description="Salary/Escrow amount in INR")
    joining_date: date
    company_gst: str
    company_wallet: str
    candidate_wallet: str

    @field_validator('salary')
    @classmethod
    def check_minimum_salary(cls, v: int) -> int:
        if v < 5000:
            raise ValueError('Salary/escrow must meet the ₹5,000 minimum floor.')
        return v

class OfferUpdateStatusRequest(BaseModel):
    offer_id: str
    status: str  # "COMPLETED" or "BREACHED"
    tx_hash: str
    reported_by: Optional[str] = None
    accused_wallet: Optional[str] = None

class VerificationResult(BaseModel):
    status: bool
    trust_score: int
    details: Dict[str, Any]


# ---------------------------------------------------------------------------
# Auth models
# ---------------------------------------------------------------------------
class SignupRequest(BaseModel):
    email: str
    password: str
    wallet_address: str
    role: str  # "company" or "candidate"

class LoginRequest(BaseModel):
    email: str
    password: str
    wallet_address: str
