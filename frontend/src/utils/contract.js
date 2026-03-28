import { ethers } from 'ethers';

/* ── Constants ────────────────────────────────────────────── */
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
const USDC_ADDRESS     = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const ESCROW_FLOOR     = 5000; // Rs. 5,000 USDC minimum escrow

const CONTRACT_ABI = [
  'function createOffer(address candidate, string role, uint256 salary, uint256 joiningDate, string degreeHash) public payable',
  'function acceptOffer(uint256 offerId) public',
  'function confirmJoining(uint256 offerId) public',
  'function reportBreach(address violator, string reason) public',
  'function bindIdentity(bytes32 identityHash) public',
  'function getReputation(address wallet) public view returns (uint256 breaches, bool frozen)',
];

let provider = null;
let signer = null;
let hireChainContract = null;

/* ── Provider Initialisation ──────────────────────────────── */
export const initializeProvider = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    hireChainContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return { provider, signer, hireChainContract };
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

/* ── Create Offer (with escrow floor enforcement) ─────────── */
export const createOffer = async (candidate, role, salary, joiningDate, degreeHash) => {
  const check = validateEscrow(salary);
  if (!check.valid) throw new Error(check.message);

  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');

  const tx = await hireChainContract.createOffer(
    candidate, role, salary, joiningDate, degreeHash,
  );
  await tx.wait();
  return tx.hash;
};

/* ── Accept Offer ─────────────────────────────────────────── */
export const acceptOffer = async (offerId) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  const tx = await hireChainContract.acceptOffer(offerId);
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
export const reportBreach = async (violator, reason) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  const tx = await hireChainContract.reportBreach(violator, reason);
  await tx.wait();
  return tx.hash;
};

/* ── Bind Aadhaar Identity (1 Human = 1 Wallet) ──────────── */
export const bindIdentity = async (aadhaarHash) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  const hashBytes = ethers.id(aadhaarHash); // one-way keccak256
  const tx = await hireChainContract.bindIdentity(hashBytes);
  await tx.wait();
  return tx.hash;
};

/* ── Get Reputation ───────────────────────────────────────── */
export const getReputation = async (wallet) => {
  if (!hireChainContract) await initializeProvider();
  if (!hireChainContract) throw new Error('Contract not initialised');
  const [breaches, frozen] = await hireChainContract.getReputation(wallet);
  return { breaches: Number(breaches), frozen };
};

export { ESCROW_FLOOR, USDC_ADDRESS };
