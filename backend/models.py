from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any
from datetime import date

class CompanyVerifyRequest(BaseModel):
    gst_number: str

class CandidateVerifyRequest(BaseModel):
    aadhaar_hash: str
    digilocker_access_token: str

class OfferCreateRequest(BaseModel):
    job_title: str
    salary: int = Field(..., description="Salary/Escrow amount in INR")
    joining_date: date
    company_gst: str
    candidate_wallet_address: str

    @field_validator('salary')
    @classmethod
    def check_minimum_salary(cls, v: int) -> int:
        if v < 5000:
            raise ValueError('Salary/escrow must meet the ₹5,000 minimum floor.')
        return v

class VerificationResult(BaseModel):
    status: bool
    trust_score: int
    details: Dict[str, Any]
