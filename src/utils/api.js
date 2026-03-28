import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 15000,
});

/* ── GST Verification ─────────────────────────────────────── */
export const verifyGST = async (gstNumber) => {
  try {
    const res = await api.post('/verify-gst', { gstNumber });
    return res.data;
  } catch (err) {
    console.error('GST verification failed:', err);
    throw err;
  }
};

/* ── MCA21 Company Registration Cross-Check ───────────────── */
export const verifyMCA21 = async (cin) => {
  try {
    const res = await api.post('/verify-mca21', { cin });
    return res.data; // { companyAge, taxHistory, registrationStatus }
  } catch (err) {
    console.error('MCA21 verification failed:', err);
    throw err;
  }
};

/* ── MCA21 Email Confirmation (Work History) ──────────────── */
export const verifyWorkHistory = async (email, companyDomain) => {
  try {
    const res = await api.post('/verify-work-history', { email, companyDomain });
    return res.data; // { verified: true/false, domain, timestamp }
  } catch (err) {
    console.error('Work-history verification failed:', err);
    throw err;
  }
};

/* ── DigiLocker OAuth ─────────────────────────────────────── */
export const initiateDigiLockerOAuth = async () => {
  try {
    const res = await api.get('/digilocker/auth-url');
    return res.data; // { authUrl }
  } catch (err) {
    console.error('DigiLocker OAuth initiation failed:', err);
    throw err;
  }
};

export const fetchDigiLockerCertificates = async (oauthCode) => {
  try {
    const res = await api.post('/digilocker/certificates', { oauthCode });
    return res.data; // { certificates: [{ name, issuer, date }] }
  } catch (err) {
    console.error('DigiLocker certificate fetch failed:', err);
    throw err;
  }
};

/* ── Aadhaar KYC (Signzy / Surepass) ─────────────────────── */
export const initiateAadhaarKYC = async (walletAddress) => {
  try {
    const res = await api.post('/aadhaar/initiate', { walletAddress });
    return res.data; // { sessionId, redirectUrl }
  } catch (err) {
    console.error('Aadhaar KYC initiation failed:', err);
    throw err;
  }
};

export const verifyAadhaarOTP = async (sessionId, otp) => {
  try {
    const res = await api.post('/aadhaar/verify-otp', { sessionId, otp });
    return res.data; // { identityHash, verified: true }
  } catch (err) {
    console.error('Aadhaar OTP verification failed:', err);
    throw err;
  }
};

/* ── AI Consistency Score (Claude) ────────────────────────── */
export const getAIConsistencyScore = async (resumeData) => {
  try {
    const res = await api.post('/ai/consistency-score', { resumeData });
    return res.data; // { score, warnings: [...], analysis }
  } catch (err) {
    console.error('AI consistency scoring failed:', err);
    throw err;
  }
};

/* ── Degree Verification ──────────────────────────────────── */
export const verifyDegree = async (degreeBase64, candidateWallet) => {
  try {
    const res = await api.post('/verify-degree', { degreeBase64, candidateWallet });
    return res.data;
  } catch (err) {
    console.error('Degree verification failed:', err);
    throw err;
  }
};

export default api;
