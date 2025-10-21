using Nethereum.Web3;
using Nethereum.Contracts;

namespace AIDAOGovernance.API.Services;

public class BlockchainService : IBlockchainService
{
    private readonly IConfiguration _configuration;
    private readonly Web3 _web3;

    public BlockchainService(IConfiguration configuration)
    {
        _configuration = configuration;
        var rpcUrl = _configuration["Blockchain:RpcUrl"] ?? "http://localhost:8545";
        _web3 = new Web3(rpcUrl);
    }

    public async Task<decimal> GetTokenBalanceAsync(string walletAddress)
    {
        try
        {
            var tokenAddress = _configuration["Blockchain:Contracts:GovernanceToken"];
            if (string.IsNullOrEmpty(tokenAddress) || tokenAddress == "0x0000000000000000000000000000000000000000")
            {
                return 0; // Contract not deployed yet
            }

            // ERC20 balanceOf function
            var contract = _web3.Eth.GetContract(
                "[{\"constant\":true,\"inputs\":[{\"name\":\"account\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}]",
                tokenAddress
            );

            var balanceFunction = contract.GetFunction("balanceOf");
            var balance = await balanceFunction.CallAsync<System.Numerics.BigInteger>(walletAddress);

            // Convert from wei to tokens (assuming 18 decimals)
            return (decimal)balance / (decimal)Math.Pow(10, 18);
        }
        catch
        {
            return 0; // Return 0 if blockchain not available
        }
    }

    public async Task<string> GetProposalStateAsync(string proposalId)
    {
        try
        {
            var governorAddress = _configuration["Blockchain:Contracts:DAOGovernor"];
            if (string.IsNullOrEmpty(governorAddress) || governorAddress == "0x0000000000000000000000000000000000000000")
            {
                return "Unknown"; // Contract not deployed yet
            }

            // This is simplified - you'd need the full ABI in production
            return await Task.FromResult("Active"); // Placeholder
        }
        catch
        {
            return "Unknown";
        }
    }
}

