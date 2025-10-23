// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AIOracle
 * @dev Bridge contract between off-chain AI agents and on-chain governance
 * @author Vaibhav Navghare
 */
contract AIOracle is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant AI_SERVICE_ROLE = keccak256("AI_SERVICE_ROLE");
    
    struct AIAnalysis {
        uint256 proposalId;
        uint256 riskScore; // 0-100
        uint256 fraudProbability; // 0-100
        int256 sentimentScore; // -100 to +100
        string recommendedAction; // "Approve", "Reject", "Review"
        uint256 confidenceLevel; // 0-100
        string modelUsed;
        uint256 timestamp;
        address analyzer;
    }
    
    mapping(uint256 => AIAnalysis[]) public proposalAnalyses;
    mapping(uint256 => uint256) public analysisCount;
    
    // Request tracking
    struct AnalysisRequest {
        uint256 proposalId;
        address requester;
        uint256 requestedAt;
        bool fulfilled;
        uint256 fulfilledAt;
    }
    
    mapping(bytes32 => AnalysisRequest) public requests;
    uint256 public requestCounter;
    
    event AnalysisRequested(bytes32 indexed requestId, uint256 indexed proposalId, address requester);
    event AnalysisFulfilled(bytes32 indexed requestId, uint256 indexed proposalId);
    event AIAnalysisRecorded(uint256 indexed proposalId, uint256 riskScore, string recommendation);
    event OracleUpdated(address indexed oracle, bool status);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }
    
    /**
     * @dev Request AI analysis for a proposal
     */
    function requestAnalysis(uint256 proposalId) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(proposalId, msg.sender, requestCounter++));
        
        requests[requestId] = AnalysisRequest({
            proposalId: proposalId,
            requester: msg.sender,
            requestedAt: block.timestamp,
            fulfilled: false,
            fulfilledAt: 0
        });
        
        emit AnalysisRequested(requestId, proposalId, msg.sender);
        
        return requestId;
    }
    
    /**
     * @dev Submit AI analysis (called by off-chain AI service)
     */
    function submitAnalysis(
        bytes32 requestId,
        uint256 proposalId,
        uint256 riskScore,
        uint256 fraudProbability,
        int256 sentimentScore,
        string memory recommendedAction,
        uint256 confidenceLevel,
        string memory modelUsed
    ) external onlyRole(AI_SERVICE_ROLE) {
        require(!requests[requestId].fulfilled, "Request already fulfilled");
        require(requests[requestId].proposalId == proposalId, "Proposal ID mismatch");
        require(riskScore <= 100, "Invalid risk score");
        require(fraudProbability <= 100, "Invalid fraud probability");
        require(sentimentScore >= -100 && sentimentScore <= 100, "Invalid sentiment score");
        require(confidenceLevel <= 100, "Invalid confidence level");
        
        AIAnalysis memory analysis = AIAnalysis({
            proposalId: proposalId,
            riskScore: riskScore,
            fraudProbability: fraudProbability,
            sentimentScore: sentimentScore,
            recommendedAction: recommendedAction,
            confidenceLevel: confidenceLevel,
            modelUsed: modelUsed,
            timestamp: block.timestamp,
            analyzer: msg.sender
        });
        
        proposalAnalyses[proposalId].push(analysis);
        analysisCount[proposalId]++;
        
        requests[requestId].fulfilled = true;
        requests[requestId].fulfilledAt = block.timestamp;
        
        emit AnalysisFulfilled(requestId, proposalId);
        emit AIAnalysisRecorded(proposalId, riskScore, recommendedAction);
    }
    
    /**
     * @dev Get latest analysis for a proposal
     */
    function getLatestAnalysis(uint256 proposalId) 
        external 
        view 
        returns (
            uint256 riskScore,
            uint256 fraudProbability,
            int256 sentimentScore,
            string memory recommendedAction,
            uint256 confidenceLevel,
            string memory modelUsed,
            uint256 timestamp
        ) 
    {
        require(analysisCount[proposalId] > 0, "No analysis available");
        
        AIAnalysis memory latest = proposalAnalyses[proposalId][analysisCount[proposalId] - 1];
        
        return (
            latest.riskScore,
            latest.fraudProbability,
            latest.sentimentScore,
            latest.recommendedAction,
            latest.confidenceLevel,
            latest.modelUsed,
            latest.timestamp
        );
    }
    
    /**
     * @dev Get all analyses for a proposal
     */
    function getAllAnalyses(uint256 proposalId) 
        external 
        view 
        returns (AIAnalysis[] memory) 
    {
        return proposalAnalyses[proposalId];
    }
    
    /**
     * @dev Get aggregated risk score (average of all analyses)
     */
    function getAggregatedRisk(uint256 proposalId) external view returns (uint256) {
        uint256 count = analysisCount[proposalId];
        require(count > 0, "No analysis available");
        
        uint256 totalRisk = 0;
        for (uint256 i = 0; i < count; i++) {
            totalRisk += proposalAnalyses[proposalId][i].riskScore;
        }
        
        return totalRisk / count;
    }
    
    /**
     * @dev Add AI service oracle
     */
    function addAIService(address aiService) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(AI_SERVICE_ROLE, aiService);
        emit OracleUpdated(aiService, true);
    }
    
    /**
     * @dev Remove AI service oracle
     */
    function removeAIService(address aiService) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(AI_SERVICE_ROLE, aiService);
        emit OracleUpdated(aiService, false);
    }
    
    /**
     * @dev Check if address is authorized AI service
     */
    function isAIService(address account) external view returns (bool) {
        return hasRole(AI_SERVICE_ROLE, account);
    }
}

