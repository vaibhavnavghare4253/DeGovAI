const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Analyze a proposal using AI service
   */
  async analyzeProposal(proposalData) {
    try {
      logger.info(`Requesting AI analysis for proposal ${proposalData.proposalId}`);

      const response = await axios.post(`${this.aiServiceUrl}/api/analyze`, {
        proposal_id: proposalData.proposalId,
        title: proposalData.title,
        description: proposalData.description,
        proposal_type: proposalData.proposalType,
        requested_amount: proposalData.requestedAmount,
        submitter_address: proposalData.submitterAddress,
        analysis_type: 'Full'
      }, {
        timeout: 60000 // 60 second timeout
      });

      const analysis = response.data;
      logger.info(`AI analysis completed for proposal ${proposalData.proposalId}`);

      return analysis;
    } catch (error) {
      logger.error('Error calling AI service:', error.message);
      
      // Return default analysis if AI service is unavailable
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        logger.warn('AI service unavailable, returning default analysis');
        return this.getDefaultAnalysis(proposalData);
      }
      
      throw error;
    }
  }

  /**
   * Get risk assessment
   */
  async getRiskAssessment(proposalData) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/api/risk`, proposalData);
      return response.data;
    } catch (error) {
      logger.error('Error getting risk assessment:', error.message);
      throw error;
    }
  }

  /**
   * Get fraud detection
   */
  async getFraudDetection(proposalData) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/api/fraud`, proposalData);
      return response.data;
    } catch (error) {
      logger.error('Error getting fraud detection:', error.message);
      throw error;
    }
  }

  /**
   * Get sentiment analysis
   */
  async getSentimentAnalysis(proposalData) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/api/sentiment`, proposalData);
      return response.data;
    } catch (error) {
      logger.error('Error getting sentiment analysis:', error.message);
      throw error;
    }
  }

  /**
   * Check AI service health
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      logger.error('AI service health check failed:', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Get default analysis when AI service is unavailable
   */
  getDefaultAnalysis(proposalData) {
    const amount = proposalData.requestedAmount || 0;
    
    // Simple heuristic-based analysis
    let riskScore = 50;
    if (amount > 100000) riskScore = 75;
    else if (amount > 50000) riskScore = 60;
    else if (amount < 10000) riskScore = 30;

    return {
      proposal_id: proposalData.proposalId,
      risk_score: riskScore,
      fraud_probability: 20,
      sentiment_score: 0,
      recommended_action: 'Review',
      confidence_level: 50,
      key_insights: '• AI service unavailable, using default analysis\n• Manual review recommended',
      detailed_analysis: 'This is a fallback analysis provided because the AI service is currently unavailable. A comprehensive review by DAO members is recommended before voting.',
      model_used: 'Fallback-Heuristic',
      processing_time: 0
    };
  }
}

module.exports = AIService;

