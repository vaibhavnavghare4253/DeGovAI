using AIDAOGovernance.API.DTOs;

namespace AIDAOGovernance.API.Services;

public interface IProposalService
{
    Task<ProposalResponse> CreateProposalAsync(CreateProposalRequest request);
    Task<ProposalListResponse> GetAllProposalsAsync(string? status, string? proposalType, int pageNumber, int pageSize);
    Task<ProposalDetailsResponse> GetProposalDetailsAsync(int proposalId);
    Task<ProposalResponse> UpdateProposalStatusAsync(int proposalId, string? blockchainProposalId);
}

