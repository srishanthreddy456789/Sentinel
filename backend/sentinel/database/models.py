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
    projects = relationship("Project", back_populates="developer", cascade="all, delete-orphan")

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
    name = Column(String(100), nullable=False)  # User entered exact name
    provider = Column(String(50), nullable=False)  # sentinel_local, openai, anthropic, gemini, mistral, ollama, huggingface, custom
    base_url = Column(String(255), nullable=True)
    model_name = Column(String(100), nullable=True)
    encrypted_api_key = Column(Text, nullable=True)
    task_type = Column(String(50), default="llm_chat")
    status = Column(String(50), default="Healthy")
    config = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    developer = relationship("Developer", back_populates="connected_apis")
    models = relationship("Model", back_populates="connected_api", cascade="all, delete-orphan")
    request_logs = relationship("RequestLog", back_populates="connected_api", cascade="all, delete-orphan")
    test_suites = relationship("TestSuite", back_populates="connected_api", cascade="all, delete-orphan")
    prompt_versions = relationship("PromptVersion", back_populates="connected_api", cascade="all, delete-orphan")
    evaluation_runs = relationship("EvaluationRun", back_populates="connected_api", cascade="all, delete-orphan")
    failures = relationship("Failure", back_populates="connected_api", cascade="all, delete-orphan")
    healing_events = relationship("HealingEvent", back_populates="connected_api", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="connected_api", cascade="all, delete-orphan")
    model_weaknesses = relationship("ModelWeakness", back_populates="connected_api", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="connected_api", cascade="all, delete-orphan")

class Model(Base):
    __tablename__ = "models"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=True)
    developer_id = Column(String(36), ForeignKey("developers.id"), nullable=False)
    name = Column(String(100), nullable=False)
    task = Column(String(50), default="general")
    model_type = Column(String(50), default="custom")
    status = Column(String(50), default="Healthy")
    baseline_accuracy = Column(Float, default=95.0)
    current_accuracy = Column(Float, default=95.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    developer = relationship("Developer", back_populates="models")
    connected_api = relationship("ConnectedApi", back_populates="models")
    predictions = relationship("Prediction", back_populates="model", cascade="all, delete-orphan")
    drift_events = relationship("DriftEvent", back_populates="model", cascade="all, delete-orphan")
    fallback_activations = relationship("FallbackActivation", back_populates="model", cascade="all, delete-orphan")
    versions = relationship("ModelVersion", back_populates="model", cascade="all, delete-orphan")

class RequestLog(Base):
    __tablename__ = "requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=False, index=True)
    prompt_version_id = Column(String(36), ForeignKey("prompt_versions.id"), nullable=True)
    input_text = Column(Text, nullable=False)
    output_text = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=True)
    latency_ms = Column(Float, default=0.0)
    status_code = Column(Integer, default=200)
    quality_score = Column(Float, nullable=True)
    failure_type = Column(String(50), nullable=True)
    meta_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    connected_api = relationship("ConnectedApi", back_populates="request_logs")
    prompt_version = relationship("PromptVersion", back_populates="requests")
    evaluation_results = relationship("EvaluationResult", back_populates="request_log", cascade="all, delete-orphan")
    failures = relationship("Failure", back_populates="request_log", cascade="all, delete-orphan")

class TestSuite(Base):
    __tablename__ = "test_suites"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    case_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    connected_api = relationship("ConnectedApi", back_populates="test_suites")
    test_cases = relationship("TestCase", back_populates="test_suite", cascade="all, delete-orphan")
    evaluation_runs = relationship("EvaluationRun", back_populates="test_suite", cascade="all, delete-orphan")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_suite_id = Column(String(36), ForeignKey("test_suites.id"), nullable=False, index=True)
    input_text = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=True)
    context = Column(JSON, nullable=True)
    category = Column(String(50), default="general")
    created_at = Column(DateTime, default=datetime.utcnow)

    test_suite = relationship("TestSuite", back_populates="test_cases")

class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=False, index=True)
    version = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=False)
    score = Column(Float, nullable=True)
    status = Column(String(50), default="active")  # active, candidate, archived, rejected
    change_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    connected_api = relationship("ConnectedApi", back_populates="prompt_versions")
    requests = relationship("RequestLog", back_populates="prompt_version")

class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=False, index=True)
    test_suite_id = Column(String(36), ForeignKey("test_suites.id"), nullable=True)
    run_name = Column(String(100), nullable=False)
    status = Column(String(50), default="completed")  # running, completed, failed
    overall_score = Column(Float, default=0.0)
    correctness_score = Column(Float, default=0.0)
    faithfulness_score = Column(Float, default=0.0)
    consistency_score = Column(Float, default=0.0)
    toxicity_score = Column(Float, default=0.0)
    hallucination_score = Column(Float, default=0.0)
    latency_p95 = Column(Float, default=0.0)
    passed_cases = Column(Integer, default=0)
    failed_cases = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    connected_api = relationship("ConnectedApi", back_populates="evaluation_runs")
    test_suite = relationship("TestSuite", back_populates="evaluation_runs")
    results = relationship("EvaluationResult", back_populates="evaluation_run", cascade="all, delete-orphan")

class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_run_id = Column(String(36), ForeignKey("evaluation_runs.id"), nullable=False, index=True)
    request_log_id = Column(String(36), ForeignKey("requests.id"), nullable=True)
    test_case_id = Column(String(36), ForeignKey("test_cases.id"), nullable=True)
    passed = Column(Boolean, default=True)
    overall_score = Column(Float, default=0.0)
    correctness = Column(Float, default=0.0)
    faithfulness = Column(Float, default=0.0)
    hallucination = Column(Float, default=0.0)
    consistency = Column(Float, default=0.0)
    toxicity = Column(Float, default=0.0)
    latency_ms = Column(Float, default=0.0)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    evaluation_run = relationship("EvaluationRun", back_populates="results")
    request_log = relationship("RequestLog", back_populates="evaluation_results")
    failures = relationship("Failure", back_populates="evaluation_result")

class Failure(Base):
    __tablename__ = "failures"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=False, index=True)
    request_log_id = Column(String(36), ForeignKey("requests.id"), nullable=True)
    evaluation_result_id = Column(String(36), ForeignKey("evaluation_results.id"), nullable=True)
    failure_type = Column(String(50), nullable=False)  # PROMPT_QUALITY, KNOWLEDGE_GAP, RAG_RETRIEVAL, MODEL_WEAKNESS, HALLUCINATION, FAITHFULNESS, CONSISTENCY, TOXICITY, LATENCY, UNKNOWN
    severity = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    input_text = Column(Text, nullable=True)
    output_text = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    connected_api = relationship("ConnectedApi", back_populates="failures")
    request_log = relationship("RequestLog", back_populates="failures")
    evaluation_result = relationship("EvaluationResult", back_populates="failures")
    diagnosis = relationship("Diagnosis", back_populates="failure", uselist=False, cascade="all, delete-orphan")

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    failure_id = Column(String(36), ForeignKey("failures.id"), nullable=False, unique=True)
    diagnosis_type = Column(String(50), nullable=False)
    confidence = Column(Float, default=0.0)
    reason = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    failure = relationship("Failure", back_populates="diagnosis")
    healing_event = relationship("HealingEvent", back_populates="diagnosis", uselist=False, cascade="all, delete-orphan")

class HealingEvent(Base):
    __tablename__ = "healing_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=False, index=True)
    diagnosis_id = Column(String(36), ForeignKey("diagnoses.id"), nullable=True)
    healing_type = Column(String(50), nullable=False)  # PROMPT_HEALING, RAG_HEALING, MODEL_WEAKNESS
    original_artifact = Column(Text, nullable=False)
    candidate_artifact = Column(Text, nullable=False)
    score_before = Column(Float, nullable=False)
    score_after = Column(Float, nullable=False)
    improvement = Column(Float, nullable=False)
    decision = Column(String(50), default="PROMOTED")  # PROMOTED, REJECTED
    reasoning = Column(Text, nullable=True)
    healed_at = Column(DateTime, default=datetime.utcnow)

    connected_api = relationship("ConnectedApi", back_populates="healing_events")
    diagnosis = relationship("Diagnosis", back_populates="healing_event")

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    mlflow_run_id = Column(String(100), nullable=True)
    baseline_score = Column(Float, default=0.0)
    candidate_score = Column(Float, default=0.0)
    status = Column(String(50), default="completed")
    winner_variant = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    connected_api = relationship("ConnectedApi", back_populates="experiments")
    variants = relationship("ExperimentVariant", back_populates="experiment", cascade="all, delete-orphan")

class ExperimentVariant(Base):
    __tablename__ = "experiment_variants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False, index=True)
    variant_name = Column(String(50), nullable=False)  # e.g., Variant A (Original), Variant B (Healed)
    prompt_content = Column(Text, nullable=True)
    score = Column(Float, default=0.0)
    metrics = Column(JSON, nullable=True)

    experiment = relationship("Experiment", back_populates="variants")

class ModelWeakness(Base):
    __tablename__ = "model_weaknesses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    sample_size = Column(Integer, default=0)
    failure_rate = Column(Float, default=0.0)
    severity = Column(String(50), default="Medium")
    recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    connected_api = relationship("ConnectedApi", back_populates="model_weaknesses")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connected_api_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # HIGH_FAILURE_RATE, LATENCY_SPIKE, QUALITY_DROP
    severity = Column(String(50), default="Warning")  # Info, Warning, Critical
    message = Column(Text, nullable=False)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    connected_api = relationship("ConnectedApi", back_populates="alerts")

# Legacy models for SDK backward compatibility
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
    drift_type = Column(String(50), nullable=False)
    severity = Column(String(50), default="Medium")
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
    fix_type = Column(String(50), nullable=False)
    fix_applied = Column(Text, nullable=False)
    score_before = Column(Float, nullable=False)
    score_after = Column(Float, nullable=False)
    outcome = Column(String(50), default="Success")
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


# Projects and Linked Multi-Chat Models
class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    developer_id = Column(String(36), ForeignKey("developers.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    system_instructions = Column(Text, nullable=True)
    context_docs = Column(Text, nullable=True)
    default_model_id = Column(String(36), ForeignKey("connected_apis.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    developer = relationship("Developer", back_populates="projects")
    default_model = relationship("ConnectedApi")
    chats = relationship("ProjectChat", back_populates="project", cascade="all, delete-orphan")


class ProjectChat(Base):
    __tablename__ = "project_chats"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="chats")
    messages = relationship("ProjectMessage", back_populates="chat", cascade="all, delete-orphan")


class ProjectMessage(Base):
    __tablename__ = "project_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = Column(String(36), ForeignKey("project_chats.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    correctness = Column(Float, nullable=True)
    faithfulness = Column(Float, nullable=True)
    latency_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    chat = relationship("ProjectChat", back_populates="messages")



