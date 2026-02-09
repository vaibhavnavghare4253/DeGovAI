# AI Agents for DAO Governance

This service provides AI-powered analysis for DAO proposals using both free local models and paid OpenAI models.

## Features

### Hybrid AI Approach
- **Free Mode**: Uses local models (DistilBERT, rule-based systems)
- **Paid Mode**: Uses OpenAI GPT-4 for enhanced analysis
- **Automatic Fallback**: If OpenAI fails, falls back to local models

### AI Agents

1. **Proposal Analyzer**: Comprehensive proposal evaluation
2. **Risk Assessor**: Evaluates risk factors (0-100 scale)
3. **Fraud Detector**: Identifies fraud indicators
4. **Sentiment Analyzer**: NLP-based sentiment analysis

## Installation

```bash
cd ai-agents
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

## Configuration

Create a `.env` file:

```bash
# Optional: For enhanced AI features
OPENAI_API_KEY=your_openai_api_key

# Use local models (free)
USE_LOCAL_MODEL=true

# Database
DATABASE_URL=mssql+pyodbc://...
```

## Running the Service

### Development
```bash
uvicorn api.main:app --reload --port 8000
```

### Production
```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker
```bash
docker build -t ai-dao-agents .
docker run -p 8000:8000 ai-dao-agents
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Analyze Proposal
```bash
POST /api/analyze
Content-Type: application/json

{
  "proposal_id": 1,
  "title": "Fund Solar Panel Installation",
  "description": "...",
  "proposal_type": "Climate",
  "requested_amount": 50000,
  "submitter_address": "0x..."
}
```

### Risk Assessment
```bash
POST /api/risk
```

### Fraud Detection
```bash
POST /api/fraud
```

### Sentiment Analysis
```bash
POST /api/sentiment
```

## Response Format

```json
{
  "proposal_id": 1,
  "risk_score": 35.5,
  "fraud_probability": 12.3,
  "sentiment_score": 67.8,
  "recommended_action": "Approve",
  "confidence_level": 85.0,
  "key_insights": "• Low risk proposal\n• Strong community support",
  "detailed_analysis": "This Climate proposal...",
  "model_used": "GPT-4-Hybrid",
  "processing_time": 1234
}
```

## Models

### Local Models (Free)
- DistilBERT for sentiment analysis
- Rule-based risk assessment
- Pattern matching for fraud detection

### OpenAI Models (Paid)
- GPT-4 for comprehensive analysis
- Enhanced reasoning and context understanding
- Better recommendation quality

## Performance

- Average response time: 500-2000ms (local), 2000-5000ms (GPT-4)
- Concurrent requests: Up to 100
- Accuracy: 85-95% (depends on model used)

