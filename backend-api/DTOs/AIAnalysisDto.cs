namespace AIDAOGovernance.API.DTOs;

public class AIAnalysisRequest
{
    public int ProposalId { get; set; }
    public required string AnalysisType { get; set; } // RiskAssessment, FraudDetection, ImpactSimulation
}

public class AIAnalysisResponse
{
    public int AnalysisId { get; set; }
    public int ProposalId { get; set; }
    public required string AnalysisType { get; set; }
    public decimal? RiskScore { get; set; }
    public decimal? FraudProbability { get; set; }
    public decimal? SentimentScore { get; set; }
    public string? RecommendedAction { get; set; }
    public decimal? ConfidenceLevel { get; set; }
    public string? KeyInsights { get; set; }
    public string? DetailedAnalysis { get; set; }
    public string? ModelUsed { get; set; }
    public int? ProcessingTime { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SaveAIAnalysisRequest
{
    public int ProposalId { get; set; }
    public required string AnalysisType { get; set; }
    public decimal? RiskScore { get; set; }
    public decimal? FraudProbability { get; set; }
    public decimal? SentimentScore { get; set; }
    public string? RecommendedAction { get; set; }
    public decimal? ConfidenceLevel { get; set; }
    public string? KeyInsights { get; set; }
    public string? DetailedAnalysis { get; set; }
    public string? ModelUsed { get; set; }
    public int? ProcessingTime { get; set; }
}

