import uuid
from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship

from sentinel.database.database import Base

class Developer(Base):
    __tablename__ = "developers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    tier = Column(String(50), default="free")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    api_keys = relationship("ApiKey", back_populates="developer", cascade="all, delete-orphan")
    connected_apis = relationship("ConnectedApi", back_populates="developer", cascade="all, delete-orphan")
    models = relationship("Model", back_populates="developer", cascade="all, delete-orphan")

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    developer_id = Column(String(36), ForeignKey("developers.id"), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    key_prefix = Column(String(20), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, nullable=True)

    developer = relationship("Developer", back_populates="api_keys")

class ConnectedApi(Base):
    __tablename__ = "connected_apis"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    developer_id = Column(String(36), ForeignKey("developers.id"), nullable=False)
    name = Column(String(100), nullable=False)
    provider = Column(String(50), nullable=False)  # openai, anthropic, gemini, mistral, huggingface, custom, sentinel_free
    encrypted_api_key = Column(Text, nullable=True)
    task_type = Column(String(50), default="llm_chat")
    status = Column(String(50), default="Healthy")
    created_at = Column(DateTime, default=datetime.utcnow)

    developer = relationship("Developer", back_populates="connected_apis")
    models = relationship("Model", back_populates="connected_api", cascade="all, delete-orphan")

class Model(Base):
    __tablename__ = "models"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=True)
    developer_id = Column(String(36), ForeignKey("developers.id"), nullable=False)
    name = Column(String(100), nullable=False)
    task = Column(String(50), default="general")
    model_type = Column(String(50), default="custom")  # custom vs default
    status = Column(String(50), default="Healthy")  # Healthy, Degraded, Healing, Critical
    baseline_accuracy = Column(Float, default=95.0)
    current_accuracy = Column(Float, default=95.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    developer = relationship("Developer", back_populates="models")
    connected_api = relationship("ConnectedApi", back_populates="models")
    predictions = relationship("Prediction", back_populates="model", cascade="all, delete-orphan")
    drift_events = relationship("DriftEvent", back_populates="model", cascade="all, delete-orphan")
    fallback_activations = relationship("FallbackActivation", back_populates="model", cascade="all, delete-orphan")
    versions = relationship("ModelVersion", back_populates="model", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String(36), ForeignKey("models.id"), nullable=False)
    input = Column(JSON, nullable=False)
    output = Column(JSON, nullable=False)
    actual = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    model = relationship("Model", back_populates="predictions")

class DriftEvent(Base):
    __tablename__ = "drift_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String(36), ForeignKey("models.id"), nullable=False)
    drift_type = Column(String(50), nullable=False)  # Data Drift, Concept Drift, Pipeline Drift, Hallucination
    severity = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    diagnosed_cause = Column(Text, nullable=False)
    ks_score = Column(Float, nullable=True)
    psi_score = Column(Float, nullable=True)
    kl_score = Column(Float, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)

    model = relationship("Model", back_populates="drift_events")
    healing_logs = relationship("HealingLog", back_populates="drift_event", cascade="all, delete-orphan")

class HealingLog(Base):
    __tablename__ = "healing_log"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    drift_event_id = Column(String(36), ForeignKey("drift_events.id"), nullable=False)
    fix_type = Column(String(50), nullable=False)  # DVC Retraining, Threshold Optimization, Fallback Model, Prompt Healing
    fix_applied = Column(Text, nullable=False)
    score_before = Column(Float, nullable=False)
    score_after = Column(Float, nullable=False)
    outcome = Column(String(50), default="Success")  # Success, Failed, Rolled Back
    time_to_heal_seconds = Column(Integer, default=12)
    healed_at = Column(DateTime, default=datetime.utcnow)

    drift_event = relationship("DriftEvent", back_populates="healing_logs")

class FallbackActivation(Base):
    __tablename__ = "fallback_activations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String(36), ForeignKey("models.id"), nullable=False)
    reason = Column(Text, nullable=False)
    activated_at = Column(DateTime, default=datetime.utcnow)
    deactivated_at = Column(DateTime, nullable=True)

    model = relationship("Model", back_populates="fallback_activations")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String(36), ForeignKey("models.id"), nullable=False)
    version = Column(Integer, nullable=False)
    mlflow_run_id = Column(String(100), nullable=True)
    accuracy = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=True)
    promoted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    model = relationship("Model", back_populates="versions")
