using AIDAOGovernance.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "AI-DAO Governance API", 
        Version = "v1",
        Description = "Backend API for AI-powered DAO governance system",
        Contact = new() { Name = "Vaibhav Navghare" }
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register services
builder.Services.AddScoped<IProposalService, ProposalService>();
builder.Services.AddScoped<IVoteService, VoteService>();
builder.Services.AddScoped<IAIAnalysisService, AIAnalysisService>();
builder.Services.AddScoped<ITreasuryService, TreasuryService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBlockchainService, BlockchainService>();

// Redis caching (optional)
var redisConnection = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnection))
{
    try
    {
        var redis = ConnectionMultiplexer.Connect(redisConnection + ",abortConnect=false");
        builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
        Console.WriteLine("✅ Redis connected successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Redis connection failed: {ex.Message}");
        Console.WriteLine("📝 Application will continue without Redis caching");
        // Register a null connection multiplexer to avoid null reference exceptions
        builder.Services.AddSingleton<IConnectionMultiplexer>((IServiceProvider provider) => null);
    }
}
else
{
    Console.WriteLine("📝 Redis connection string not configured - caching disabled");
    builder.Services.AddSingleton<IConnectionMultiplexer>((IServiceProvider provider) => null);
}

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your-secret-key-min-32-characters-long-for-security";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "AIDAOGovernance";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "AIDAOGovernanceUsers";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// HTTP Client for AI service
builder.Services.AddHttpClient("AIService", client =>
{
    var aiServiceUrl = builder.Configuration["AIServiceUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(aiServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(120);
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Enable Swagger in both Development and Production for easier testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "AI-DAO Governance API v1");
    c.RoutePrefix = "swagger"; // Swagger at /swagger
});

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("🚀 AI-DAO Governance API Starting...");
Console.WriteLine($"📊 Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"🔗 Swagger UI: http://localhost:5000/swagger");

app.Run();

