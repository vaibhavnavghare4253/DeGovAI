using System.Data;
using Npgsql;

namespace AIDAOGovernance.API.Services;

public class DatabaseService
{
    private readonly string _connectionString;

    public DatabaseService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string not found");
    }

    protected NpgsqlConnection GetConnection()
    {
        return new NpgsqlConnection(_connectionString);
    }

    protected async Task<T?> ExecuteScalarAsync<T>(string functionName, params NpgsqlParameter[] parameters)
    {
        using var connection = GetConnection();
        
        var paramList = parameters.Length > 0 
            ? $"({string.Join(", ", parameters.Select(p => $"p_{p.ParameterName.Replace("@", "")}"))})" 
            : "()";
        
        using var command = new NpgsqlCommand($"SELECT * FROM {functionName}{paramList}", connection);

        // Rename parameters to match stored procedure expectations
        foreach (var param in parameters)
        {
            var newParam = new NpgsqlParameter($"p_{param.ParameterName.Replace("@", "")}", param.Value);
            command.Parameters.Add(newParam);
        }
        
        await connection.OpenAsync();
        var result = await command.ExecuteScalarAsync();
        
        return result != null && result != DBNull.Value ? (T)result : default;
    }

    protected async Task<int> ExecuteNonQueryAsync(string functionName, params NpgsqlParameter[] parameters)
    {
        using var connection = GetConnection();
        
        var paramList = parameters.Length > 0 
            ? $"({string.Join(", ", parameters.Select(p => $"p_{p.ParameterName.Replace("@", "")}"))})" 
            : "()";
        
        using var command = new NpgsqlCommand($"SELECT * FROM {functionName}{paramList}", connection);

        // Rename parameters to match stored procedure expectations
        foreach (var param in parameters)
        {
            var newParam = new NpgsqlParameter($"p_{param.ParameterName.Replace("@", "")}", param.Value);
            command.Parameters.Add(newParam);
        }
        
        await connection.OpenAsync();
        return await command.ExecuteNonQueryAsync();
    }

    protected async Task<DataTable> ExecuteReaderAsync(string functionName, params NpgsqlParameter[] parameters)
    {
        using var connection = GetConnection();
        
        var paramList = parameters.Length > 0 
            ? $"({string.Join(", ", parameters.Select(p => $"p_{p.ParameterName.Replace("@", "")}"))})" 
            : "()";
        
        using var command = new NpgsqlCommand($"SELECT * FROM {functionName}{paramList}", connection);

        // Rename parameters to match stored procedure expectations
        foreach (var param in parameters)
        {
            var newParam = new NpgsqlParameter($"p_{param.ParameterName.Replace("@", "")}", param.Value);
            command.Parameters.Add(newParam);
        }
        
        var dataTable = new DataTable();
        await connection.OpenAsync();
        
        using var reader = await command.ExecuteReaderAsync();
        dataTable.Load(reader);
        
        return dataTable;
    }

    protected async Task<DataSet> ExecuteMultipleResultsAsync(string functionName, params NpgsqlParameter[] parameters)
    {
        using var connection = GetConnection();
        
        var paramList = parameters.Length > 0 
            ? $"({string.Join(", ", parameters.Select(p => $"p_{p.ParameterName.Replace("@", "")}"))})" 
            : "()";
        
        using var command = new NpgsqlCommand($"SELECT * FROM {functionName}{paramList}", connection);

        // Rename parameters to match stored procedure expectations
        foreach (var param in parameters)
        {
            var newParam = new NpgsqlParameter($"p_{param.ParameterName.Replace("@", "")}", param.Value);
            command.Parameters.Add(newParam);
        }
        
        var dataSet = new DataSet();
        await connection.OpenAsync();
        
        using var adapter = new NpgsqlDataAdapter(command);
        adapter.Fill(dataSet);
        
        return dataSet;
    }
}

