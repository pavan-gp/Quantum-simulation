import os
import time
import hmac
import hashlib
import random
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import jwt, JWTError
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import bcrypt

# Configurations
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-military-grade-quantum-encryption-key-1287349182374")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

security_scheme = HTTPBearer()

# Password Hashing
def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# JWT Generation and Verification
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "refresh": True})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Zero Knowledge Proof (ZKP) Fiat-Shamir Simulation
# P is a prime number, G is generator.
# Private secret 's', public value v = (G^s) % P
ZKP_P = 21888242871839275222246405745257275088548364400416034343698204186575808495617  # Barreto-Naehrig prime
ZKP_G = 2

class ZKPManager:
    @staticmethod
    def get_public_value(secret: int) -> int:
        return pow(ZKP_G, secret, ZKP_P)

    @staticmethod
    def generate_challenge() -> int:
        # Generate challenge c (typically a hash of public details or random value)
        return random.randint(1, ZKP_P - 1)

    @staticmethod
    def verify_proof(public_value: int, commitment: int, challenge: int, response: int) -> bool:
        # Check if G^response == commitment * (public_value^challenge) % P
        left_side = pow(ZKP_G, response, ZKP_P)
        right_side = (commitment * pow(public_value, challenge, ZKP_P)) % ZKP_P
        return left_side == right_side

# Behavioral Biometrics Verification
# Simulates hold times (dwell time) and flight times (interval between keys).
# Registers a profile: list of average flight times and hold times.
class BiometricsVerifier:
    @staticmethod
    def calculate_match_score(stored_profile: Dict[str, float], session_profile: Dict[str, float]) -> float:
        """
        Calculates similarity score between typing biometrics profile.
        profiles contain keys: 'avg_hold_time', 'avg_flight_time', 'typing_speed_cpm', 'error_rate'
        Returns matching confidence percentage (0 to 100).
        """
        # Ensure we have all necessary features
        features = ['avg_hold_time', 'avg_flight_time', 'typing_speed_cpm']
        differences = []
        
        for feature in features:
            stored_val = stored_profile.get(feature, 0.0)
            session_val = session_profile.get(feature, 0.0)
            if stored_val == 0.0 or session_val == 0.0:
                continue
            
            diff = abs(stored_val - session_val) / max(stored_val, session_val, 1e-5)
            differences.append(diff)
            
        if not differences:
            return 50.0 # Standard neutral score
            
        avg_diff = sum(differences) / len(differences)
        # Convert difference ratio to a matching percentage
        score = max(0.0, 100.0 * (1.0 - avg_diff))
        return round(score, 2)

    @staticmethod
    def get_mock_stored_profile() -> dict:
        return {
            "avg_hold_time": 85.5,    # in milliseconds
            "avg_flight_time": 120.2,  # in milliseconds
            "typing_speed_cpm": 280.0 # characters per minute
        }
