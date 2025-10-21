import os
from typing import Optional
from abc import ABC, abstractmethod

class BaseAgent(ABC):
    """Base class for all AI agents"""
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.use_local = os.getenv("USE_LOCAL_MODEL", "true").lower() == "true"
        self.use_openai = bool(self.openai_key)
        
    def get_model_name(self) -> str:
        """Return the model being used"""
        if self.use_openai:
            return "GPT-4-Hybrid"
        elif self.use_local:
            return "LocalLLaMA-Hybrid"
        else:
            return "RuleBased"
    
    @abstractmethod
    async def process(self, **kwargs):
        """Process the agent's task"""
        pass

