import axios from 'axios';

/* ── Axios instance pointing to Shubham's FastAPI server ──── */
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Health Check ─────────────────────────────────────────── */
export const healthCheck = async () => {
  const res = await api.get('/');
  return res.data;
};

/* ── Contract Status ──────────────────────────────────────── */
export const getContractStatus = async () => {
  const res = await api.get('/contract-status');
  return res.data;
};

/* ── GST + MCA21 3-Layer Trust Check ──────────────────────── */
/* Maps to POST /verify-company { gst_number }
   Returns { status: bool, trust_score: int, details: {...} } */
export const verifyGST = async (gstNumber) => {
  try {
    const res = await api.post('/verify-company', { gst_number: gstNumber });
    return res.data;
  } catch (err) {
    if (err.response?.data?.detail) {
      throw new Error(err.response.data.detail);
    }
    throw new Error('GST verification failed — is the backend running on :8000?');
  }
};

/* ── Candidate Aadhaar + DigiLocker Verification ──────────── */
/* Maps to POST /verify-candidate { aadhaar_hash, digilocker_access_token }
   Returns { status: bool, trust_score: int, details: {...} } */
export const verifyCandidate = async (aadhaarHash, digilockerToken) => {
  try {
    const res = await api.post('/verify-candidate', {
      aadhaar_hash: aadhaarHash,
      digilocker_access_token: digilockerToken,
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.detail) {
      throw new Error(err.response.data.detail);
    }
    throw new Error('Candidate verification failed.');
  }
};

/* ── AI Resume Logic Check (Gemini) ───────────────────────── */
/* Maps to POST /check-resume-logic { resume_text }
   Returns { status: bool, trust_score: int, details: {...} } */
export const checkResumeLogic = async (resumeText) => {
  try {
    const res = await api.post('/check-resume-logic', { resume_text: resumeText });
    return res.data;
  } catch (err) {
    if (err.response?.data?.detail) {
      throw new Error(err.response.data.detail);
    }
    throw new Error('Resume analysis failed.');
  }
};

/* ── File-based degree verification (reads file → sends text) */
export const verifyDegree = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const result = await checkResumeLogic(text);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsText(file);
  });
};

/* ── Submit Offer (backend validation) ────────────────────── */
export const submitOffer = async (offerData) => {
  try {
    const res = await api.post('/submit-offer', offerData);
    return res.data;
  } catch (err) {
    if (err.response?.data?.detail) {
      throw new Error(err.response.data.detail);
    }
    throw new Error('Offer submission failed.');
  }
};

/* ── Breach Registry Fetch ────────────────────────────────── */
export const fetchBreachRegistry = async () => {
  try {
    const res = await api.get('/breach-registry');
    return res.data;
  } catch {
    // Backend may not have this endpoint yet — return empty fallback
    return { entries: [] };
  }
};

export default api;
