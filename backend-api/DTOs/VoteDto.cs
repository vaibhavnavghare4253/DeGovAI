namespace AIDAOGovernance.API.DTOs;

public class CastVoteRequest
{
    public int ProposalId { get; set; }
    public required string WalletAddress { get; set; }
    public required string VoteType { get; set; } // For, Against, Abstain
    public decimal VotingPower { get; set; }
    public bool IsAIVote { get; set; } = false;
    public string? TransactionHash { get; set; }
    public string? Reason { get; set; }
}

public class VoteResponse
{
    public int VoteId { get; set; }
    public int ProposalId { get; set; }
    public required string VoteType { get; set; }
    public decimal VotingPower { get; set; }
    public bool IsAIVote { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string WalletAddress { get; set; }
    public string? Username { get; set; }
}

