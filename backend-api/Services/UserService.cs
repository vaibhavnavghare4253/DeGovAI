using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Nethereum.Signer;

namespace AIDAOGovernance.API.Services;

public class UserService : IUserService
{
    private readonly IConfiguration _configuration;

    public UserService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> AuthenticateAsync(string walletAddress, string signature, string message)
    {
        // Verify wallet signature
        var signer = new EthereumMessageSigner();
        var recoveredAddress = signer.EncodeUTF8AndEcRecover(message, signature);

        if (!recoveredAddress.Equals(walletAddress, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Invalid signature");
        }

        // Generate JWT token
        var token = GenerateJwtToken(walletAddress);
        
        return await Task.FromResult(token);
    }

    private string GenerateJwtToken(string walletAddress)
    {
        var key = _configuration["Jwt:Key"] ?? "your-secret-key-min-32-characters-long-for-security";
        var issuer = _configuration["Jwt:Issuer"] ?? "AIDAOGovernance";
        var audience = _configuration["Jwt:Audience"] ?? "AIDAOGovernanceUsers";
        var expiryHours = int.Parse(_configuration["Jwt:ExpiryInHours"] ?? "24");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, walletAddress),
            new Claim("wallet_address", walletAddress),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

