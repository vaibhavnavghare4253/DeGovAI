using Microsoft.AspNetCore.Mvc;
using AIDAOGovernance.API.Services;

namespace AIDAOGovernance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IUserService userService, ILogger<AuthController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate user with wallet signature
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] AuthRequest request)
    {
        try
        {
            var token = await _userService.AuthenticateAsync(
                request.WalletAddress,
                request.Signature,
                request.Message
            );

            return Ok(new AuthResponse
            {
                Token = token,
                WalletAddress = request.WalletAddress
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning($"Failed authentication attempt: {request.WalletAddress}");
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during authentication");
            return StatusCode(500, new { error = "Authentication failed", details = ex.Message });
        }
    }

    /// <summary>
    /// Get a message to sign for authentication
    /// </summary>
    [HttpGet("message")]
    public ActionResult<MessageResponse> GetMessage()
    {
        var nonce = Guid.NewGuid().ToString();
        var message = $"Sign this message to authenticate with AI-DAO Governance.\n\nNonce: {nonce}";

        return Ok(new MessageResponse
        {
            Message = message,
            Nonce = nonce
        });
    }
}

public class AuthRequest
{
    public required string WalletAddress { get; set; }
    public required string Signature { get; set; }
    public required string Message { get; set; }
}

public class AuthResponse
{
    public required string Token { get; set; }
    public required string WalletAddress { get; set; }
}

public class MessageResponse
{
    public required string Message { get; set; }
    public required string Nonce { get; set; }
}

