using AIDAOGovernance.API.DTOs;

namespace AIDAOGovernance.API.Services;

public class TreasuryService : DatabaseService, ITreasuryService
{
    public TreasuryService(IConfiguration configuration) : base(configuration) { }

    public async Task<TreasuryStatusResponse> GetTreasuryStatusAsync()
    {
        try
        {
            // Test direct database call first
            using var connection = GetConnection();
            await connection.OpenAsync();
            
            using var command = new Npgsql.NpgsqlCommand("SELECT sp_GetTreasuryStatus()", connection);
            var jsonResult = await command.ExecuteScalarAsync() as string;
            
            if (string.IsNullOrEmpty(jsonResult))
                return new TreasuryStatusResponse();

            var treasuryData = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(jsonResult);
            
            var response = new TreasuryStatusResponse();

            // Parse summary data
            if (treasuryData?.summary != null)
            {
                var summary = treasuryData.summary;
                response.TotalDeposits = Convert.ToDecimal(summary.TotalDeposits ?? 0);
                response.TotalWithdrawals = Convert.ToDecimal(summary.TotalWithdrawals ?? 0);
                response.TotalAllocations = Convert.ToDecimal(summary.TotalAllocations ?? 0);
                response.CurrentBalance = Convert.ToDecimal(summary.CurrentBalance ?? 0);
                response.TotalTransactions = Convert.ToInt32(summary.TotalTransactions ?? 0);
            }

            // Parse recent transactions
            if (treasuryData?.recentTransactions != null)
            {
                foreach (var transaction in treasuryData.recentTransactions)
                {
                    response.RecentTransactions.Add(new TreasuryTransactionResponse
                    {
                        TransactionId = Convert.ToInt32(transaction.TransactionId ?? 0),
                        TransactionHash = transaction.TransactionHash?.ToString() ?? "",
                        TransactionType = transaction.TransactionType?.ToString() ?? "",
                        Amount = Convert.ToDecimal(transaction.Amount ?? 0),
                        FromAddress = transaction.FromAddress?.ToString(),
                        ToAddress = transaction.ToAddress?.ToString(),
                        Status = transaction.Status?.ToString() ?? "",
                        CreatedAt = Convert.ToDateTime(transaction.CreatedAt ?? DateTime.MinValue),
                        ConfirmedAt = transaction.ConfirmedAt != null ? Convert.ToDateTime(transaction.ConfirmedAt) : null,
                        RelatedProposal = transaction.RelatedProposal?.ToString()
                    });
                }
            }

            // Parse allocations by type
            if (treasuryData?.allocationsByType != null)
            {
                foreach (var allocation in treasuryData.allocationsByType)
                {
                    response.AllocationsByType.Add(new AllocationByTypeResponse
                    {
                        ProposalType = allocation.ProposalType?.ToString() ?? "",
                        ProposalCount = Convert.ToInt32(allocation.ProposalCount ?? 0),
                        TotalAllocated = Convert.ToDecimal(allocation.TotalAllocated ?? 0),
                        AverageAmount = Convert.ToDecimal(allocation.AverageAmount ?? 0)
                    });
                }
            }

            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to retrieve treasury status: {ex.Message}", ex);
        }
    }
}

