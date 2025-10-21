using Microsoft.AspNetCore.Mvc;
using AIDAOGovernance.API.Services;
using AIDAOGovernance.API.DTOs;

namespace AIDAOGovernance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VotesController : ControllerBase
{
    private readonly IVoteService _voteService;
    private readonly ILogger<VotesController> _logger;

    public VotesController(IVoteService voteService, ILogger<VotesController> logger)
    {
        _voteService = voteService;
        _logger = logger;
    }

    /// <summary>
    /// Cast a vote on a proposal
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<VoteResponse>> CastVote([FromBody] CastVoteRequest request)
    {
        try
        {
            _logger.LogInformation($"Casting vote: {request.WalletAddress} on Proposal {request.ProposalId}");
            var result = await _voteService.CastVoteAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error casting vote");
            return StatusCode(500, new { error = "Failed to cast vote", details = ex.Message });
        }
    }
}

