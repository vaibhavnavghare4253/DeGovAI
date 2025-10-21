namespace AIDAOGovernance.API.Services;

public interface IUserService
{
    Task<string> AuthenticateAsync(string walletAddress, string signature, string message);
}

