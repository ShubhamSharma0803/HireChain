const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployments...\n");

  // 1. Deploy MockUSDC
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();

  // Bold Green output for addresses
  console.log("\x1b[1m\x1b[32mMockUSDC deployed to:\x1b[0m", mockUSDCAddress);

  // 2. Deploy HireChain, passing the MockUSDC address
  const HireChain = await hre.ethers.getContractFactory("HireChain");
  const hireChain = await HireChain.deploy(mockUSDCAddress);
  await hireChain.waitForDeployment();
  const hireChainAddress = await hireChain.getAddress();

  console.log("\x1b[1m\x1b[32mHireChain deployed to:\x1b[0m", hireChainAddress);

  // 3. Export ABI and address automatically for Sanyam's frontend
  console.log("\nExporting ABI to frontend/src/utils/ ...");
  
  const frontendUtilsDir = path.join(__dirname, "..", "..", "frontend", "src", "utils");
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(frontendUtilsDir)) {
    fs.mkdirSync(frontendUtilsDir, { recursive: true });
  }

  const hireChainArtifact = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "HireChain.sol",
    "HireChain.json"
  );
  
  const destFile = path.join(frontendUtilsDir, "HireChain.json");

  if (fs.existsSync(hireChainArtifact)) {
    const artifactData = JSON.parse(fs.readFileSync(hireChainArtifact, "utf8"));
    
    // Write just the ABI and the freshly deployed contract address for the frontend
    const exportData = {
      address: hireChainAddress,
      abi: artifactData.abi
    };

    fs.writeFileSync(destFile, JSON.stringify(exportData, null, 2));
    console.log(`\x1b[1mABI and Address exported successfully to:\x1b[0m ${destFile}\n`);
  } else {
    console.warn("\x1b[33mWarning: HireChain.json artifact absent. Did you compile the contracts?\x1b[0m");
  }

  console.log("Deployment completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
