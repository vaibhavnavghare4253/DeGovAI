// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "./DAOTreasury.sol";

/**
 * @title DAOGovernor
 * @dev Main governance contract with AI agent integration
 * @author Vaibhav Navghare
 */
contract DAOGovernor is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    DAOTreasury public treasury;
    
    // AI Agent delegation
    mapping(address => address) public aiDelegate;
    mapping(address => bool) public isAIAgent;
    
    // Proposal metadata
    struct ProposalMetadata {
        string proposalType; // "Treasury", "Governance", "Technical", "Climate"
        uint256 requestedAmount;
        address recipientAddress;
        uint256 aiRiskScore;
        string aiRecommendation;
    }
    
    mapping(uint256 => ProposalMetadata) public proposalMetadata;
    
    event AIAgentRegistered(address indexed agent);
    event AIAgentRemoved(address indexed agent);
    event DelegatedToAI(address indexed user, address indexed aiAgent);
    event DelegationRevoked(address indexed user, address indexed aiAgent);
    event AIAnalysisRecorded(uint256 indexed proposalId, uint256 riskScore, string recommendation);
    event ProposalExecutedWithAI(uint256 indexed proposalId, bool success);
    
    constructor(
        IVotes _token,
        address payable _treasury
    )
        Governor("AI DAO Governor")
        GovernorSettings(1, 50400, 0) // 1 block voting delay, 1 week voting period, 0 proposal threshold
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
    {
        treasury = DAOTreasury(_treasury);
    }
    
    /**
     * @dev Register an AI agent
     */
    function registerAIAgent(address agent) external onlyGovernance {
        require(agent != address(0), "Invalid agent address");
        isAIAgent[agent] = true;
        emit AIAgentRegistered(agent);
    }
    
    /**
     * @dev Remove an AI agent
     */
    function removeAIAgent(address agent) external onlyGovernance {
        isAIAgent[agent] = false;
        emit AIAgentRemoved(agent);
    }
    
    /**
     * @dev Delegate voting power to an AI agent
     */
    function delegateToAI(address aiAgent) external {
        require(isAIAgent[aiAgent], "Not a registered AI agent");
        require(aiDelegate[msg.sender] == address(0), "Already delegated");
        
        aiDelegate[msg.sender] = aiAgent;
        token.delegate(aiAgent);
        
        emit DelegatedToAI(msg.sender, aiAgent);
    }
    
    /**
     * @dev Revoke AI delegation
     */
    function revokeAIDelegation() external {
        require(aiDelegate[msg.sender] != address(0), "No delegation to revoke");
        
        address previousDelegate = aiDelegate[msg.sender];
        aiDelegate[msg.sender] = address(0);
        token.delegate(msg.sender);
        
        emit DelegationRevoked(msg.sender, previousDelegate);
    }
    
    /**
     * @dev Record AI analysis for a proposal
     */
    function recordAIAnalysis(
        uint256 proposalId,
        uint256 riskScore,
        string memory recommendation
    ) external {
        require(isAIAgent[msg.sender], "Only AI agents can record analysis");
        require(state(proposalId) == ProposalState.Active, "Proposal not active");
        
        proposalMetadata[proposalId].aiRiskScore = riskScore;
        proposalMetadata[proposalId].aiRecommendation = recommendation;
        
        emit AIAnalysisRecorded(proposalId, riskScore, recommendation);
    }
    
    /**
     * @dev Set proposal metadata
     */
    function setProposalMetadata(
        uint256 proposalId,
        string memory proposalType,
        uint256 requestedAmount,
        address recipientAddress
    ) external {
        require(state(proposalId) == ProposalState.Active, "Proposal not active");
        
        proposalMetadata[proposalId] = ProposalMetadata({
            proposalType: proposalType,
            requestedAmount: requestedAmount,
            recipientAddress: recipientAddress,
            aiRiskScore: 0,
            aiRecommendation: ""
        });
    }
    
    /**
     * @dev Execute proposal with AI assistance
     */
    function executeWithAI(uint256 proposalId) external {
        require(state(proposalId) == ProposalState.Succeeded, "Proposal not succeeded");
        
        ProposalMetadata memory metadata = proposalMetadata[proposalId];
        
        if (keccak256(bytes(metadata.proposalType)) == keccak256(bytes("Treasury"))) {
            // Execute treasury allocation
            treasury.approveAllocation(
                proposalId,
                metadata.recipientAddress,
                metadata.requestedAmount,
                metadata.aiRecommendation
            );
        }
        
        // Execute the proposal
        _execute(proposalId, new address[](0), new uint256[](0), new bytes[](0), keccak256(""));
        
        emit ProposalExecutedWithAI(proposalId, true);
    }
    
    // Required overrides
    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }
    
    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }
    
    function quorum(uint256 blockNumber) 
        public 
        view 
        override(IGovernor, GovernorVotesQuorumFraction) 
        returns (uint256) 
    {
        return super.quorum(blockNumber);
    }
    
    function proposalThreshold() 
        public 
        view 
        override(Governor, GovernorSettings) 
        returns (uint256) 
    {
        return super.proposalThreshold();
    }
}