using AIDAOGovernance.API.DTOs;

namespace AIDAOGovernance.API.Services;

public interface IVoteService
{
    Task<VoteResponse> CastVoteAsync(CastVoteRequest request);
}

