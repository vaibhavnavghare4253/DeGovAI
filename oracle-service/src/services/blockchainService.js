const { ethers } = require('ethers');
const logger = require('../utils/logger');

class BlockchainService {
  constructor() {
    const rpcUrl = process.env.BLOCKCHAIN_RPC || 'http://localhost:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
    } else {
      logger.warn('No ORACLE_PRIVATE_KEY found, using default signer');
      this.wallet = null;
    }

    this.oracleAddress = process.env.AI_ORACLE_ADDRESS;
    this.oracleABI = [
      "function submitAnalysis(bytes32 requestId, uint256 proposalId, uint256 riskScore, uint256 fraudProbability, int256 sentimentScore, string memory recommendedAction, uint256 confidenceLevel, string memory modelUsed) external",
      "function requestAnalysis(uint256 proposalId) external returns (bytes32)",
      "function getLatestAnalysis(uint256 proposalId) external view returns (uint256, uint256, int256, string, uint256, string, uint256)",
      "event AnalysisRequested(bytes32 indexed requestId, uint256 indexed proposalId, address requester)",
      "event AnalysisFulfilled(bytes32 indexed requestId, uint256 indexed proposalId)"
    ];
  }

  /**
   * Get AI Oracle contract instance
   */
  getOracleContract() {
    if (!this.oracleAddress || this.oracleAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('AI Oracle address not configured');
    }

    const signer = this.wallet || this.provider.getSigner();
    return new ethers.Contract(this.oracleAddress, this.oracleABI, signer);
  }

  /**
   * Submit AI analysis to blockchain
   */
  async submitAnalysis(proposalId, analysisData) {
    try {
      const contract = this.getOracleContract();

      // Generate request ID
      const requestId = ethers.id(`proposal_${proposalId}_${Date.now()}`);

      // Convert scores to appropriate format
      const riskScore = Math.round(analysisData.risk_score || 0);
      const fraudProbability = Math.round(analysisData.fraud_probability || 0);
      const sentimentScore = Math.round(analysisData.sentiment_score || 0);
      const confidenceLevel = Math.round(analysisData.confidence_level || 0);

      logger.info(`Submitting analysis for proposal ${proposalId} to blockchain...`);

      // Submit transaction
      const tx = await contract.submitAnalysis(
        requestId,
        proposalId,
        riskScore,
        fraudProbability,
        sentimentScore,
        analysisData.recommended_action || 'Review',
        confidenceLevel,
        analysisData.model_used || 'AI-Hybrid'
      );

      logger.info(`Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      logger.info(`Transaction confirmed in block ${receipt.blockNumber}`);

      return receipt.hash;
    } catch (error) {
      logger.error('Error submitting analysis to blockchain:', error);
      
      // Return mock hash if blockchain is not available (for development)
      if (error.message.includes('not configured') || error.message.includes('could not detect network')) {
        logger.warn('Blockchain not available, returning mock transaction hash');
        return `0x${Math.random().toString(16).substr(2, 64)}`;
      }
      
      throw error;
    }
  }

  /**
   * Request analysis from blockchain
   */
  async requestAnalysis(proposalId) {
    try {
      const contract = this.getOracleContract();
      
      const tx = await contract.requestAnalysis(proposalId);
      const receipt = await tx.wait();

      // Extract requestId from event
      const event = receipt.events?.find(e => e.event === 'AnalysisRequested');
      const requestId = event?.args?.requestId;

      return {
        requestId,
        transactionHash: receipt.hash
      };
    } catch (error) {
      logger.error('Error requesting analysis from blockchain:', error);
      throw error;
    }
  }

  /**
   * Get latest analysis for a proposal
   */
  async getLatestAnalysis(proposalId) {
    try {
      const contract = this.getOracleContract();
      
      const result = await contract.getLatestAnalysis(proposalId);

      return {
        riskScore: Number(result[0]),
        fraudProbability: Number(result[1]),
        sentimentScore: Number(result[2]),
        recommendedAction: result[3],
        confidenceLevel: Number(result[4]),
        modelUsed: result[5],
        timestamp: Number(result[6])
      };
    } catch (error) {
      logger.error('Error getting analysis from blockchain:', error);
      throw error;
    }
  }

  /**
   * Listen for analysis requests
   */
  async listenForRequests(callback) {
    try {
      const contract = this.getOracleContract();

      contract.on('AnalysisRequested', (requestId, proposalId, requester, event) => {
        logger.info(`Analysis requested: Proposal ${proposalId}, RequestID ${requestId}`);
        callback({
          requestId,
          proposalId: Number(proposalId),
          requester,
          blockNumber: event.blockNumber
        });
      });

      logger.info('Listening for AnalysisRequested events...');
    } catch (error) {
      logger.error('Error setting up event listener:', error);
    }
  }
}

module.exports = BlockchainService;

