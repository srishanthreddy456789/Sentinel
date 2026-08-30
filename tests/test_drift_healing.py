import numpy as np
from sentinel.services.drift_service import DriftDetectionEngine
from sentinel.services.healing_service import AutonomousHealingEngine

def test_ks_and_psi_drift_detection():
    # Baseline normal distribution N(0, 1)
    np.random.seed(42)
    baseline = np.random.normal(0, 1, 500).tolist()
    
    # Identical distribution -> no drift
    similar = np.random.normal(0, 1, 500).tolist()
    stat, p_val, is_drifted = DriftDetectionEngine.calculate_ks_test(baseline, similar)
    assert is_drifted is False

    # Shifted distribution N(2, 1) -> heavy drift
    shifted = np.random.normal(2, 1, 500).tolist()
    stat, p_val, is_drifted = DriftDetectionEngine.calculate_ks_test(baseline, shifted)
    assert is_drifted is True
    assert stat > 0.3

    psi = DriftDetectionEngine.calculate_psi(baseline, shifted)
    assert psi > 0.2

def test_autonomous_healing():
    fix_type, fix_applied, score_before, score_after, time_taken = AutonomousHealingEngine.heal_model(
        drift_type="Data Drift",
        diagnosed_cause="Feature shift detected",
        baseline_accuracy=95.0,
        current_accuracy=72.0
    )
    assert fix_type == "DVC Retraining"
    assert score_after > score_before
    assert time_taken > 0
