-- AI-DAO Governance Database Schema
-- Author: Vaibhav Navghare
-- Database: DeGovAI
-- PostgreSQL Version

-- Note: Run this script while connected to the DeGovAI database
-- If database doesn't exist, create it first:
-- CREATE DATABASE "DeGovAI";

-- =============================================
-- Table: Users (DAO Members)
-- =============================================
CREATE TABLE IF NOT EXISTS Users (
    UserId SERIAL PRIMARY KEY,
    WalletAddress VARCHAR(42) NOT NULL UNIQUE,
    Username VARCHAR(100),
    Email VARCHAR(255),
    TokenBalance DECIMAL(18, 8) DEFAULT 0,
    DelegatedToAI BOOLEAN DEFAULT FALSE,
    ReputationScore DECIMAL(10, 2) DEFAULT 0,
    JoinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastActiveAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_Users_WalletAddress ON Users(WalletAddress);
CREATE INDEX IF NOT EXISTS IX_Users_IsActive ON Users(IsActive);

-- =============================================
-- Table: Proposals
-- =============================================
CREATE TABLE IF NOT EXISTS Proposals (
    ProposalId SERIAL PRIMARY KEY,
    BlockchainProposalId VARCHAR(66), -- Transaction hash or proposal ID on-chain
    Title VARCHAR(500) NOT NULL,
    Description TEXT NOT NULL,
    ProposalType VARCHAR(50) NOT NULL, -- 'Treasury', 'Governance', 'Technical', 'Climate'
    RequestedAmount DECIMAL(18, 8) DEFAULT 0,
    RecipientAddress VARCHAR(42),
    SubmittedBy INT REFERENCES Users(UserId),
    Status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Active', 'Passed', 'Rejected', 'Executed'
    VotingStartTime TIMESTAMP,
    VotingEndTime TIMESTAMP,
    QuorumRequired DECIMAL(5, 2) DEFAULT 10.00, -- Percentage
    ApprovalThreshold DECIMAL(5, 2) DEFAULT 50.00, -- Percentage
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExecutedAt TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_Proposals_Status ON Proposals(Status);
CREATE INDEX IF NOT EXISTS IX_Proposals_ProposalType ON Proposals(ProposalType);
CREATE INDEX IF NOT EXISTS IX_Proposals_BlockchainProposalId ON Proposals(BlockchainProposalId);

-- =============================================
-- Table: Votes
-- =============================================
CREATE TABLE IF NOT EXISTS Votes (
    VoteId SERIAL PRIMARY KEY,
    ProposalId INT REFERENCES Proposals(ProposalId),
    VoterId INT REFERENCES Users(UserId),
    VoteType VARCHAR(20) NOT NULL, -- 'For', 'Against', 'Abstain'
    VotingPower DECIMAL(18, 8) NOT NULL,
    IsAIVote BOOLEAN DEFAULT FALSE,
    TransactionHash VARCHAR(66),
    Reason TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_Votes_ProposalId ON Votes(ProposalId);
CREATE INDEX IF NOT EXISTS IX_Votes_VoterId ON Votes(VoterId);
CREATE UNIQUE INDEX IF NOT EXISTS UQ_Votes_Proposal_Voter ON Votes(ProposalId, VoterId);

-- =============================================
-- Table: AIAnalysis
-- =============================================
CREATE TABLE IF NOT EXISTS AIAnalysis (
    AnalysisId SERIAL PRIMARY KEY,
    ProposalId INT REFERENCES Proposals(ProposalId),
    AnalysisType VARCHAR(50) NOT NULL, -- 'RiskAssessment', 'FraudDetection', 'ImpactSimulation'
    RiskScore DECIMAL(5, 2), -- 0-100
    FraudProbability DECIMAL(5, 2), -- 0-100
    SentimentScore DECIMAL(5, 2), -- -100 to +100
    RecommendedAction VARCHAR(50), -- 'Approve', 'Reject', 'Needs Review'
    ConfidenceLevel DECIMAL(5, 2), -- 0-100
    KeyInsights TEXT,
    DetailedAnalysis TEXT,
    ModelUsed VARCHAR(100), -- 'GPT-4', 'LocalLLaMA', 'Ensemble'
    ProcessingTime INT, -- milliseconds
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_AIAnalysis_ProposalId ON AIAnalysis(ProposalId);
CREATE INDEX IF NOT EXISTS IX_AIAnalysis_AnalysisType ON AIAnalysis(AnalysisType);

-- =============================================
-- Table: TreasuryTransactions
-- =============================================
CREATE TABLE IF NOT EXISTS TreasuryTransactions (
    TransactionId SERIAL PRIMARY KEY,
    ProposalId INT REFERENCES Proposals(ProposalId),
    TransactionHash VARCHAR(66) NOT NULL,
    TransactionType VARCHAR(50) NOT NULL, -- 'Deposit', 'Withdrawal', 'Allocation'
    Amount DECIMAL(18, 8) NOT NULL,
    FromAddress VARCHAR(42),
    ToAddress VARCHAR(42),
    Status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Failed'
    BlockNumber BIGINT,
    GasUsed BIGINT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ConfirmedAt TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_TreasuryTransactions_ProposalId ON TreasuryTransactions(ProposalId);
CREATE INDEX IF NOT EXISTS IX_TreasuryTransactions_TransactionHash ON TreasuryTransactions(TransactionHash);

-- =============================================
-- Table: GovernancePolicies
-- =============================================
CREATE TABLE IF NOT EXISTS GovernancePolicies (
    PolicyId SERIAL PRIMARY KEY,
    PolicyName VARCHAR(200) NOT NULL,
    PolicyType VARCHAR(50) NOT NULL, -- 'Voting', 'Treasury', 'AI_Behavior'
    PolicyRule TEXT NOT NULL, -- JSON or rule definition
    Priority INT DEFAULT 1,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_GovernancePolicies_PolicyType ON GovernancePolicies(PolicyType);
CREATE INDEX IF NOT EXISTS IX_GovernancePolicies_IsActive ON GovernancePolicies(IsActive);

-- =============================================
-- Table: AIAgentActions
-- =============================================
CREATE TABLE IF NOT EXISTS AIAgentActions (
    ActionId SERIAL PRIMARY KEY,
    ProposalId INT REFERENCES Proposals(ProposalId),
    AgentType VARCHAR(50) NOT NULL, -- 'AnalysisAgent', 'VotingAgent', 'FraudDetectionAgent'
    ActionTaken VARCHAR(100) NOT NULL,
    ActionDetails TEXT,
    PolicyApplied INT REFERENCES GovernancePolicies(PolicyId),
    Success BOOLEAN DEFAULT TRUE,
    ErrorMessage TEXT,
    ExecutionTime INT, -- milliseconds
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_AIAgentActions_ProposalId ON AIAgentActions(ProposalId);
CREATE INDEX IF NOT EXISTS IX_AIAgentActions_AgentType ON AIAgentActions(AgentType);

-- =============================================
-- Table: AuditLog
-- =============================================
CREATE TABLE IF NOT EXISTS AuditLog (
    LogId SERIAL PRIMARY KEY,
    EntityType VARCHAR(50) NOT NULL, -- 'Proposal', 'Vote', 'Transaction'
    EntityId INT NOT NULL,
    Action VARCHAR(100) NOT NULL,
    PerformedBy VARCHAR(42), -- Wallet address
    OldValue TEXT,
    NewValue TEXT,
    IpAddress VARCHAR(45),
    UserAgent VARCHAR(500),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_AuditLog_EntityType ON AuditLog(EntityType);
CREATE INDEX IF NOT EXISTS IX_AuditLog_CreatedAt ON AuditLog(CreatedAt);

-- =============================================
-- Table: SimulationResults
-- =============================================
CREATE TABLE IF NOT EXISTS SimulationResults (
    SimulationId SERIAL PRIMARY KEY,
    ProposalId INT REFERENCES Proposals(ProposalId),
    SimulationType VARCHAR(50) NOT NULL, -- 'OutcomePreview', 'RiskAssessment', 'ImpactAnalysis'
    PredictedOutcome VARCHAR(50), -- 'Pass', 'Fail', 'Uncertain'
    SuccessProbability DECIMAL(5, 2),
    EstimatedImpact TEXT,
    ScenariosTested INT,
    SimulationData TEXT, -- JSON with detailed results
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_SimulationResults_ProposalId ON SimulationResults(ProposalId);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
END $$;

