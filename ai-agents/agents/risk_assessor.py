from typing import Dict, Any
from .base_agent import BaseAgent
import re

class RiskAssessor(BaseAgent):
    """
    Assess risk level of proposals based on multiple factors
    """
    
    def __init__(self):
        super().__init__()
        
        # Risk weight factors
        self.amount_thresholds = {
            1000: 10,      # Under $1k: +10 risk
            10000: 25,     # $1k-$10k: +25 risk
            100000: 50,    # $10k-$100k: +50 risk
            float('inf'): 80  # Over $100k: +80 risk
        }
        
        self.proposal_type_risk = {
            "Treasury": 60,
            "Technical": 45,
            "Governance": 30,
            "Climate": 35
        }
    
    async def assess(
        self,
        title: str,
        description: str,
        proposal_type: str,
        requested_amount: float
    ) -> Dict[str, Any]:
        """
        Calculate risk score based on proposal characteristics
        """
        
        base_risk = 0.0
        factors = []
        
        # Factor 1: Requested amount
        amount_risk = 0
        for threshold, risk in self.amount_thresholds.items():
            if requested_amount <= threshold:
                amount_risk = risk
                break
        base_risk += amount_risk * 0.4  # 40% weight
        factors.append(f"Amount risk: {amount_risk} (${requested_amount:,.2f})")
        
        # Factor 2: Proposal type
        type_risk = self.proposal_type_risk.get(proposal_type, 50)
        base_risk += type_risk * 0.2  # 20% weight
        factors.append(f"Type risk: {type_risk} ({proposal_type})")
        
        # Factor 3: Description completeness
        desc_words = len(description.split())
        if desc_words < 50:
            desc_risk = 70  # Very brief description
        elif desc_words < 150:
            desc_risk = 40  # Moderate description
        else:
            desc_risk = 15  # Detailed description
        base_risk += desc_risk * 0.15  # 15% weight
        factors.append(f"Description risk: {desc_risk} ({desc_words} words)")
        
        # Factor 4: Suspicious keywords
        suspicious_keywords = [
            'urgent', 'immediately', 'emergency', 'guaranteed', 'profit',
            'investment return', 'quick', 'limited time', 'exclusive'
        ]
        desc_lower = description.lower()
        suspicious_count = sum(1 for keyword in suspicious_keywords if keyword in desc_lower)
        keyword_risk = min(suspicious_count * 20, 80)
        base_risk += keyword_risk * 0.15  # 15% weight
        factors.append(f"Keyword risk: {keyword_risk} ({suspicious_count} suspicious terms)")
        
        # Factor 5: External links (potential phishing)
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, description)
        link_risk = min(len(urls) * 15, 60)
        base_risk += link_risk * 0.10  # 10% weight
        factors.append(f"Link risk: {link_risk} ({len(urls)} external links)")
        
        # Normalize to 0-100
        final_risk = min(max(base_risk, 0), 100)
        
        # Determine risk level
        if final_risk < 30:
            risk_level = "Low"
        elif final_risk < 60:
            risk_level = "Moderate"
        else:
            risk_level = "High"
        
        return {
            "score": round(final_risk, 2),
            "level": risk_level,
            "factors": factors,
            "model": self.get_model_name()
        }
    
    async def process(self, **kwargs):
        return await self.assess(**kwargs)

