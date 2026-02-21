"""
Authentication router for wallet-based authentication
Uses signature verification for secure, non-custodial auth
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import secrets
import jwt
from eth_account.messages import encode_defunct
from web3 import Web3

from database import get_db
from models import Borrower
from schemas import NonceRequest, NonceResponse, AuthVerifyRequest, AuthResponse, BorrowerResponse

# Router instance
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Configuration - should be in environment variables in production
JWT_SECRET = "your-secret-key-change-in-production"  # TODO: Move to environment variable
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Web3 instance
w3 = Web3()


def generate_nonce() -> str:
    """Generate a random nonce for signature verification"""
    return secrets.token_hex(32)


def create_auth_message(wallet_address: str, nonce: str) -> str:
    """Create the message to be signed by the wallet"""
    return f"Sign this message to authenticate with Cashnet.\n\nWallet: {wallet_address}\nNonce: {nonce}\n\nThis request will not trigger a blockchain transaction or cost any gas fees."


def verify_signature(wallet_address: str, signature: str, message: str) -> bool:
    """Verify that the signature matches the wallet address and message"""
    try:
        # Encode the message
        encoded_message = encode_defunct(text=message)
        
        # Recover the address from the signature
        recovered_address = w3.eth.account.recover_message(encoded_message, signature=signature)
        
        # Compare addresses (case-insensitive)
        return recovered_address.lower() == wallet_address.lower()
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False


def create_jwt_token(wallet_address: str, borrower_id: int) -> str:
    """Create JWT token for authenticated session"""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    
    payload = {
        "wallet_address": wallet_address,
        "borrower_id": borrower_id,
        "exp": expiration,
        "iat": datetime.utcnow()
    }
    
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


@router.post("/nonce", response_model=NonceResponse)
async def get_nonce(request: NonceRequest, db: Session = Depends(get_db)):
    """
    Get or create a nonce for wallet authentication
    This is step 1 of the authentication flow
    """
    # Normalize wallet address
    wallet_address = request.wallet_address.lower()
    
    # Validate Ethereum address format
    if not w3.is_address(wallet_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Ethereum address"
        )
    
    # Checksum the address
    wallet_address = w3.to_checksum_address(wallet_address)
    
    # Get or create borrower
    borrower = db.query(Borrower).filter(Borrower.wallet_address == wallet_address).first()
    
    if not borrower:
        # Create new borrower with nonce
        nonce = generate_nonce()
        borrower = Borrower(
            wallet_address=wallet_address,
            nonce=nonce
        )
        db.add(borrower)
    else:
        # Generate new nonce for existing borrower
        borrower.nonce = generate_nonce()
    
    db.commit()
    db.refresh(borrower)
    
    # Create message to sign
    message = create_auth_message(wallet_address, borrower.nonce)
    
    return NonceResponse(
        nonce=borrower.nonce,
        message=message
    )


@router.post("/verify", response_model=AuthResponse)
async def verify_signature_and_login(request: AuthVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify wallet signature and authenticate user
    This is step 2 of the authentication flow
    """
    # Normalize wallet address
    wallet_address = request.wallet_address.lower()
    
    # Validate Ethereum address
    if not w3.is_address(wallet_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Ethereum address"
        )
    
    # Checksum the address
    wallet_address = w3.to_checksum_address(wallet_address)
    
    # Get borrower
    borrower = db.query(Borrower).filter(Borrower.wallet_address == wallet_address).first()
    
    if not borrower:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found. Please request a nonce first."
        )
    
    # Create the message that should have been signed
    message = create_auth_message(wallet_address, borrower.nonce)
    
    # Verify signature
    if not verify_signature(wallet_address, request.signature, message):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature"
        )
    
    # Update borrower information
    borrower.last_login = datetime.utcnow()
    if request.name:
        borrower.name = request.name
    if request.email:
        borrower.email = request.email
    
    # Generate new nonce for next authentication
    borrower.nonce = generate_nonce()
    
    db.commit()
    db.refresh(borrower)
    
    # Create JWT token
    token = create_jwt_token(wallet_address, borrower.id)
    
    return AuthResponse(
        wallet_address=borrower.wallet_address,
        name=borrower.name,
        email=borrower.email,
        token=token,
        created_at=borrower.created_at
    )


@router.get("/me", response_model=BorrowerResponse)
async def get_current_user(token: str, db: Session = Depends(get_db)):
    """
    Get current authenticated user information
    Requires JWT token in query parameter or header
    """
    # Verify token
    payload = verify_jwt_token(token)
    
    # Get borrower
    borrower = db.query(Borrower).filter(Borrower.id == payload["borrower_id"]).first()
    
    if not borrower or not borrower.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or inactive"
        )
    
    return borrower


@router.post("/logout")
async def logout(token: str, db: Session = Depends(get_db)):
    """
    Logout user by invalidating their nonce
    In a production app, you'd want a token blacklist
    """
    # Verify token
    payload = verify_jwt_token(token)
    
    # Get borrower and regenerate nonce
    borrower = db.query(Borrower).filter(Borrower.id == payload["borrower_id"]).first()
    
    if borrower:
        borrower.nonce = generate_nonce()
        db.commit()
    
    return {"message": "Logged out successfully"}
