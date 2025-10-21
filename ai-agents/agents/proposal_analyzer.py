import os
from typing import Dict, Any
from .base_agent import BaseAgent

try:
    from langchain_openai import ChatOpenAI
    from langchain.prompts import PromptTemplate
    from langchain.chains import LLMChain
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

class ProposalAnalyzer(BaseAgent):
    """
    Comprehensive proposal analyzer that combines multiple AI signals
    to provide holistic recommendations
    """
    
    def __init__(self):
        super().__init__()
        self.llm = None
        
        if LANGCHAIN_AVAILABLE and self.use_openai:
            try:
                self.llm = ChatOpenAI(
                    model="gpt-4",
                    temperature=0.7,
                    openai_api_key=self.openai_key
                )
            except:
                self.llm = None
    
    async def analyze(
        self,
        proposal_id: int,
        title: str,
        description: str,
        proposal_type: str,
        requested_amount: float,
        risk_score: float,
        fraud_probability: float,
        sentiment_score: float
    ) -> Dict[str, Any]:
        """
        Comprehensive analysis combining all signals
        """
        
        if self.llm and LANGCHAIN_AVAILABLE:
            return await self._analyze_with_llm(
                title, description, proposal_type, requested_amount,
                risk_score, fraud_probability, sentiment_score
            )
        else:
            return self._analyze_with_rules(
                title, description, proposal_type, requested_amount,
                risk_score, fraud_probability, sentiment_score
            )
    
    async def _analyze_with_llm(
        self,
        title: str,
        description: str,
        proposal_type: str,
        requested_amount: float,
        risk_score: float,
        fraud_probability: float,
        sentiment_score: float
    ) -> Dict[str, Any]:
        """Use LLM for comprehensive analysis"""
        
        prompt = PromptTemplate(
            input_variables=[
                "title", "description", "proposal_type", "amount",
                "risk", "fraud", "sentiment"
            ],
            template="""
You are an AI agent analyzing a DAO governance proposal. Provide a comprehensive assessment.

**Proposal Details:**
- Title: {title}
- Type: {proposal_type}
- Requested Amount: ${amount}
- Description: {description}

**Automated Analysis:**
- Risk Score: {risk}/100
- Fraud Probability: {fraud}/100
- Sentiment Score: {sentiment}/100

Based on this information:
1. Should this proposal be approved, rejected, or needs further review?
2. What are the key insights (3-5 bullet points)?
3. Provide a detailed analysis (2-3 paragraphs).
4. What is your confidence level (0-100)?

Format your response as:
RECOMMENDATION: [Approve/Reject/Review]
CONFIDENCE: [0-100]
KEY_INSIGHTS:
- [insight 1]
- [insight 2]
- [insight 3]
DETAILED_ANALYSIS:
[Your detailed analysis here]
"""
        )
        
        try:
            chain = LLMChain(llm=self.llm, prompt=prompt)
            result = await chain.arun(
                title=title,
                description=description,
                proposal_type=proposal_type,
                amount=requested_amount,
                risk=risk_score,
                fraud=fraud_probability,
                sentiment=sentiment_score
            )
            
            return self._parse_llm_response(result)
            
        except Exception as e:
            # Fallback to rule-based
            return self._analyze_with_rules(
                title, description, proposal_type, requested_amount,
                risk_score, fraud_probability, sentiment_score
            )
    
    def _analyze_with_rules(
        self,
        title: str,
        description: str,
        proposal_type: str,
        requested_amount: float,
        risk_score: float,
        fraud_probability: float,
        sentiment_score: float
    ) -> Dict[str, Any]:
        """Rule-based analysis when LLM is unavailable"""
        
        # Calculate recommendation based on scores
        if fraud_probability > 70:
            recommendation = "Reject"
            confidence = 90
            key_insight = "High fraud probability detected"
        elif risk_score > 80:
            recommendation = "Review"
            confidence = 75
            key_insight = "High risk score requires manual review"
        elif sentiment_score < -50:
            recommendation = "Review"
            confidence = 70
            key_insight = "Negative community sentiment detected"
        elif risk_score < 40 and fraud_probability < 30 and sentiment_score > 30:
            recommendation = "Approve"
            confidence = 85
            key_insight = "Low risk, low fraud probability, positive sentiment"
        else:
            recommendation = "Review"
            confidence = 60
            key_insight = "Mixed signals require further analysis"
        
        # Generate key insights
        insights = []
        insights.append(f"Risk assessment: {risk_score:.1f}/100 - {'Low' if risk_score < 40 else 'Moderate' if risk_score < 70 else 'High'} risk")
        insights.append(f"Fraud detection: {fraud_probability:.1f}/100 - {'Low' if fraud_probability < 30 else 'Moderate' if fraud_probability < 60 else 'High'} probability")
        insights.append(f"Sentiment analysis: {sentiment_score:+.1f}/100 - {'Positive' if sentiment_score > 20 else 'Neutral' if sentiment_score > -20 else 'Negative'}")
        insights.append(f"Proposal type: {proposal_type} requesting ${requested_amount:,.2f}")
        
        # Generate detailed analysis
        detailed = f"""
This {proposal_type} proposal requests ${requested_amount:,.2f} in funding. 

**Risk Analysis:** The proposal has a risk score of {risk_score:.1f}/100, indicating {'low' if risk_score < 40 else 'moderate' if risk_score < 70 else 'high'} risk. This is based on factors including the requested amount, proposal complexity, and historical patterns.

**Fraud Detection:** The fraud probability is {fraud_probability:.1f}/100, which is {'within acceptable limits' if fraud_probability < 30 else 'moderately elevated and warrants attention' if fraud_probability < 60 else 'concerning and requires careful review'}.

**Community Sentiment:** The sentiment analysis shows a score of {sentiment_score:+.1f}/100, indicating {'strong community support' if sentiment_score > 50 else 'moderate support' if sentiment_score > 0 else 'community concerns'}.

**Recommendation:** Based on the holistic analysis, this proposal is recommended to {recommendation.lower()}. {key_insight}. The confidence level in this recommendation is {confidence}%.
        """.strip()
        
        return {
            "recommendation": recommendation,
            "confidence": float(confidence),
            "key_insights": "\n".join(f"• {insight}" for insight in insights),
            "detailed_analysis": detailed,
            "model_used": self.get_model_name()
        }
    
    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parse LLM response into structured format"""
        lines = response.strip().split('\n')
        
        recommendation = "Review"
        confidence = 60.0
        key_insights = ""
        detailed_analysis = ""
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if line.startswith("RECOMMENDATION:"):
                recommendation = line.split(":", 1)[1].strip()
            elif line.startswith("CONFIDENCE:"):
                try:
                    confidence = float(line.split(":", 1)[1].strip())
                except:
                    confidence = 60.0
            elif line.startswith("KEY_INSIGHTS:"):
                current_section = "insights"
            elif line.startswith("DETAILED_ANALYSIS:"):
                current_section = "detailed"
            elif current_section == "insights" and line.startswith("-"):
                key_insights += line + "\n"
            elif current_section == "detailed":
                detailed_analysis += line + " "
        
        return {
            "recommendation": recommendation,
            "confidence": confidence,
            "key_insights": key_insights.strip() or "Analysis completed successfully",
            "detailed_analysis": detailed_analysis.strip() or "Comprehensive analysis performed based on available data.",
            "model_used": self.get_model_name()
        }
    
    async def process(self, **kwargs):
        return await self.analyze(**kwargs)

