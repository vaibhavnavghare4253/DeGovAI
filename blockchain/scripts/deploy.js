const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting AI-DAO Governance System Deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // 1. Deploy Governance Token
  console.log("📝 Deploying GovernanceToken...");
  const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
  const token = await GovernanceToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ GovernanceToken deployed to:", tokenAddress, "\n");

  // 2. Deploy Treasury (temporary address, will update after Governor deployment)
  console.log("💰 Deploying DAOTreasury...");
  const Treasury = await hre.ethers.getContractFactory("DAOTreasury");
  const treasury = await Treasury.deploy(deployer.address); // Temporary governor
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ DAOTreasury deployed to:", treasuryAddress, "\n");

  // 3. Deploy Governor
  console.log("🏛️  Deploying DAOGovernor...");
  const Governor = await hre.ethers.getContractFactory("DAOGovernor");
  const governor = await Governor.deploy(tokenAddress, treasuryAddress);
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("✅ DAOGovernor deployed to:", governorAddress, "\n");

  // 4. Deploy AI Oracle
  console.log("🤖 Deploying AIOracle...");
  const AIOracle = await hre.ethers.getContractFactory("AIOracle");
  const aiOracle = await AIOracle.deploy();
  await aiOracle.waitForDeployment();
  const aiOracleAddress = await aiOracle.getAddress();
  console.log("✅ AIOracle deployed to:", aiOracleAddress, "\n");

  // 5. Setup roles and permissions
  console.log("🔧 Setting up roles and permissions...");
  
  // Grant GOVERNOR_ROLE to DAOGovernor in Treasury
  const GOVERNOR_ROLE = await treasury.GOVERNOR_ROLE();
  await treasury.grantRole(GOVERNOR_ROLE, governorAddress);
  console.log("✅ Granted GOVERNOR_ROLE to DAOGovernor in Treasury");

  // Add AI Oracle as AI Service
  await aiOracle.addAIService(deployer.address); // Deployer can submit analyses for testing
  console.log("✅ Added deployer as AI Service in AIOracle");

  // 6. Initial token distribution
  console.log("\n💵 Distributing initial tokens...");
  const initialAmount = hre.ethers.parseEther("1000"); // 1000 tokens
  await token.transfer(treasuryAddress, hre.ethers.parseEther("50000")); // 50k to treasury
  console.log("✅ Transferred 50,000 tokens to Treasury");

  // 7. Self-delegate for deployer (needed for voting)
  await token.delegate(deployer.address);
  console.log("✅ Deployer self-delegated voting power");

  // 8. Fund treasury with ETH
  console.log("\n💰 Funding Treasury with initial ETH...");
  const fundTx = await deployer.sendTransaction({
    to: treasuryAddress,
    value: hre.ethers.parseEther("10.0") // 10 ETH
  });
  await fundTx.wait();
  console.log("✅ Funded Treasury with 10 ETH");

  // Save deployment addresses
  const deployment = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      GovernanceToken: tokenAddress,
      DAOTreasury: treasuryAddress,
      DAOGovernor: governorAddress,
      AIOracle: aiOracleAddress
    }
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("\n📄 Deployment info saved to:", deploymentPath);

  // Save ABIs for frontend
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const frontendABIDir = path.join(__dirname, "../../frontend/src/contracts");
  
  if (!fs.existsSync(frontendABIDir)) {
    fs.mkdirSync(frontendABIDir, { recursive: true });
  }

  const contracts = [
    "GovernanceToken",
    "DAOTreasury", 
    "DAOGovernor",
    "AIOracle"
  ];

  contracts.forEach(contractName => {
    const artifactPath = path.join(artifactsDir, `${contractName}.sol/${contractName}.json`);
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      const abiPath = path.join(frontendABIDir, `${contractName}.json`);
      fs.writeFileSync(abiPath, JSON.stringify({
        address: deployment.contracts[contractName],
        abi: artifact.abi
      }, null, 2));
      console.log(`✅ Saved ${contractName} ABI to frontend`);
    }
  });

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   GovernanceToken:", tokenAddress);
  console.log("   DAOTreasury:    ", treasuryAddress);
  console.log("   DAOGovernor:    ", governorAddress);
  console.log("   AIOracle:       ", aiOracleAddress);
  console.log("\n💡 Next Steps:");
  console.log("   1. Update backend-api/appsettings.json with contract addresses");
  console.log("   2. Update ai-agents config with AIOracle address");
  console.log("   3. Register AI agents in DAOGovernor");
  console.log("   4. Start the full system with: docker-compose up");
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

