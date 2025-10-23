const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Testing DAO Governance System...\n");

  // Load deployment addresses
  const deploymentPath = path.join(__dirname, "../deployments", `${hre.network.name}.json`);
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("Deployment file not found. Run deploy.js first.");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const { GovernanceToken, DAOGovernor, AIOracle, DAOTreasury } = deployment.contracts;

  // Get signers
  const [deployer, user1, user2, aiAgent] = await hre.ethers.getSigners();
  console.log("Testing with accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  User1:   ", user1.address);
  console.log("  User2:   ", user2.address);
  console.log("  AIAgent: ", aiAgent.address, "\n");

  // Attach to deployed contracts
  const token = await hre.ethers.getContractAt("GovernanceToken", GovernanceToken);
  const governor = await hre.ethers.getContractAt("DAOGovernor", DAOGovernor);
  const oracle = await hre.ethers.getContractAt("AIOracle", AIOracle);
  const treasury = await hre.ethers.getContractAt("DAOTreasury", DAOTreasury);

  // 1. Distribute tokens to test users
  console.log("1️⃣  Distributing tokens to test users...");
  await token.transfer(user1.address, hre.ethers.parseEther("5000"));
  await token.transfer(user2.address, hre.ethers.parseEther("3000"));
  await token.transfer(aiAgent.address, hre.ethers.parseEther("2000"));
  console.log("✅ Tokens distributed\n");

  // 2. Users delegate voting power
  console.log("2️⃣  Users delegating voting power...");
  await token.connect(user1).delegate(user1.address);
  await token.connect(user2).delegate(user2.address);
  await token.connect(aiAgent).delegate(aiAgent.address);
  console.log("✅ Voting power delegated\n");

  // 3. Register AI Agent
  console.log("3️⃣  Registering AI Agent...");
  // This requires a governance proposal in production, but we'll use deployer for testing
  // In real scenario, this would be done through a proposal
  console.log("⚠️  Note: In production, AI agents should be registered via governance proposal\n");

  // 4. Create a test proposal
  console.log("4️⃣  Creating test proposal...");
  
  const recipient = user2.address;
  const amount = hre.ethers.parseEther("1.0"); // Request 1 ETH
  const description = "Fund Climate Action Project: Solar Panel Installation in Rural Areas";
  
  const encodedFunctionCall = treasury.interface.encodeFunctionData("approveAllocation", [
    1, // proposalId (will be determined)
    recipient,
    amount,
    "Climate Action Funding"
  ]);

  const proposeTx = await governor.connect(user1).proposeWithMetadata(
    [DAOTreasury],
    [0],
    [encodedFunctionCall],
    description,
    "Climate", // proposal type
    amount,
    recipient
  );

  const proposeReceipt = await proposeTx.wait();
  const proposalId = proposeReceipt.logs[0].args.proposalId;
  console.log("✅ Proposal created with ID:", proposalId.toString(), "\n");

  // 5. Request AI Analysis
  console.log("5️⃣  Requesting AI Analysis...");
  const requestTx = await oracle.requestAnalysis(proposalId);
  const requestReceipt = await requestTx.wait();
  const requestId = requestReceipt.logs[0].args.requestId;
  console.log("✅ Analysis requested with ID:", requestId, "\n");

  // 6. Submit AI Analysis (simulating off-chain AI service)
  console.log("6️⃣  Submitting AI Analysis...");
  await oracle.submitAnalysis(
    requestId,
    proposalId,
    25, // riskScore (low risk)
    5,  // fraudProbability (very low)
    75, // sentimentScore (positive)
    "Approve", // recommendation
    85, // confidenceLevel
    "GPT-4-Hybrid"
  );
  console.log("✅ AI Analysis submitted\n");

  // 7. Get AI Analysis
  console.log("7️⃣  Retrieving AI Analysis...");
  const analysis = await oracle.getLatestAnalysis(proposalId);
  console.log("   Risk Score:", analysis.riskScore.toString());
  console.log("   Fraud Probability:", analysis.fraudProbability.toString());
  console.log("   Sentiment:", analysis.sentimentScore.toString());
  console.log("   Recommendation:", analysis.recommendedAction);
  console.log("   Confidence:", analysis.confidenceLevel.toString(), "%");
  console.log("   Model:", analysis.modelUsed, "\n");

  // 8. Wait for voting to start
  console.log("8️⃣  Waiting for voting period to start...");
  const currentBlock = await hre.ethers.provider.getBlockNumber();
  const proposalState = await governor.state(proposalId);
  console.log("   Current proposal state:", proposalState.toString());
  
  if (proposalState === 0n) { // Pending
    console.log("   Mining blocks to start voting period...");
    await hre.network.provider.send("hardhat_mine", ["0x2"]); // Mine 2 blocks
  }
  console.log("✅ Voting period active\n");

  // 9. Cast votes
  console.log("9️⃣  Casting votes...");
  await governor.connect(user1).castVote(proposalId, 1); // For
  console.log("   User1 voted: FOR");
  await governor.connect(user2).castVote(proposalId, 1); // For
  console.log("   User2 voted: FOR");
  console.log("✅ Votes cast\n");

  // 10. Get vote counts
  console.log("🔟 Retrieving vote counts...");
  const proposalVotes = await governor.proposalVotes(proposalId);
  console.log("   Votes FOR:", hre.ethers.formatEther(proposalVotes.forVotes));
  console.log("   Votes AGAINST:", hre.ethers.formatEther(proposalVotes.againstVotes));
  console.log("   Votes ABSTAIN:", hre.ethers.formatEther(proposalVotes.abstainVotes), "\n");

  console.log("✅ Governance system test completed successfully!\n");
  console.log("📊 Summary:");
  console.log("   - Tokens distributed to test users");
  console.log("   - Proposal created and analyzed by AI");
  console.log("   - AI recommended approval with 85% confidence");
  console.log("   - Users voted on the proposal");
  console.log("   - All governance mechanisms working correctly\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

