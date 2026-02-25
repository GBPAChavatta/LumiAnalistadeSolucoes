"""Configurações da aplicação usando Pydantic Settings."""
from pydantic_settings import BaseSettings
from typing import List, Optional
from pydantic import Field
import os


class Settings(BaseSettings):
    """Configurações da aplicação."""
    
    elevenlabs_api_key: str = Field(..., alias="ELEVENLABS_API_KEY")
    agent_id: Optional[str] = Field(None, alias="AGENT_ID")
    elevenlabs_agent_id: Optional[str] = Field(None, alias="ELEVENLABS_AGENT_ID")
    cors_origins: Optional[str] = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    
    @property
    def agent_id_value(self) -> str:
        """Retorna o agent_id, tentando primeiro AGENT_ID e depois ELEVENLABS_AGENT_ID."""
        return self.agent_id or self.elevenlabs_agent_id or ""
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Retorna CORS_ORIGINS como lista."""
        cors_str = self.cors_origins or "http://localhost:3000"
        if isinstance(cors_str, list):
            return cors_str
        # Dividir por vírgula e limpar espaços
        return [origin.strip() for origin in cors_str.split(",") if origin.strip()]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        populate_by_name = True
        extra = "ignore"  # Ignorar campos extras no .env


settings = Settings()
