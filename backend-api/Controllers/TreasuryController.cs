using Microsoft.AspNetCore.Mvc;
using AIDAOGovernance.API.Services;
using AIDAOGovernance.API.DTOs;

namespace AIDAOGovernance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TreasuryController : ControllerBase
{
    private readonly ITreasuryService _treasuryService;
    private readonly ILogger<TreasuryController> _logger;

    public TreasuryController(ITreasuryService treasuryService, ILogger<TreasuryController> logger)
    {
        _treasuryService = treasuryService;
        _logger = logger;
    }

    /// <summary>
    /// Get treasury status including balance and recent transactions
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult<TreasuryStatusResponse>> GetTreasuryStatus()
    {
        try
        {
            var result = await _treasuryService.GetTreasuryStatusAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving treasury status");
            return StatusCode(500, new { error = "Failed to retrieve treasury status", details = ex.Message });
        }
    }
}

