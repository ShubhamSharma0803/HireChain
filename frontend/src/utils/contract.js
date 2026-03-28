import { ethers } from 'ethers';
import HireChainArtifact from './HireChain.json';
import MockUSDCArtifact from './MockUSDC.json';

/* ── Constants ────────────────────────────────────────────── */
export const CONTRACT_ADDRESS = HireChainArtifact.address || process.env.REACT_APP_CONTRACT_ADDRESS;
export const USDC_ADDRESS     = MockUSDCArtifact.address || process.env.REACT_APP_USDC_ADDRESS;
export const ESCROW_FLOOR     = 60; // 60 USDC minimum escrow (stored with 6 decimals in contract)

const CONTRACT_ABI = HireChainArtifact.abi;
const USDC_ABI = MockUSDCArtifact.abi;

let provider = null;
let signer = null;
let hireChainContract = null;
let usdcContract = null;

/* ── Provider Initialisation ──────────────────────────────── */
export const initializeProvider = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    hireChainContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
    return { provider, signer, hireChainContract, usdcContract };
  }
  console.warn('MetaMask not detected.');
  return null;
};

/* ── Connect Wallet ───────────────────────────────────────── */
export const connectWallet = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  await initializeProvider();
  return accounts[0];
};

/* ── Escrow Floor Validation ──────────────────────────────── */
export const validateEscrow = (salaryUSDC) => {
  if (salaryUSDC < ESCROW_FLOOR) {
    return {
      valid: false,
      message: `Minimum escrow is ₹${ESCROW_FLOOR.toLocaleString()} USDC. Received ₹${salaryUSDC.toLocaleString()}.`,
    };
  }
  return { valid: true, message: 'Escrow meets floor requirement.' };
};

/* ── Approve USDC ─────────────────────────────────────────── */
export const approveUSDC = async (amountUSDC) => {
  if (!usdcContract) await initializeProvider();
  if (!usdcContract) throw new Error('Contract not initialised');
  
  // Format to 6 decimals
  const amountToApprove = ethers.parseUnits(amountUSDC.toString(), 6);
  
  const tx = await usdcContract.approve(CONTRACT_ADDRESS, amountToApprove);
  await tx.wait();
  return tx.hash;
};

/* ── Create Offer (with escrow floor enforcement) ─────────── */
export const createOffer = async (candidate, role, salary, joiningDate) => {
  const check = validateEscrow(salary);
  if (!check.valid) throw new Error(check.message);

  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');

  await approveUSDC(salary);

  const amountToLock = ethers.parseUnits(salary.toString(), 6);
  const tx = await hireChainContract.createOffer(
    candidate, role, amountToLock, joiningDate
  );
  await tx.wait();
  return tx.hash;
};

/* ── Accept Offer ─────────────────────────────────────────── */
export const acceptOffer = async (offerId, escrowAmount) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  
  await approveUSDC(escrowAmount);
  
  const amountToLock = ethers.parseUnits(escrowAmount.toString(), 6);
  const tx = await hireChainContract.acceptOffer(offerId, amountToLock);
  await tx.wait();
  return tx.hash;
};

/* ── Confirm Joining ──────────────────────────────────────── */
export const confirmJoining = async (offerId) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  const tx = await hireChainContract.confirmJoining(offerId);
  await tx.wait();
  return tx.hash;
};

/* ── Report Breach ────────────────────────────────────────── */
export const reportBreach = async (offerId) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  const tx = await hireChainContract.reportBreach(offerId);
  await tx.wait();
  return tx.hash;
};

/* ── Bind Aadhaar Identity (1 Human = 1 Wallet) ──────────── */
export const bindIdentity = async (aadhaarHash) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  const hashBytes = ethers.id(aadhaarHash); // one-way keccak256
  const tx = await hireChainContract.bindAadhaar(hashBytes);
  await tx.wait();
  return tx.hash;
};

/* ── Get Reputation ───────────────────────────────────────── */
export const getReputation = async (wallet) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  const [breaches, completions, score, frozen] = await hireChainContract.getReputationScore(wallet);
  return { breaches: Number(breaches), completions: Number(completions), score: Number(score), frozen };
};

/* ── Get Active Offer ─────────────────────────────────────── */
export const getOffer = async (id) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  const o = await hireChainContract.getOffer(id);
  return {
    id: Number(o.id),
    company: o.company,
    candidate: o.candidate,
    jobTitle: o.jobTitle,
    joiningDate: Number(o.joiningDate),
    escrowAmount: ethers.formatUnits(o.escrowAmount, 6),
    status: o.status,
    companyConfirmed: o.companyConfirmed,
    candidateConfirmed: o.candidateConfirmed,
    createdAt: Number(o.createdAt)
  };
};
