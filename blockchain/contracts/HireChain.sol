// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20 - Minimal interface for stablecoin (USDC) escrow operations
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title HireChain
 * @notice Decentralized recruitment trust layer with identity binding,
 *         stable escrow, reputation tracking, and recovery logic.
 * @dev    Uses an ERC-20 stablecoin (e.g. USDC) instead of native ETH
 *         to eliminate volatility risk for both companies and candidates.
 */
contract HireChain {

    // -----------------------------------------------------------------------
    //  State Variables
    // -----------------------------------------------------------------------

    address public owner;
    IERC20  public escrowToken;                    // USDC / mock stablecoin

    uint256 public constant MINIMUM_ESCROW = 5000; // ₹5,000 floor (in token's smallest unit)
    uint256 public constant RECOVERY_PERIOD = 180 days;

    uint256 public nextOfferId;

    // -----------------------------------------------------------------------
    //  Enums
    // -----------------------------------------------------------------------

    enum OfferStatus {
        Created,        // Company has locked escrow
        Accepted,       // Candidate has locked their portion
        Completed,      // Dual confirmation – funds released
        Breached        // One party breached – funds sent to victim
    }

    // -----------------------------------------------------------------------
    //  Structs
    // -----------------------------------------------------------------------

    struct Offer {
        address company;
        address candidate;
        string  jobTitle;
        uint256 salary;              // escrow amount in stablecoin units
        uint256 joiningDate;         // UNIX timestamp
        OfferStatus status;
        uint256 companyEscrow;       // company's locked amount
        uint256 candidateEscrow;     // candidate's locked amount
        uint256 lastActivityTime;    // for 180-day recovery window
        bool    companyConfirmed;
        bool    candidateConfirmed;
    }

    // -----------------------------------------------------------------------
    //  Mappings
    // -----------------------------------------------------------------------

    // Identity Binding – one Aadhaar hash ↔ one wallet (bijective)
    mapping(bytes32 => address) public aadhaarToWallet;
    mapping(address => bytes32) public walletToAadhaar;

    // Offers
    mapping(uint256 => Offer) public offers;

    // Reputation Tracking
    mapping(address => uint256) public completionCount;
    mapping(address => uint256) public breachCount;

    // -----------------------------------------------------------------------
    //  Events
    // -----------------------------------------------------------------------

    event AadhaarBound(bytes32 indexed aadhaarHash, address indexed wallet);
    event OfferCreated(uint256 indexed offerId, address indexed company, string jobTitle, uint256 salary);
    event OfferAccepted(uint256 indexed offerId, address indexed candidate);
    event JoiningConfirmed(uint256 indexed offerId, address indexed confirmer);
    event OfferCompleted(uint256 indexed offerId);
    event BreachReported(uint256 indexed offerId, address indexed reporter, address indexed offender);
    event FundsRecovered(uint256 indexed offerId, address indexed recoverer, uint256 amount);

    // -----------------------------------------------------------------------
    //  Modifiers
    // -----------------------------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "HireChain: caller is not the owner");
        _;
    }

    // -----------------------------------------------------------------------
    //  Constructor
    // -----------------------------------------------------------------------

    constructor(address _escrowToken) {
        require(_escrowToken != address(0), "HireChain: token address cannot be zero");
        owner = msg.sender;
        escrowToken = IERC20(_escrowToken);
    }

    // -----------------------------------------------------------------------
    //  1. Identity Binding
    // -----------------------------------------------------------------------

    /**
     * @notice Bind an Aadhaar hash to the caller's wallet. One hash → one wallet only.
     * @param  _aadhaarHash  keccak256 hash of the candidate's Aadhaar number.
     */
    function bindAadhaar(bytes32 _aadhaarHash) external {
        require(_aadhaarHash != bytes32(0), "HireChain: invalid Aadhaar hash");
        require(aadhaarToWallet[_aadhaarHash] == address(0), "HireChain: Aadhaar already bound to a wallet");
        require(walletToAadhaar[msg.sender] == bytes32(0), "HireChain: wallet already bound to an Aadhaar");

        aadhaarToWallet[_aadhaarHash] = msg.sender;
        walletToAadhaar[msg.sender]   = _aadhaarHash;

        emit AadhaarBound(_aadhaarHash, msg.sender);
    }

    // -----------------------------------------------------------------------
    //  2. Offer Management
    // -----------------------------------------------------------------------

    /**
     * @notice Company creates an offer and locks escrow in stablecoin.
     * @dev    Reverts if escrow < MINIMUM_ESCROW (₹5,000 floor).
     *         The caller must have approved this contract for `_escrowAmount` tokens first.
     */
    function createOffer(
        address _candidate,
        string  calldata _jobTitle,
        uint256 _salary,
        uint256 _joiningDate,
        uint256 _escrowAmount
    ) external returns (uint256 offerId) {
        require(_candidate != address(0), "HireChain: invalid candidate address");
        require(_candidate != msg.sender, "HireChain: company cannot be the candidate");
        require(_escrowAmount >= MINIMUM_ESCROW, "HireChain: escrow below the minimum floor of 5000");
        require(_joiningDate > block.timestamp, "HireChain: joining date must be in the future");

        // Transfer stablecoin escrow from company to this contract
        bool success = escrowToken.transferFrom(msg.sender, address(this), _escrowAmount);
        require(success, "HireChain: escrow token transfer failed");

        offerId = nextOfferId++;

        offers[offerId] = Offer({
            company:            msg.sender,
            candidate:          _candidate,
            jobTitle:           _jobTitle,
            salary:             _salary,
            joiningDate:        _joiningDate,
            status:             OfferStatus.Created,
            companyEscrow:      _escrowAmount,
            candidateEscrow:    0,
            lastActivityTime:   block.timestamp,
            companyConfirmed:   false,
            candidateConfirmed: false
        });

        emit OfferCreated(offerId, msg.sender, _jobTitle, _salary);
    }

    /**
     * @notice Candidate accepts the offer and locks their portion of escrow.
     */
    function acceptOffer(uint256 _offerId, uint256 _escrowAmount) external {
        Offer storage offer = offers[_offerId];

        require(offer.company != address(0), "HireChain: offer does not exist");
        require(offer.status == OfferStatus.Created, "HireChain: offer is not in Created status");
        require(msg.sender == offer.candidate, "HireChain: only the designated candidate can accept");
        require(_escrowAmount >= MINIMUM_ESCROW, "HireChain: candidate escrow below minimum floor");

        bool success = escrowToken.transferFrom(msg.sender, address(this), _escrowAmount);
        require(success, "HireChain: escrow token transfer failed");

        offer.candidateEscrow  = _escrowAmount;
        offer.status           = OfferStatus.Accepted;
        offer.lastActivityTime = block.timestamp;

        emit OfferAccepted(_offerId, msg.sender);
    }

    // -----------------------------------------------------------------------
    //  3. Dual Confirmation – Joining & Completion
    // -----------------------------------------------------------------------

    /**
     * @notice Either party confirms successful joining. When both confirm,
     *         escrow is released back to each depositor and completion counts update.
     */
    function confirmJoining(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];

        require(offer.status == OfferStatus.Accepted, "HireChain: offer must be in Accepted status");
        require(
            msg.sender == offer.company || msg.sender == offer.candidate,
            "HireChain: caller is not part of this offer"
        );

        if (msg.sender == offer.company) {
            require(!offer.companyConfirmed, "HireChain: company already confirmed");
            offer.companyConfirmed = true;
        } else {
            require(!offer.candidateConfirmed, "HireChain: candidate already confirmed");
            offer.candidateConfirmed = true;
        }

        offer.lastActivityTime = block.timestamp;
        emit JoiningConfirmed(_offerId, msg.sender);

        // If both parties have confirmed → release funds
        if (offer.companyConfirmed && offer.candidateConfirmed) {
            offer.status = OfferStatus.Completed;

            // Return escrow to each party
            if (offer.companyEscrow > 0) {
                escrowToken.transfer(offer.company, offer.companyEscrow);
            }
            if (offer.candidateEscrow > 0) {
                escrowToken.transfer(offer.candidate, offer.candidateEscrow);
            }

            // Update reputation
            completionCount[offer.company]   += 1;
            completionCount[offer.candidate] += 1;

            emit OfferCompleted(_offerId);
        }
    }

    // -----------------------------------------------------------------------
    //  4. Breach Reporting
    // -----------------------------------------------------------------------

    /**
     * @notice Report a breach. The total locked escrow is transferred to the
     *         reporting party (the "victim"), and the offender's breach count increments.
     * @dev    Only company or candidate of the offer can report.
     */
    function reportBreach(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];

        require(
            offer.status == OfferStatus.Created || offer.status == OfferStatus.Accepted,
            "HireChain: offer already finalized"
        );
        require(
            msg.sender == offer.company || msg.sender == offer.candidate,
            "HireChain: caller is not part of this offer"
        );

        offer.status           = OfferStatus.Breached;
        offer.lastActivityTime = block.timestamp;

        uint256 totalEscrow = offer.companyEscrow + offer.candidateEscrow;
        address victim      = msg.sender;
        address offender    = (msg.sender == offer.company) ? offer.candidate : offer.company;

        // Transfer total escrow to the victim
        if (totalEscrow > 0) {
            escrowToken.transfer(victim, totalEscrow);
        }

        // Update reputation
        breachCount[offender] += 1;

        emit BreachReported(_offerId, victim, offender);
    }

    // -----------------------------------------------------------------------
    //  5. Recovery Logic – 180-day inactivity reclaim
    // -----------------------------------------------------------------------

    /**
     * @notice Allows the original depositor to reclaim their escrow if the offer
     *         has been inactive for 180 days (stuck in Created or Accepted status).
     */
    function recoverFunds(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];

        require(
            offer.status == OfferStatus.Created || offer.status == OfferStatus.Accepted,
            "HireChain: offer already finalized"
        );
        require(
            msg.sender == offer.company || msg.sender == offer.candidate,
            "HireChain: caller is not part of this offer"
        );
        require(
            block.timestamp >= offer.lastActivityTime + RECOVERY_PERIOD,
            "HireChain: recovery period of 180 days has not elapsed"
        );

        uint256 recoveredAmount;

        if (msg.sender == offer.company && offer.companyEscrow > 0) {
            recoveredAmount = offer.companyEscrow;
            offer.companyEscrow = 0;
            escrowToken.transfer(msg.sender, recoveredAmount);
        } else if (msg.sender == offer.candidate && offer.candidateEscrow > 0) {
            recoveredAmount = offer.candidateEscrow;
            offer.candidateEscrow = 0;
            escrowToken.transfer(msg.sender, recoveredAmount);
        } else {
            revert("HireChain: no funds to recover for caller");
        }

        // If both escrows are now zero, mark as completed
        if (offer.companyEscrow == 0 && offer.candidateEscrow == 0) {
            offer.status = OfferStatus.Completed;
        }

        emit FundsRecovered(_offerId, msg.sender, recoveredAmount);
    }

    // -----------------------------------------------------------------------
    //  6. View Helpers
    // -----------------------------------------------------------------------

    /**
     * @notice Compute reputation score: (completions * 100) / (completions + breaches)
     * @return score  0–100 trust score, or 0 if no history.
     */
    function getReputationScore(address _user) external view returns (uint256 score) {
        uint256 completions = completionCount[_user];
        uint256 breaches    = breachCount[_user];

        if (completions + breaches == 0) {
            return 0;
        }

        score = (completions * 100) / (completions + breaches);
    }

    /**
     * @notice Get the full details of an offer.
     */
    function getOffer(uint256 _offerId) external view returns (
        address company,
        address candidate,
        string memory jobTitle,
        uint256 salary,
        uint256 joiningDate,
        OfferStatus status,
        uint256 companyEscrow,
        uint256 candidateEscrow,
        bool companyConfirmed,
        bool candidateConfirmed
    ) {
        Offer storage o = offers[_offerId];
        return (
            o.company,
            o.candidate,
            o.jobTitle,
            o.salary,
            o.joiningDate,
            o.status,
            o.companyEscrow,
            o.candidateEscrow,
            o.companyConfirmed,
            o.candidateConfirmed
        );
    }
}
