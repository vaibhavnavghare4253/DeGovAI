using Microsoft.AspNetCore.Mvc;
using AIDAOGovernance.API.Services;
using AIDAOGovernance.API.DTOs;

namespace AIDAOGovernance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIAnalysisController : ControllerBase
{
    private readonly IAIAnalysisService _aiAnalysisService;
    private readonly ILogger<AIAnalysisController> _logger;

    public AIAnalysisController(IAIAnalysisService aiAnalysisService, ILogger<AIAnalysisController> logger)
    {
        _aiAnalysisService = aiAnalysisService;
        _logger = logger;
    }

    /// <summary>
    /// Request AI analysis for a proposal
    /// </summary>
    [HttpPost("request")]
    public async Task<ActionResult<AIAnalysisResponse>> RequestAnalysis([FromBody] AIAnalysisRequest request)
    {
        try
        {
            _logger.LogInformation($"Requesting AI analysis for proposal {request.ProposalId}");
            var result = await _aiAnalysisService.RequestAIAnalysisAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error requesting AI analysis for proposal {request.ProposalId}");
            return StatusCode(500, new { error = "Failed to request AI analysis", details = ex.Message });
        }
    }

    /// <summary>
    /// Save AI analysis results (called by AI service)
    /// </summary>
    [HttpPost("save")]
    public async Task<ActionResult<AIAnalysisResponse>> SaveAnalysis([FromBody] SaveAIAnalysisRequest request)
    {
        try
        {
            _logger.LogInformation($"Saving AI analysis for proposal {request.ProposalId}");
            var result = await _aiAnalysisService.SaveAIAnalysisAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error saving AI analysis for proposal {request.ProposalId}");
            return StatusCode(500, new { error = "Failed to save AI analysis", details = ex.Message });
        }
    }
}

