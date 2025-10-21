from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
import os
from dotenv import load_dotenv

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.proposal_analyzer import ProposalAnalyzer
from agents.risk_assessor import RiskAssessor
from agents.fraud_detector import FraudDetector
from agents.sentiment_analyzer import SentimentAnalyzer

load_dotenv()

app = FastAPI(
    title="AI-DAO Governance Agent Service",
    description="AI agents for analyzing DAO proposals and providing recommendations",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI agents
proposal_analyzer = ProposalAnalyzer()
risk_assessor = RiskAssessor()
fraud_detector = FraudDetector()
sentiment_analyzer = SentimentAnalyzer()

# Request/Response models
class AnalysisRequest(BaseModel):
    proposal_id: int
    title: str
    description: str
    proposal_type: str
    requested_amount: float
    submitter_address: str
    analysis_type: Literal["RiskAssessment", "FraudDetection", "ImpactSimulation", "Full"] = "Full"

class AnalysisResponse(BaseModel):
    proposal_id: int
    risk_score: float  # 0-100
    fraud_probability: float  # 0-100
    sentiment_score: float  # -100 to +100
    recommended_action: str  # "Approve", "Reject", "Review"
    confidence_level: float  # 0-100
    key_insights: str
    detailed_analysis: str
    model_used: str
    processing_time: int  # milliseconds

class HealthResponse(BaseModel):
    status: str
    openai_available: bool
    local_model_available: bool
    version: str

@app.get("/", response_model=dict)
async def root():
    return {
        "service": "AI-DAO Governance Agent Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "analyze": "/api/analyze",
            "risk": "/api/risk",
            "fraud": "/api/fraud",
            "sentiment": "/api/sentiment"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check the health and availability of AI models"""
    openai_key = os.getenv("OPENAI_API_KEY")
    use_local = os.getenv("USE_LOCAL_MODEL", "true").lower() == "true"
    
    return HealthResponse(
        status="healthy",
        openai_available=bool(openai_key),
        local_model_available=use_local,
        version="1.0.0"
    )

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_proposal(request: AnalysisRequest):
    """
    Comprehensive AI analysis of a DAO proposal
    
    Performs:
    - Risk assessment
    - Fraud detection
    - Sentiment analysis
    - Impact simulation
    """
    try:
        import time
        start_time = time.time()
        
        # Perform analyses
        risk_result = await risk_assessor.assess(
            title=request.title,
            description=request.description,
            proposal_type=request.proposal_type,
            requested_amount=request.requested_amount
        )
        
        fraud_result = await fraud_detector.detect(
            submitter=request.submitter_address,
            description=request.description,
            requested_amount=request.requested_amount
        )
        
        sentiment_result = await sentiment_analyzer.analyze(
            text=f"{request.title}. {request.description}"
        )
        
        # Comprehensive analysis
        comprehensive_analysis = await proposal_analyzer.analyze(
            proposal_id=request.proposal_id,
            title=request.title,
            description=request.description,
            proposal_type=request.proposal_type,
            requested_amount=request.requested_amount,
            risk_score=risk_result["score"],
            fraud_probability=fraud_result["probability"],
            sentiment_score=sentiment_result["score"]
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return AnalysisResponse(
            proposal_id=request.proposal_id,
            risk_score=risk_result["score"],
            fraud_probability=fraud_result["probability"],
            sentiment_score=sentiment_result["score"],
            recommended_action=comprehensive_analysis["recommendation"],
            confidence_level=comprehensive_analysis["confidence"],
            key_insights=comprehensive_analysis["key_insights"],
            detailed_analysis=comprehensive_analysis["detailed_analysis"],
            model_used=comprehensive_analysis["model_used"],
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/risk")
async def assess_risk(request: AnalysisRequest):
    """Assess risk level of a proposal"""
    try:
        result = await risk_assessor.assess(
            title=request.title,
            description=request.description,
            proposal_type=request.proposal_type,
            requested_amount=request.requested_amount
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk assessment failed: {str(e)}")

@app.post("/api/fraud")
async def detect_fraud(request: AnalysisRequest):
    """Detect potential fraud indicators"""
    try:
        result = await fraud_detector.detect(
            submitter=request.submitter_address,
            description=request.description,
            requested_amount=request.requested_amount
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fraud detection failed: {str(e)}")

@app.post("/api/sentiment")
async def analyze_sentiment(request: AnalysisRequest):
    """Analyze sentiment of proposal text"""
    try:
        result = await sentiment_analyzer.analyze(
            text=f"{request.title}. {request.description}"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

