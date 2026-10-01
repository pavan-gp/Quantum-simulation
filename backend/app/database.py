import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DATABASE_URL = "sqlite:////tmp/secure_military_comms.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    army_id = Column(String, unique=True, index=True, nullable=False)
    country = Column(String, nullable=False)  # 'Country A' or 'Country B'
    role = Column(String, default="sender", nullable=False)  # 'sender', 'receiver', 'admin'
    mfa_secret = Column(String, nullable=True)
    is_mfa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content_encrypted = Column(Text, nullable=False)  # Encrypted using hybrid AES-256 + PQC
    file_path = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    file_name = Column(String, nullable=True)
    decryption_key = Column(String, nullable=True)
    status = Column(String, default="pending")  # 'delivered', 'blocked'
    self_destruct_seconds = Column(Integer, default=0)  # 0 means no self-destruct
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    watermarked = Column(Boolean, default=False)
    blockchain_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True, nullable=False)  # 'login_success', 'login_fail', 'data_transmission', 'tamper_attempt'
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    transaction_hash = Column(String, nullable=True)

class BlockchainBlock(Base):
    __tablename__ = "blockchain_blocks"
    id = Column(Integer, primary_key=True, index=True)
    block_index = Column(Integer, unique=True, index=True, nullable=False)
    timestamp = Column(String, nullable=False)
    data = Column(Text, nullable=False)
    previous_hash = Column(String, nullable=False)
    nonce = Column(Integer, nullable=False)
    block_hash = Column(String, unique=True, index=True, nullable=False)

class IpBlacklist(Base):
    __tablename__ = "ip_blacklist"
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, index=True, nullable=False)
    reason = Column(String, nullable=False)
    blocked_at = Column(DateTime, default=datetime.datetime.utcnow)

class HoneypotLog(Base):
    __tablename__ = "honeypot_logs"
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, index=True, nullable=False)
    url_accessed = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    payload = Column(Text, nullable=True)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)

class FailedLoginAttempt(Base):
    __tablename__ = "failed_login_attempts"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    ip_address = Column(String, nullable=False)
    count = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)
