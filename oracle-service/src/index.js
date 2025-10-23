const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const OracleService = require('./services/oracleService');
const BlockchainService = require('./services/blockchainService');
const AIService = require('./services/aiService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize services
const blockchainService = new BlockchainService();
const aiService = new AIService();
const oracleService = new OracleService(blockchainService, aiService);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI-DAO Oracle Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Request AI analysis for a proposal
app.post('/api/oracle/request-analysis', async (req, res) => {
  try {
    const { proposalId, title, description, proposalType, requestedAmount, submitterAddress } = req.body;
    
    logger.info(`Requesting AI analysis for proposal ${proposalId}`);
    
    const result = await oracleService.requestAnalysis({
      proposalId,
      title,
      description,
      proposalType,
      requestedAmount,
      submitterAddress
    });
    
    res.json({
      success: true,
      requestId: result.requestId,
      message: 'Analysis request submitted',
      data: result
    });
  } catch (error) {
    logger.error('Error requesting analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit AI analysis to blockchain
app.post('/api/oracle/submit-analysis', async (req, res) => {
  try {
    const {
      requestId,
      proposalId,
      riskScore,
      fraudProbability,
      sentimentScore,
      recommendedAction,
      confidenceLevel,
      modelUsed
    } = req.body;
    
    logger.info(`Submitting AI analysis for proposal ${proposalId}`);
    
    const result = await oracleService.submitAnalysis({
      requestId,
      proposalId,
      riskScore,
      fraudProbability,
      sentimentScore,
      recommendedAction,
      confidenceLevel,
      modelUsed
    });
    
    res.json({
      success: true,
      transactionHash: result.transactionHash,
      message: 'Analysis submitted to blockchain',
      data: result
    });
  } catch (error) {
    logger.error('Error submitting analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get analysis status
app.get('/api/oracle/analysis/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const status = await oracleService.getAnalysisStatus(requestId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting analysis status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Automated analysis workflow
app.post('/api/oracle/auto-analyze', async (req, res) => {
  try {
    const { proposalId, proposalData } = req.body;
    
    logger.info(`Starting automated analysis for proposal ${proposalId}`);
    
    // Step 1: Request AI analysis
    const aiResult = await aiService.analyzeProposal(proposalData);
    
    // Step 2: Submit to blockchain
    const blockchainResult = await blockchainService.submitAnalysis(
      proposalId,
      aiResult
    );
    
    // Step 3: Update backend database
    await oracleService.updateBackendDatabase(proposalId, aiResult);
    
    res.json({
      success: true,
      message: 'Automated analysis completed',
      aiAnalysis: aiResult,
      blockchainTx: blockchainResult.transactionHash
    });
  } catch (error) {
    logger.error('Error in automated analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Monitor new proposals (webhook endpoint)
app.post('/api/oracle/webhook/new-proposal', async (req, res) => {
  try {
    const proposal = req.body;
    
    logger.info(`New proposal detected: ${proposal.proposalId}`);
    
    // Automatically trigger analysis
    oracleService.processNewProposal(proposal).catch(err => {
      logger.error('Error processing new proposal:', err);
    });
    
    res.json({
      success: true,
      message: 'Proposal queued for analysis'
    });
  } catch (error) {
    logger.error('Error in webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Oracle Service started on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Blockchain RPC: ${process.env.BLOCKCHAIN_RPC || 'http://localhost:8545'}`);
  logger.info(`🤖 AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  
  // Start background monitoring
  oracleService.startMonitoring();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  oracleService.stopMonitoring();
  process.exit(0);
});

