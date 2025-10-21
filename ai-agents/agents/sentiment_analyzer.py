from typing import Dict, Any
from .base_agent import BaseAgent

try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

class SentimentAnalyzer(BaseAgent):
    """
    Analyze sentiment of proposal text using NLP
    """
    
    def __init__(self):
        super().__init__()
        self.sentiment_pipeline = None
        
        if TRANSFORMERS_AVAILABLE:
            try:
                # Load sentiment analysis model (lightweight)
                self.sentiment_pipeline = pipeline(
                    "sentiment-analysis",
                    model="distilbert-base-uncased-finetuned-sst-2-english"
                )
            except:
                self.sentiment_pipeline = None
        
        # Positive/negative word lists for fallback
        self.positive_words = [
            'benefit', 'improve', 'positive', 'growth', 'sustainable', 'community',
            'transparent', 'innovative', 'solution', 'support', 'help', 'enhance',
            'progress', 'develop', 'opportunity', 'success', 'value', 'effective'
        ]
        
        self.negative_words = [
            'risk', 'problem', 'concern', 'difficult', 'challenge', 'threat',
            'danger', 'failure', 'loss', 'scam', 'fraud', 'waste', 'inefficient',
            'corrupt', 'misleading', 'manipulation', 'exploit'
        ]
    
    async def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of proposal text
        Returns score from -100 (very negative) to +100 (very positive)
        """
        
        if self.sentiment_pipeline and TRANSFORMERS_AVAILABLE:
            try:
                return await self._analyze_with_transformer(text)
            except:
                pass
        
        # Fallback to keyword-based analysis
        return self._analyze_with_keywords(text)
    
    async def _analyze_with_transformer(self, text: str) -> Dict[str, Any]:
        """Use transformer model for sentiment analysis"""
        
        # Split text into chunks if too long
        max_length = 512
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), max_length):
            chunk = ' '.join(words[i:i+max_length])
            chunks.append(chunk)
        
        # Analyze each chunk
        results = []
        for chunk in chunks[:5]:  # Limit to first 5 chunks
            result = self.sentiment_pipeline(chunk)[0]
            results.append(result)
        
        # Aggregate results
        total_score = 0
        positive_count = 0
        
        for result in results:
            if result['label'] == 'POSITIVE':
                total_score += result['score'] * 100
                positive_count += 1
            else:
                total_score -= result['score'] * 100
        
        avg_score = total_score / len(results) if results else 0
        
        # Determine sentiment category
        if avg_score > 30:
            sentiment = "Positive"
        elif avg_score > -30:
            sentiment = "Neutral"
        else:
            sentiment = "Negative"
        
        return {
            "score": round(avg_score, 2),
            "sentiment": sentiment,
            "confidence": round(sum(r['score'] for r in results) / len(results) * 100, 2) if results else 0,
            "model": "DistilBERT"
        }
    
    def _analyze_with_keywords(self, text: str) -> Dict[str, Any]:
        """Keyword-based sentiment analysis fallback"""
        
        text_lower = text.lower()
        words = text_lower.split()
        
        positive_count = sum(1 for word in self.positive_words if word in text_lower)
        negative_count = sum(1 for word in self.negative_words if word in text_lower)
        
        total_words = len(words)
        if total_words == 0:
            return {
                "score": 0.0,
                "sentiment": "Neutral",
                "confidence": 0.0,
                "model": "Keyword-Based"
            }
        
        # Calculate sentiment score
        positive_ratio = (positive_count / total_words) * 1000
        negative_ratio = (negative_count / total_words) * 1000
        
        raw_score = positive_ratio - negative_ratio
        
        # Normalize to -100 to +100
        sentiment_score = max(min(raw_score * 20, 100), -100)
        
        # Determine sentiment category
        if sentiment_score > 20:
            sentiment = "Positive"
        elif sentiment_score > -20:
            sentiment = "Neutral"
        else:
            sentiment = "Negative"
        
        # Calculate confidence based on signal strength
        confidence = min(abs(sentiment_score), 100)
        
        return {
            "score": round(sentiment_score, 2),
            "sentiment": sentiment,
            "confidence": round(confidence, 2),
            "positive_words": positive_count,
            "negative_words": negative_count,
            "model": "Keyword-Based"
        }
    
    async def process(self, **kwargs):
        return await self.analyze(**kwargs)

