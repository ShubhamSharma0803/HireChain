# HireChain

A decentralized recruitment trust layer using the Google Gemini API and Gemini Vision for AI-driven verification tasks.

## Project Scope

- **Blockchain**: Solidity 0.8.0+, Hardhat, and Ethers.js for escrow logic and a reputation engine.
- **Backend**: FastAPI (Python) using the `google-generativeai` SDK.
- **AI Verification**: Gemini Vision is utilized to analyze and verify GST certificates and Degree images for fraud.
- **Frontend**: Web application interface for companies and candidates.

## Logic Overview

- **Offer Creation**: Companies lock ETH escrow on offer creation.
- **Offer Acceptance**: Candidates lock ETH escrow on offer acceptance.
- **Reputation Score**: Calculated based on the formula: 
  `Reputation score = (Completions * 100) / (Completions + Breaches)`

## Directory Structure

- `/blockchain/`: Contains Smart Contracts, Hardhat configuration, and deployment scripts.
- `/backend/`: Contains the FastAPI application, Gemini integration, and database models.
- `/frontend/`: Contains the web interface.
