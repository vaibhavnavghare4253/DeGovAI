using AIDAOGovernance.API.DTOs;

namespace AIDAOGovernance.API.Services;

public interface ITreasuryService
{
    Task<TreasuryStatusResponse> GetTreasuryStatusAsync();
}

