using AIDAOGovernance.API.DTOs;
using Npgsql;

namespace AIDAOGovernance.API.Services;

public class VoteService : DatabaseService, IVoteService
{
    public VoteService(IConfiguration configuration) : base(configuration) { }

    public async Task<VoteResponse> CastVoteAsync(CastVoteRequest request)
    {
        var parameters = new[]
        {
            new NpgsqlParameter("@ProposalId", request.ProposalId),
            new NpgsqlParameter("@WalletAddress", request.WalletAddress),
            new NpgsqlParameter("@VoteType", request.VoteType),
            new NpgsqlParameter("@VotingPower", request.VotingPower),
            new NpgsqlParameter("@IsAIVote", request.IsAIVote),
            new NpgsqlParameter("@TransactionHash", (object?)request.TransactionHash ?? DBNull.Value),
            new NpgsqlParameter("@Reason", (object?)request.Reason ?? DBNull.Value)
        };

        var result = await ExecuteReaderAsync("sp_CastVote", parameters);

        if (result.Rows.Count == 0)
            throw new Exception("Failed to cast vote");

        var row = result.Rows[0];
        return new VoteResponse
        {
            VoteId = Convert.ToInt32(row["VoteId"]),
            ProposalId = Convert.ToInt32(row["ProposalId"]),
            VoteType = row["VoteType"].ToString() ?? "",
            VotingPower = Convert.ToDecimal(row["VotingPower"]),
            IsAIVote = Convert.ToBoolean(row["IsAIVote"]),
            CreatedAt = Convert.ToDateTime(row["CreatedAt"]),
            WalletAddress = row["WalletAddress"].ToString() ?? ""
        };
    }
}

