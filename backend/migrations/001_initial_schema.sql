-- SENTINEL 1.0 Initial PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS developers (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    developer_id VARCHAR(36) NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS connected_apis (
    id VARCHAR(36) PRIMARY KEY,
    developer_id VARCHAR(36) NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    base_url VARCHAR(255),
    model_name VARCHAR(100),
    encrypted_api_key TEXT,
    task_type VARCHAR(50) DEFAULT 'llm_chat',
    status VARCHAR(50) DEFAULT 'Healthy',
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS models (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) REFERENCES connected_apis(id) ON DELETE CASCADE,
    developer_id VARCHAR(36) NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    task VARCHAR(50) DEFAULT 'general',
    model_type VARCHAR(50) DEFAULT 'custom',
    status VARCHAR(50) DEFAULT 'Healthy',
    baseline_accuracy FLOAT DEFAULT 95.0,
    current_accuracy FLOAT DEFAULT 95.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prompt_versions (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) NOT NULL REFERENCES connected_apis(id) ON DELETE CASCADE,
    version INT NOT NULL,
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    score FLOAT,
    status VARCHAR(50) DEFAULT 'active',
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) NOT NULL REFERENCES connected_apis(id) ON DELETE CASCADE,
    prompt_version_id VARCHAR(36) REFERENCES prompt_versions(id) ON DELETE SET NULL,
    input_text TEXT NOT NULL,
    output_text TEXT,
    expected_output TEXT,
    latency_ms FLOAT DEFAULT 0.0,
    status_code INT DEFAULT 200,
    quality_score FLOAT,
    failure_type VARCHAR(50),
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_suites (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) NOT NULL REFERENCES connected_apis(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    case_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_cases (
    id VARCHAR(36) PRIMARY KEY,
    test_suite_id VARCHAR(36) NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    expected_output TEXT,
    context JSONB,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluation_runs (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) NOT NULL REFERENCES connected_apis(id) ON DELETE CASCADE,
    test_suite_id VARCHAR(36) REFERENCES test_suites(id) ON DELETE SET NULL,
    run_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    overall_score FLOAT DEFAULT 0.0,
    correctness_score FLOAT DEFAULT 0.0,
    faithfulness_score FLOAT DEFAULT 0.0,
    consistency_score FLOAT DEFAULT 0.0,
    toxicity_score FLOAT DEFAULT 0.0,
    hallucination_score FLOAT DEFAULT 0.0,
    latency_p95 FLOAT DEFAULT 0.0,
    passed_cases INT DEFAULT 0,
    failed_cases INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluation_results (
    id VARCHAR(36) PRIMARY KEY,
    evaluation_run_id VARCHAR(36) NOT NULL REFERENCES evaluation_runs(id) ON DELETE CASCADE,
    request_log_id VARCHAR(36) REFERENCES requests(id) ON DELETE SET NULL,
    test_case_id VARCHAR(36) REFERENCES test_cases(id) ON DELETE SET NULL,
    passed BOOLEAN DEFAULT TRUE,
    overall_score FLOAT DEFAULT 0.0,
    correctness FLOAT DEFAULT 0.0,
    faithfulness FLOAT DEFAULT 0.0,
    hallucination FLOAT DEFAULT 0.0,
    consistency FLOAT DEFAULT 0.0,
    toxicity FLOAT DEFAULT 0.0,
    latency_ms FLOAT DEFAULT 0.0,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS failures (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) NOT NULL REFERENCES connected_apis(id) ON DELETE CASCADE,
    request_log_id VARCHAR(36) REFERENCES requests(id) ON DELETE SET NULL,
    evaluation_result_id VARCHAR(36) REFERENCES evaluation_results(id) ON DELETE SET NULL,
    failure_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) DEFAULT 'Medium',
    input_text TEXT,
    output_text TEXT,
    expected_output TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS diagnoses (
    id VARCHAR(36) PRIMARY KEY,
    failure_id VARCHAR(36) UNIQUE NOT NULL REFERENCES failures(id) ON DELETE CASCADE,
    diagnosis_type VARCHAR(50) NOT NULL,
    confidence FLOAT DEFAULT 0.0,
    reason TEXT NOT NULL,
    evidence JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS healing_events (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) NOT NULL REFERENCES connected_apis(id) ON DELETE CASCADE,
    diagnosis_id VARCHAR(36) REFERENCES diagnoses(id) ON DELETE SET NULL,
    healing_type VARCHAR(50) NOT NULL,
    original_artifact TEXT NOT NULL,
    candidate_artifact TEXT NOT NULL,
    score_before FLOAT NOT NULL,
    score_after FLOAT NOT NULL,
    improvement FLOAT NOT NULL,
    decision VARCHAR(50) DEFAULT 'PROMOTED',
    reasoning TEXT,
    healed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiments (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) NOT NULL REFERENCES connected_apis(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    mlflow_run_id VARCHAR(100),
    baseline_score FLOAT DEFAULT 0.0,
    candidate_score FLOAT DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'completed',
    winner_variant VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiment_variants (
    id VARCHAR(36) PRIMARY KEY,
    experiment_id VARCHAR(36) NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    variant_name VARCHAR(50) NOT NULL,
    prompt_content TEXT,
    score FLOAT DEFAULT 0.0,
    metrics JSONB
);

CREATE TABLE IF NOT EXISTS model_weaknesses (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) NOT NULL REFERENCES connected_apis(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    sample_size INT DEFAULT 0,
    failure_rate FLOAT DEFAULT 0.0,
    severity VARCHAR(50) DEFAULT 'Medium',
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(36) PRIMARY KEY,
    connected_api_id VARCHAR(36) NOT NULL REFERENCES connected_apis(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) DEFAULT 'Warning',
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_requests_connected_api ON requests(connected_api_id);
CREATE INDEX IF NOT EXISTS idx_failures_connected_api ON failures(connected_api_id);
CREATE INDEX IF NOT EXISTS idx_eval_runs_connected_api ON evaluation_runs(connected_api_id);
CREATE INDEX IF NOT EXISTS idx_healing_connected_api ON healing_events(connected_api_id);
