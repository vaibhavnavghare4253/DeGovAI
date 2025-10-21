from typing import Dict, Any
from .base_agent import BaseAgent
import re

class FraudDetector(BaseAgent):
    """
    Detect potential fraud indicators in proposals
    """
    
    def __init__(self):
        super().__init__()
        
        # Known fraud patterns
        self.fraud_keywords = [
            'guaranteed returns', 'no risk', 'get rich', 'double your money',
            'limited offer', 'act now', 'send money', 'wire transfer',
            'offshore account', 'tax haven', 'anonymous', 'untraceable',
            'ponzi', 'pyramid', 'mlm', 'multi-level'
        ]
        
        self.suspicious_patterns = [
            r'(\d+)%\s*(profit|return|gain|roi)',  # Specific return percentages
            r'(double|triple|10x)\s*(your|the)\s*(money|investment)',  # Unrealistic multipliers
            r'(no|zero|minimal)\s*risk',  # No risk claims
        ]
    
    async def detect(
        self,
        submitter: str,
        description: str,
        requested_amount: float
    ) -> Dict[str, Any]:
        """
        Analyze proposal for fraud indicators
        """
        
        fraud_score = 0.0
        indicators = []
        
        desc_lower = description.lower()
        
        # Check for fraud keywords
        keyword_count = 0
        found_keywords = []
        for keyword in self.fraud_keywords:
            if keyword in desc_lower:
                keyword_count += 1
                found_keywords.append(keyword)
        
        if keyword_count > 0:
            keyword_fraud = min(keyword_count * 25, 80)
            fraud_score += keyword_fraud * 0.4
            indicators.append(f"Found {keyword_count} fraud keywords: {', '.join(found_keywords[:3])}")
        
        # Check for suspicious patterns
        pattern_count = 0
        for pattern in self.suspicious_patterns:
            if re.search(pattern, desc_lower):
                pattern_count += 1
        
        if pattern_count > 0:
            pattern_fraud = min(pattern_count * 30, 70)
            fraud_score += pattern_fraud * 0.3
            indicators.append(f"Detected {pattern_count} suspicious patterns")
        
        # Check for excessive amount requests
        if requested_amount > 100000:
            amount_fraud = 40
            fraud_score += amount_fraud * 0.15
            indicators.append(f"Large amount requested: ${requested_amount:,.2f}")
        elif requested_amount > 50000:
            amount_fraud = 20
            fraud_score += amount_fraud * 0.15
            indicators.append(f"Significant amount requested: ${requested_amount:,.2f}")
        
        # Check for vague or missing details
        if len(description.split()) < 30:
            vague_fraud = 50
            fraud_score += vague_fraud * 0.15
            indicators.append("Very brief/vague description")
        
        # Normalize to 0-100
        final_fraud = min(max(fraud_score, 0), 100)
        
        # Determine threat level
        if final_fraud < 20:
            threat_level = "Low"
            status = "Clean"
        elif final_fraud < 50:
            threat_level = "Moderate"
            status = "Monitor"
        elif final_fraud < 75:
            threat_level = "High"
            status = "Review Required"
        else:
            threat_level = "Critical"
            status = "Likely Fraud"
        
        return {
            "probability": round(final_fraud, 2),
            "threat_level": threat_level,
            "status": status,
            "indicators": indicators if indicators else ["No significant fraud indicators detected"],
            "model": self.get_model_name()
        }
    
    async def process(self, **kwargs):
        return await self.detect(**kwargs)

