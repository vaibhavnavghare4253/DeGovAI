namespace AIDAOGovernance.API.DTOs;

public class CreateProposalRequest
{
    public required string WalletAddress { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string ProposalType { get; set; } // Treasury, Governance, Technical, Climate
    public decimal RequestedAmount { get; set; }
    public string? RecipientAddress { get; set; }
    public int VotingDurationHours { get; set; } = 168; // Default 7 days
    public decimal QuorumRequired { get; set; } = 10.00m;
    public decimal ApprovalThreshold { get; set; } = 50.00m;
}

public class ProposalResponse
{
    public int ProposalId { get; set; }
    public string? BlockchainProposalId { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string ProposalType { get; set; }
    public decimal RequestedAmount { get; set; }
    public string? RecipientAddress { get; set; }
    public required string Status { get; set; }
    public DateTime VotingStartTime { get; set; }
    public DateTime VotingEndTime { get; set; }
    public decimal QuorumRequired { get; set; }
    public decimal ApprovalThreshold { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExecutedAt { get; set; }
    
    // Submitter info
    public required string SubmitterAddress { get; set; }
    public string? SubmitterName { get; set; }
    public decimal? SubmitterReputation { get; set; }
    
    // Voting stats
    public decimal VotesFor { get; set; }
    public decimal VotesAgainst { get; set; }
    public decimal VotesAbstain { get; set; }
    public int TotalVoters { get; set; }
    public decimal TotalVotingPower { get; set; }
    public decimal AIVotingPower { get; set; }
    
    // AI Analysis
    public decimal? RiskScore { get; set; }
    public string? RecommendedAction { get; set; }
    public decimal? ConfidenceLevel { get; set; }
    
    // Time remaining
    public int HoursRemaining { get; set; }
}

public class ProposalListResponse
{
    public List<ProposalResponse> Proposals { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

public class ProposalDetailsResponse : ProposalResponse
{
    public List<VoteResponse> Votes { get; set; } = new();
    public List<AIAnalysisResponse> AIAnalyses { get; set; } = new();
    public List<TreasuryTransactionResponse> Transactions { get; set; } = new();
    public List<SimulationResponse> Simulations { get; set; } = new();
}

