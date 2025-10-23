# Database Setup Script for AI-DAO Governance System
# Author: Vaibhav Navghare
# This script sets up the PostgreSQL database for the AI-DAO Governance system

Write-Host "🚀 Setting up AI-DAO Governance Database..." -ForegroundColor Green

# Database connection parameters
$DB_HOST = "localhost"
$DB_USER = "postgres"
$DB_NAME = "DeGovAI"
$DB_PASSWORD = "Root@123"

# Check if PostgreSQL is running
Write-Host "📋 Checking PostgreSQL connection..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = $DB_PASSWORD
    $result = psql -h $DB_HOST -U $DB_USER -d postgres -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL is running and accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL connection failed. Please ensure PostgreSQL is running." -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ PostgreSQL is not accessible. Please install and start PostgreSQL." -ForegroundColor Red
    exit 1
}

# Create database if it doesn't exist
Write-Host "📋 Creating database '$DB_NAME'..." -ForegroundColor Yellow
$createDbQuery = "SELECT 'CREATE DATABASE `"$DB_NAME`"' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')"
$env:PGPASSWORD = $DB_PASSWORD
psql -h $DB_HOST -U $DB_USER -d postgres -c $createDbQuery

# Run the database setup script
Write-Host "📋 Applying database schema and stored procedures..." -ForegroundColor Yellow
$env:PGPASSWORD = $DB_PASSWORD
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "database/setup-database.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host "🎉 You can now start the backend API" -ForegroundColor Green
} else {
    Write-Host "❌ Database setup failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}

# Verify tables were created
Write-Host "📋 Verifying database setup..." -ForegroundColor Yellow
$env:PGPASSWORD = $DB_PASSWORD
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\dt"

Write-Host "🎯 Database setup complete! You can now run the backend API." -ForegroundColor Green
Write-Host "💡 To start the API: cd backend-api && dotnet run" -ForegroundColor Cyan
