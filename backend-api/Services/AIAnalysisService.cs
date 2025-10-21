using AIDAOGovernance.API.DTOs;
using Npgsql;
using System.Text;
using Newtonsoft.Json;

namespace AIDAOGovernance.API.Services;

public class AIAnalysisService : DatabaseService, IAIAnalysisService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public AIAnalysisService(IConfiguration configuration, IHttpClientFactory httpClientFactory) 
        : base(configuration) 
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<AIAnalysisResponse> SaveAIAnalysisAsync(SaveAIAnalysisRequest request)
    {
        var parameters = new[]
        {
            new NpgsqlParameter("@ProposalId", request.ProposalId),
            new NpgsqlParameter("@AnalysisType", request.AnalysisType),
            new NpgsqlParameter("@RiskScore", (object?)request.RiskScore ?? DBNull.Value),
            new NpgsqlParameter("@FraudProbability", (object?)request.FraudProbability ?? DBNull.Value),
            new NpgsqlParameter("@SentimentScore", (object?)request.SentimentScore ?? DBNull.Value),
            new NpgsqlParameter("@RecommendedAction", (object?)request.RecommendedAction ?? DBNull.Value),
            new NpgsqlParameter("@ConfidenceLevel", (object?)request.ConfidenceLevel ?? DBNull.Value),
            new NpgsqlParameter("@KeyInsights", (object?)request.KeyInsights ?? DBNull.Value),
            new NpgsqlParameter("@DetailedAnalysis", (object?)request.DetailedAnalysis ?? DBNull.Value),
            new NpgsqlParameter("@ModelUsed", (object?)request.ModelUsed ?? DBNull.Value),
            new NpgsqlParameter("@ProcessingTime", (object?)request.ProcessingTime ?? DBNull.Value)
        };

        var result = await ExecuteReaderAsync("sp_SaveAIAnalysis", parameters);

        if (result.Rows.Count == 0)
            throw new Exception("Failed to save AI analysis");

        return MapToAIAnalysisResponse(result.Rows[0]);
    }

    public async Task<AIAnalysisResponse> RequestAIAnalysisAsync(AIAnalysisRequest request)
    {
        // Call AI service to perform analysis
        var httpClient = _httpClientFactory.CreateClient("AIService");
        
        var requestData = new
        {
            proposal_id = request.ProposalId,
            analysis_type = request.AnalysisType
        };

        var content = new StringContent(
            JsonConvert.SerializeObject(requestData),
            Encoding.UTF8,
            "application/json"
        );

        var response = await httpClient.PostAsync("/api/analyze", content);
        
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"AI service returned error: {response.StatusCode}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var aiResult = JsonConvert.DeserializeObject<dynamic>(responseContent);

        // Save the analysis result
        var saveRequest = new SaveAIAnalysisRequest
        {
            ProposalId = request.ProposalId,
            AnalysisType = request.AnalysisType,
            RiskScore = aiResult?.risk_score,
            FraudProbability = aiResult?.fraud_probability,
            SentimentScore = aiResult?.sentiment_score,
            RecommendedAction = aiResult?.recommended_action,
            ConfidenceLevel = aiResult?.confidence_level,
            KeyInsights = aiResult?.key_insights?.ToString(),
            DetailedAnalysis = aiResult?.detailed_analysis?.ToString(),
            ModelUsed = aiResult?.model_used,
            ProcessingTime = aiResult?.processing_time
        };

        return await SaveAIAnalysisAsync(saveRequest);
    }

    private AIAnalysisResponse MapToAIAnalysisResponse(System.Data.DataRow row)
    {
        return new AIAnalysisResponse
        {
            AnalysisId = Convert.ToInt32(row["AnalysisId"]),
            ProposalId = Convert.ToInt32(row["ProposalId"]),
            AnalysisType = row["AnalysisType"].ToString() ?? "",
            RiskScore = row["RiskScore"] != DBNull.Value ? Convert.ToDecimal(row["RiskScore"]) : null,
            FraudProbability = row["FraudProbability"] != DBNull.Value ? Convert.ToDecimal(row["FraudProbability"]) : null,
            SentimentScore = row["SentimentScore"] != DBNull.Value ? Convert.ToDecimal(row["SentimentScore"]) : null,
            RecommendedAction = row["RecommendedAction"] as string,
            ConfidenceLevel = row["ConfidenceLevel"] != DBNull.Value ? Convert.ToDecimal(row["ConfidenceLevel"]) : null,
            KeyInsights = row["KeyInsights"] as string,
            DetailedAnalysis = row["DetailedAnalysis"] as string,
            ModelUsed = row["ModelUsed"] as string,
            ProcessingTime = row["ProcessingTime"] != DBNull.Value ? Convert.ToInt32(row["ProcessingTime"]) : null,
            CreatedAt = Convert.ToDateTime(row["CreatedAt"])
        };
    }
}

