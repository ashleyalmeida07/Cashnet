"""
Configuration management for the Rust-eze Simulation Lab backend
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env.local in parent directory
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "")
    
    # Blockchain
    sepolia_rpc_url: str = os.getenv("SEPOLIA_RPC_URL", "")
    private_key: str = os.getenv("PRIVATE_KEY", "")
    
    # Contract Addresses
    access_control_address: str = os.getenv("ACCESS_CONTROL_ADDRESS", "")
    sim_token_a_address: str = os.getenv("SIM_TOKEN_A_ADDRESS", "")
    sim_token_b_address: str = os.getenv("SIM_TOKEN_B_ADDRESS", "")
    identity_registry_address: str = os.getenv("IDENTITY_REGISTRY_ADDRESS", "")
    credit_registry_address: str = os.getenv("CREDIT_REGISTRY_ADDRESS", "")
    collateral_vault_address: str = os.getenv("COLLATERAL_VAULT_ADDRESS", "")
    lending_pool_address: str = os.getenv("LENDING_POOL_ADDRESS", "")
    liquidity_pool_address: str = os.getenv("LIQUIDITY_POOL_ADDRESS", "")
    
    # Market Data API
    coindesk_api_key: str = os.getenv("COINDESK_API_KEY", "")
    
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    class Config:
        env_file = ".env.local"
        case_sensitive = False


# Global settings instance
settings = Settings()
