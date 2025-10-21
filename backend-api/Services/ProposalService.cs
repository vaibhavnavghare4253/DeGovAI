using AIDAOGovernance.API.DTOs;
using System.Data;
using Npgsql;

namespace AIDAOGovernance.API.Services;

public class ProposalService : DatabaseService, IProposalService
{
    public ProposalService(IConfiguration configuration) : base(configuration) { }

    public async Task<ProposalResponse> CreateProposalAsync(CreateProposalRequest request)
    {
        var parameters = new[]
        {
            new NpgsqlParameter("@WalletAddress", request.WalletAddress),
            new NpgsqlParameter("@Title", request.Title),
            new NpgsqlParameter("@Description", request.Description),
            new NpgsqlParameter("@ProposalType", request.ProposalType),
            new NpgsqlParameter("@RequestedAmount", request.RequestedAmount),
            new NpgsqlParameter("@RecipientAddress", (object?)request.RecipientAddress ?? DBNull.Value),
            new NpgsqlParameter("@VotingDurationHours", request.VotingDurationHours),
            new NpgsqlParameter("@QuorumRequired", request.QuorumRequired),
            new NpgsqlParameter("@ApprovalThreshold", request.ApprovalThreshold)
        };

        var result = await ExecuteReaderAsync("sp_CreateProposal", parameters);

        if (result.Rows.Count == 0)
            throw new Exception("Failed to create proposal");

        return MapToProposalResponse(result.Rows[0]);
    }

    public async Task<ProposalListResponse> GetAllProposalsAsync(string? status, string? proposalType, int pageNumber, int pageSize)
    {
        var parameters = new[]
        {
            new NpgsqlParameter("@Status", (object?)status ?? DBNull.Value),
            new NpgsqlParameter("@ProposalType", (object?)proposalType ?? DBNull.Value),
            new NpgsqlParameter("@PageNumber", pageNumber),
            new NpgsqlParameter("@PageSize", pageSize)
        };

        var dataSet = await ExecuteMultipleResultsAsync("sp_GetAllProposals", parameters);

        var response = new ProposalListResponse
        {
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        if (dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
        {
            foreach (DataRow row in dataSet.Tables[0].Rows)
            {
                response.Proposals.Add(MapToProposalResponse(row));
            }
        }

        if (dataSet.Tables.Count > 1 && dataSet.Tables[1].Rows.Count > 0)
        {
            response.TotalCount = Convert.ToInt32(dataSet.Tables[1].Rows[0]["TotalCount"]);
        }

        return response;
    }

    public async Task<ProposalDetailsResponse> GetProposalDetailsAsync(int proposalId)
    {
        var parameters = new[] { new NpgsqlParameter("@ProposalId", proposalId) };
        var dataSet = await ExecuteMultipleResultsAsync("sp_GetProposalDetails", parameters);

        if (dataSet.Tables.Count == 0 || dataSet.Tables[0].Rows.Count == 0)
            throw new Exception($"Proposal with ID {proposalId} not found");

        var details = MapToProposalDetailsResponse(dataSet.Tables[0].Rows[0]);

        // Map votes (table 1)
        if (dataSet.Tables.Count > 1)
        {
            foreach (DataRow row in dataSet.Tables[1].Rows)
            {
                details.Votes.Add(new VoteResponse
                {
                    VoteId = Convert.ToInt32(row["VoteId"]),
                    ProposalId = proposalId,
                    VoteType = row["VoteType"].ToString() ?? "",
                    VotingPower = Convert.ToDecimal(row["VotingPower"]),
                    IsAIVote = Convert.ToBoolean(row["IsAIVote"]),
                    Reason = row["Reason"] as string,
                    CreatedAt = Convert.ToDateTime(row["CreatedAt"]),
                    WalletAddress = row["WalletAddress"].ToString() ?? "",
                    Username = row["Username"] as string
                });
            }
        }

        // Map AI analyses (table 2)
        if (dataSet.Tables.Count > 2)
        {
            foreach (DataRow row in dataSet.Tables[2].Rows)
            {
                details.AIAnalyses.Add(MapToAIAnalysisResponse(row));
            }
        }

        // Map treasury transactions (table 3)
        if (dataSet.Tables.Count > 3)
        {
            foreach (DataRow row in dataSet.Tables[3].Rows)
            {
                details.Transactions.Add(MapToTreasuryTransactionResponse(row));
            }
        }

        // Map simulations (table 4)
        if (dataSet.Tables.Count > 4)
        {
            foreach (DataRow row in dataSet.Tables[4].Rows)
            {
                details.Simulations.Add(MapToSimulationResponse(row));
            }
        }

        return details;
    }

    public async Task<ProposalResponse> UpdateProposalStatusAsync(int proposalId, string? blockchainProposalId)
    {
        var parameters = new[]
        {
            new NpgsqlParameter("@ProposalId", proposalId),
            new NpgsqlParameter("@BlockchainProposalId", (object?)blockchainProposalId ?? DBNull.Value)
        };

        var result = await ExecuteReaderAsync("sp_UpdateProposalStatus", parameters);

        if (result.Rows.Count == 0)
            throw new Exception($"Failed to update proposal {proposalId}");

        return MapToProposalResponse(result.Rows[0]);
    }

    private ProposalResponse MapToProposalResponse(DataRow row)
    {
        return new ProposalResponse
        {
            ProposalId = Convert.ToInt32(row["ProposalId"]),
            BlockchainProposalId = row["BlockchainProposalId"] as string,
            Title = row["Title"].ToString() ?? "",
            Description = row["Description"].ToString() ?? "",
            ProposalType = row["ProposalType"].ToString() ?? "",
            RequestedAmount = Convert.ToDecimal(row["RequestedAmount"]),
            RecipientAddress = row["RecipientAddress"] as string,
            Status = row["Status"].ToString() ?? "",
            VotingStartTime = Convert.ToDateTime(row["VotingStartTime"]),
            VotingEndTime = Convert.ToDateTime(row["VotingEndTime"]),
            QuorumRequired = Convert.ToDecimal(row["QuorumRequired"]),
            ApprovalThreshold = Convert.ToDecimal(row["ApprovalThreshold"]),
            CreatedAt = Convert.ToDateTime(row["CreatedAt"]),
            ExecutedAt = row["ExecutedAt"] != DBNull.Value ? Convert.ToDateTime(row["ExecutedAt"]) : null,
            SubmitterAddress = row["SubmitterAddress"].ToString() ?? "",
            SubmitterName = row["SubmitterName"] as string,
            SubmitterReputation = row["SubmitterReputation"] != DBNull.Value ? Convert.ToDecimal(row["SubmitterReputation"]) : null,
            VotesFor = row.Table.Columns.Contains("VotesFor") ? Convert.ToDecimal(row["VotesFor"]) : 0,
            VotesAgainst = row.Table.Columns.Contains("VotesAgainst") ? Convert.ToDecimal(row["VotesAgainst"]) : 0,
            VotesAbstain = row.Table.Columns.Contains("VotesAbstain") ? Convert.ToDecimal(row["VotesAbstain"]) : 0,
            TotalVoters = row.Table.Columns.Contains("TotalVoters") ? Convert.ToInt32(row["TotalVoters"]) : 0,
            TotalVotingPower = row.Table.Columns.Contains("TotalVotingPower") ? Convert.ToDecimal(row["TotalVotingPower"]) : 0,
            AIVotingPower = row.Table.Columns.Contains("AIVotingPower") ? Convert.ToDecimal(row["AIVotingPower"]) : 0,
            RiskScore = row.Table.Columns.Contains("RiskScore") && row["RiskScore"] != DBNull.Value ? Convert.ToDecimal(row["RiskScore"]) : null,
            RecommendedAction = row.Table.Columns.Contains("RecommendedAction") ? row["RecommendedAction"] as string : null,
            ConfidenceLevel = row.Table.Columns.Contains("ConfidenceLevel") && row["ConfidenceLevel"] != DBNull.Value ? Convert.ToDecimal(row["ConfidenceLevel"]) : null,
            HoursRemaining = row.Table.Columns.Contains("HoursRemaining") ? Convert.ToInt32(row["HoursRemaining"]) : 0
        };
    }

    private ProposalDetailsResponse MapToProposalDetailsResponse(DataRow row)
    {
        return new ProposalDetailsResponse
        {
            ProposalId = Convert.ToInt32(row["ProposalId"]),
            BlockchainProposalId = row["BlockchainProposalId"] as string,
            Title = row["Title"].ToString() ?? "",
            Description = row["Description"].ToString() ?? "",
            ProposalType = row["ProposalType"].ToString() ?? "",
            RequestedAmount = Convert.ToDecimal(row["RequestedAmount"]),
            RecipientAddress = row["RecipientAddress"] as string,
            Status = row["Status"].ToString() ?? "",
            VotingStartTime = Convert.ToDateTime(row["VotingStartTime"]),
            VotingEndTime = Convert.ToDateTime(row["VotingEndTime"]),
            QuorumRequired = Convert.ToDecimal(row["QuorumRequired"]),
            ApprovalThreshold = Convert.ToDecimal(row["ApprovalThreshold"]),
            CreatedAt = Convert.ToDateTime(row["CreatedAt"]),
            ExecutedAt = row["ExecutedAt"] != DBNull.Value ? Convert.ToDateTime(row["ExecutedAt"]) : null,
            SubmitterAddress = row["SubmitterAddress"].ToString() ?? "",
            SubmitterName = row["SubmitterName"] as string,
            SubmitterReputation = row["SubmitterReputation"] != DBNull.Value ? Convert.ToDecimal(row["SubmitterReputation"]) : null,
            VotesFor = Convert.ToDecimal(row["VotesFor"]),
            VotesAgainst = Convert.ToDecimal(row["VotesAgainst"]),
            VotesAbstain = Convert.ToDecimal(row["VotesAbstain"]),
            TotalVoters = Convert.ToInt32(row["TotalVoters"]),
            TotalVotingPower = Convert.ToDecimal(row["TotalVotingPower"]),
            AIVotingPower = Convert.ToDecimal(row["AIVotingPower"]),
            HoursRemaining = 0
        };
    }

    private AIAnalysisResponse MapToAIAnalysisResponse(DataRow row)
    {
        return new AIAnalysisResponse
        {
            AnalysisId = Convert.ToInt32(row["AnalysisId"]),
            ProposalId = Convert.ToInt32(row["ProposalId"]),
            AnalysisType = row["AnalysisType"].ToString() ?? "",
            RiskScore = row["RiskScore"] != DBNull.Value ? Convert.ToDecimal(row["RiskScore"]) : null,
            FraudProbability = row["FraudProbability"] != DBNull.Value ? Convert.ToDecimal(row["FraudProbability"]) : null,
            SentimentScore = row["SentimentScore"] != DBNull.Value ? Convert.ToDecimal(row["SentimentScore"]) : null,
            RecommendedAction = row["RecommendedAction"] as string,
            ConfidenceLevel = row["ConfidenceLevel"] != DBNull.Value ? Convert.ToDecimal(row["ConfidenceLevel"]) : null,
            KeyInsights = row["KeyInsights"] as string,
            DetailedAnalysis = row["DetailedAnalysis"] as string,
            ModelUsed = row["ModelUsed"] as string,
            ProcessingTime = row["ProcessingTime"] != DBNull.Value ? Convert.ToInt32(row["ProcessingTime"]) : null,
            CreatedAt = Convert.ToDateTime(row["CreatedAt"])
        };
    }

    private TreasuryTransactionResponse MapToTreasuryTransactionResponse(DataRow row)
    {
        return new TreasuryTransactionResponse
        {
            TransactionId = Convert.ToInt32(row["TransactionId"]),
            TransactionHash = row["TransactionHash"].ToString() ?? "",
            TransactionType = row["TransactionType"].ToString() ?? "",
            Amount = Convert.ToDecimal(row["Amount"]),
            FromAddress = row["FromAddress"] as string,
            ToAddress = row["ToAddress"] as string,
            Status = row["Status"].ToString() ?? "",
            BlockNumber = row["BlockNumber"] != DBNull.Value ? Convert.ToInt64(row["BlockNumber"]) : null,
            CreatedAt = Convert.ToDateTime(row["CreatedAt"]),
            ConfirmedAt = row["ConfirmedAt"] != DBNull.Value ? Convert.ToDateTime(row["ConfirmedAt"]) : null,
            RelatedProposal = null
        };
    }

    private SimulationResponse MapToSimulationResponse(DataRow row)
    {
        return new SimulationResponse
        {
            SimulationId = Convert.ToInt32(row["SimulationId"]),
            ProposalId = Convert.ToInt32(row["ProposalId"]),
            SimulationType = row["SimulationType"].ToString() ?? "",
            PredictedOutcome = row["PredictedOutcome"] as string,
            SuccessProbability = row["SuccessProbability"] != DBNull.Value ? Convert.ToDecimal(row["SuccessProbability"]) : null,
            EstimatedImpact = row["EstimatedImpact"] as string,
            ScenariosTested = Convert.ToInt32(row["ScenariosTested"]),
            SimulationData = row["SimulationData"] as string,
            CreatedAt = Convert.ToDateTime(row["CreatedAt"])
        };
    }
}

