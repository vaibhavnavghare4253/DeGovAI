using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AIDAOGovernance.API.Services;
using AIDAOGovernance.API.DTOs;

namespace AIDAOGovernance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProposalsController : ControllerBase
{
    private readonly IProposalService _proposalService;
    private readonly ILogger<ProposalsController> _logger;

    public ProposalsController(IProposalService proposalService, ILogger<ProposalsController> logger)
    {
        _proposalService = proposalService;
        _logger = logger;
    }

    /// <summary>
    /// Get all proposals with optional filtering and pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ProposalListResponse>> GetAllProposals(
        [FromQuery] string? status = null,
        [FromQuery] string? proposalType = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var result = await _proposalService.GetAllProposalsAsync(status, proposalType, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving proposals");
            return StatusCode(500, new { error = "Failed to retrieve proposals", details = ex.Message });
        }
    }

    /// <summary>
    /// Get detailed information about a specific proposal
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProposalDetailsResponse>> GetProposalDetails(int id)
    {
        try
        {
            var result = await _proposalService.GetProposalDetailsAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving proposal {id}");
            return StatusCode(500, new { error = $"Failed to retrieve proposal {id}", details = ex.Message });
        }
    }

    /// <summary>
    /// Create a new proposal
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProposalResponse>> CreateProposal([FromBody] CreateProposalRequest request)
    {
        try
        {
            _logger.LogInformation($"Creating proposal: {request.Title}");
            var result = await _proposalService.CreateProposalAsync(request);
            return CreatedAtAction(nameof(GetProposalDetails), new { id = result.ProposalId }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating proposal");
            return StatusCode(500, new { error = "Failed to create proposal", details = ex.Message });
        }
    }

    /// <summary>
    /// Update proposal status
    /// </summary>
    [HttpPut("{id}/status")]
    public async Task<ActionResult<ProposalResponse>> UpdateProposalStatus(
        int id,
        [FromBody] UpdateStatusRequest request)
    {
        try
        {
            var result = await _proposalService.UpdateProposalStatusAsync(id, request.BlockchainProposalId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating proposal {id} status");
            return StatusCode(500, new { error = $"Failed to update proposal {id}", details = ex.Message });
        }
    }
}

public class UpdateStatusRequest
{
    public string? BlockchainProposalId { get; set; }
}

