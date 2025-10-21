using AIDAOGovernance.API.DTOs;

namespace AIDAOGovernance.API.Services;

public interface IAIAnalysisService
{
    Task<AIAnalysisResponse> SaveAIAnalysisAsync(SaveAIAnalysisRequest request);
    Task<AIAnalysisResponse> RequestAIAnalysisAsync(AIAnalysisRequest request);
}

