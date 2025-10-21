namespace AIDAOGovernance.API.DTOs;

public class TreasuryStatusResponse
{
    public decimal TotalDeposits { get; set; }
    public decimal TotalWithdrawals { get; set; }
    public decimal TotalAllocations { get; set; }
    public decimal CurrentBalance { get; set; }
    public int TotalTransactions { get; set; }
    public List<TreasuryTransactionResponse> RecentTransactions { get; set; } = new();
    public List<AllocationByTypeResponse> AllocationsByType { get; set; } = new();
}

public class TreasuryTransactionResponse
{
    public int TransactionId { get; set; }
    public required string TransactionHash { get; set; }
    public required string TransactionType { get; set; }
    public decimal Amount { get; set; }
    public string? FromAddress { get; set; }
    public string? ToAddress { get; set; }
    public required string Status { get; set; }
    public long? BlockNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public string? RelatedProposal { get; set; }
}

public class AllocationByTypeResponse
{
    public required string ProposalType { get; set; }
    public int ProposalCount { get; set; }
    public decimal TotalAllocated { get; set; }
    public decimal AverageAmount { get; set; }
}

public class SimulationResponse
{
    public int SimulationId { get; set; }
    public int ProposalId { get; set; }
    public required string SimulationType { get; set; }
    public string? PredictedOutcome { get; set; }
    public decimal? SuccessProbability { get; set; }
    public string? EstimatedImpact { get; set; }
    public int ScenariosTested { get; set; }
    public string? SimulationData { get; set; }
    public DateTime CreatedAt { get; set; }
}

