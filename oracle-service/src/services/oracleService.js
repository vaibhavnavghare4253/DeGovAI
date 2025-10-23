const logger = require('../utils/logger');
const cron = require('node-cron');
const { v4: uuidv4 } = require('crypto').randomUUID ? require('crypto') : { randomUUID: () => uuidv4() };

class OracleService {
  constructor(blockchainService, aiService) {
    this.blockchainService = blockchainService;
    this.aiService = aiService;
    this.pendingRequests = new Map();
    this.monitoringTask = null;
  }

  /**
   * Request AI analysis for a proposal
   */
  async requestAnalysis(proposalData) {
    try {
      const requestId = this.generateRequestId();
      
      // Store request
      this.pendingRequests.set(requestId, {
        proposalId: proposalData.proposalId,
        status: 'pending',
        createdAt: new Date(),
        proposalData
      });

      // Request analysis from AI service
      const aiAnalysis = await this.aiService.analyzeProposal(proposalData);

      // Update request status
      this.pendingRequests.get(requestId).status = 'analyzed';
      this.pendingRequests.get(requestId).analysis = aiAnalysis;

      // Submit to blockchain
      const txHash = await this.blockchainService.submitAnalysis(
        proposalData.proposalId,
        aiAnalysis
      );

      this.pendingRequests.get(requestId).status = 'submitted';
      this.pendingRequests.get(requestId).transactionHash = txHash;

      logger.info(`Analysis completed for proposal ${proposalData.proposalId}: ${txHash}`);

      return {
        requestId,
        status: 'submitted',
        transactionHash: txHash,
        analysis: aiAnalysis
      };
    } catch (error) {
      logger.error('Error in requestAnalysis:', error);
      throw error;
    }
  }

  /**
   * Submit analysis results to blockchain
   */
  async submitAnalysis(analysisData) {
    try {
      const txHash = await this.blockchainService.submitAnalysis(
        analysisData.proposalId,
        analysisData
      );

      if (this.pendingRequests.has(analysisData.requestId)) {
        this.pendingRequests.get(analysisData.requestId).status = 'submitted';
        this.pendingRequests.get(analysisData.requestId).transactionHash = txHash;
      }

      return {
        transactionHash: txHash,
        status: 'submitted'
      };
    } catch (error) {
      logger.error('Error submitting analysis:', error);
      throw error;
    }
  }

  /**
   * Get analysis request status
   */
  async getAnalysisStatus(requestId) {
    if (!this.pendingRequests.has(requestId)) {
      throw new Error('Request ID not found');
    }

    return this.pendingRequests.get(requestId);
  }

  /**
   * Process new proposal automatically
   */
  async processNewProposal(proposal) {
    try {
      logger.info(`Auto-processing proposal ${proposal.proposalId}`);

      // Request AI analysis
      const aiAnalysis = await this.aiService.analyzeProposal({
        proposalId: proposal.proposalId,
        title: proposal.title,
        description: proposal.description,
        proposalType: proposal.proposalType || 'Governance',
        requestedAmount: proposal.requestedAmount || 0,
        submitterAddress: proposal.submitterAddress
      });

      // Submit to blockchain
      await this.blockchainService.submitAnalysis(proposal.proposalId, aiAnalysis);

      // Update backend database
      await this.updateBackendDatabase(proposal.proposalId, aiAnalysis);

      logger.info(`Completed auto-analysis for proposal ${proposal.proposalId}`);
    } catch (error) {
      logger.error(`Error auto-processing proposal ${proposal.proposalId}:`, error);
    }
  }

  /**
   * Update backend database with AI analysis
   */
  async updateBackendDatabase(proposalId, analysis) {
    try {
      const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000';
      const axios = require('axios');

      await axios.post(`${backendUrl}/api/aianalysis/save`, {
        proposalId,
        analysisType: 'Full',
        riskScore: analysis.risk_score,
        fraudProbability: analysis.fraud_probability,
        sentimentScore: analysis.sentiment_score,
        recommendedAction: analysis.recommended_action,
        confidenceLevel: analysis.confidence_level,
        keyInsights: analysis.key_insights,
        detailedAnalysis: analysis.detailed_analysis,
        modelUsed: analysis.model_used,
        processingTime: analysis.processing_time
      });

      logger.info(`Updated backend database for proposal ${proposalId}`);
    } catch (error) {
      logger.error('Error updating backend database:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Start monitoring for new proposals
   */
  startMonitoring() {
    logger.info('Starting proposal monitoring...');

    // Check for new proposals every 5 minutes
    this.monitoringTask = cron.schedule('*/5 * * * *', async () => {
      try {
        await this.checkForNewProposals();
      } catch (error) {
        logger.error('Error in monitoring task:', error);
      }
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringTask) {
      this.monitoringTask.stop();
      logger.info('Stopped proposal monitoring');
    }
  }

  /**
   * Check for new proposals that need analysis
   */
  async checkForNewProposals() {
    try {
      const axios = require('axios');
      const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000';

      // Get pending proposals
      const response = await axios.get(`${backendUrl}/api/proposals?status=Pending&pageSize=50`);
      const proposals = response.data.proposals || [];

      logger.info(`Found ${proposals.length} pending proposals`);

      // Process each proposal that doesn't have AI analysis yet
      for (const proposal of proposals) {
        if (!proposal.riskScore) {
          await this.processNewProposal(proposal);
          // Add delay to avoid overwhelming services
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      logger.error('Error checking for new proposals:', error);
    }
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = OracleService;

