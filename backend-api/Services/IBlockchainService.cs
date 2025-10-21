namespace AIDAOGovernance.API.Services;

public interface IBlockchainService
{
    Task<decimal> GetTokenBalanceAsync(string walletAddress);
    Task<string> GetProposalStateAsync(string proposalId);
}

