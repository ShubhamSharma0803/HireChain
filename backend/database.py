import os
from dotenv import load_dotenv
from fastapi import HTTPException
from supabase import create_client, Client


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ---------------------------------------------------------------------------
# Offers
# ---------------------------------------------------------------------------

def create_offer(offer_data: dict) -> dict:
    """Insert a new offer row and return the created record."""
    try:
        result = supabase.table("offers").insert(offer_data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create offer: {str(e)}")


def get_offer_by_id(offer_id: str) -> dict:
    """Fetch a single offer by its offer_id field."""
    try:
        result = supabase.table("offers").select("*").eq("offer_id", offer_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Offer '{offer_id}' not found")
        return result.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch offer: {str(e)}")


def update_offer_status(offer_id: str, status: str, tx_hash: str) -> dict:
    """Update the status and tx_hash of an existing offer."""
    try:
        result = (
            supabase.table("offers")
            .update({"status": status, "tx_hash": tx_hash})
            .eq("offer_id", offer_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Offer '{offer_id}' not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update offer: {str(e)}")


def get_offers_by_wallet(wallet_address: str) -> list:
    """Return all offers where company_wallet OR candidate_wallet matches."""
    try:
        result = (
            supabase.table("offers")
            .select("*")
            .or_(f"company_wallet.eq.{wallet_address},candidate_wallet.eq.{wallet_address}")
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch offers: {str(e)}")


# ---------------------------------------------------------------------------
# Verifications
# ---------------------------------------------------------------------------

def save_verification(
    wallet_address: str,
    verification_type: str,
    status: str,
    confidence: float,
    details: dict,
) -> dict:
    """Insert a new verification record."""
    try:
        result = supabase.table("verifications").insert({
            "wallet_address": wallet_address,
            "type": verification_type,
            "status": status,
            "confidence": confidence,
            "details": details,
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save verification: {str(e)}")


def get_latest_verification(wallet_address: str, verification_type: str) -> dict | None:
    """Get the most recent verification of a given type for a wallet."""
    try:
        result = (
            supabase.table("verifications")
            .select("*")
            .eq("wallet_address", wallet_address)
            .eq("type", verification_type)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch verification: {str(e)}")


# ---------------------------------------------------------------------------
# Reputation
# ---------------------------------------------------------------------------

def get_or_create_reputation(wallet_address: str) -> dict:
    """Fetch the reputation row for a wallet; create with defaults if missing."""
    try:
        result = (
            supabase.table("reputation")
            .select("*")
            .eq("wallet_address", wallet_address)
            .execute()
        )
        if result.data:
            return result.data[0]

        # Create default reputation
        new_row = supabase.table("reputation").insert({
            "wallet_address": wallet_address,
            "trust_score": 50,
            "completed_offers": 0,
            "breached_offers": 0,
            "flags": 0,
        }).execute()
        return new_row.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get/create reputation: {str(e)}")


def update_reputation(wallet_address: str, offer_completed: bool, offer_breached: bool) -> dict:
    """Increment the appropriate counters and recalculate trust_score."""
    try:
        rep = get_or_create_reputation(wallet_address)

        completed = rep["completed_offers"] + (1 if offer_completed else 0)
        breached = rep["breached_offers"] + (1 if offer_breached else 0)
        flags = rep["flags"]

        trust_score = max(0, min(100, 50 + (completed * 10) - (breached * 20) - (flags * 5)))

        result = (
            supabase.table("reputation")
            .update({
                "completed_offers": completed,
                "breached_offers": breached,
                "trust_score": trust_score,
            })
            .eq("wallet_address", wallet_address)
            .execute()
        )
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update reputation: {str(e)}")


# ---------------------------------------------------------------------------
# Breach Registry
# ---------------------------------------------------------------------------

def log_breach(offer_id: str, reported_by: str, accused_wallet: str, tx_hash: str) -> dict:
    """Insert a new breach record."""
    try:
        result = supabase.table("breach_registry").insert({
            "offer_id": offer_id,
            "reported_by": reported_by,
            "accused_wallet": accused_wallet,
            "tx_hash": tx_hash,
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log breach: {str(e)}")


def get_breach_registry() -> list:
    """Return all breach records ordered by created_at descending."""
    try:
        result = (
            supabase.table("breach_registry")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch breach registry: {str(e)}")


def get_breach_count(wallet_address: str) -> int:
    """Return the number of breaches where accused_wallet matches."""
    try:
        result = (
            supabase.table("breach_registry")
            .select("id", count="exact")
            .eq("accused_wallet", wallet_address)
            .execute()
        )
        return result.count or 0
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to count breaches: {str(e)}")
