import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sentinel.services.alert_service import alert_service

def test_observability_and_alerts():
    print("Testing Phase 10 Observability, Health Monitoring & Configurable Alerting System...")

    # 1. Test Alert Triggers
    rec1 = alert_service.trigger_alert(
        alert_type="quality_degradation",
        message="Quality dropped below 60%",
        severity="HIGH",
        details={"score": 0.55}
    )
    print(f"  [OK] Alert 1 Created: {rec1.alert_id} ({rec1.alert_type})")
    assert rec1.alert_id.startswith("alert-")

    # 2. Test Evaluation Alert Auto Check
    alert_service.check_and_alert_evaluation({
        "overall_score": 0.45,
        "hallucination": 0.40,
        "toxicity": 0.15,
        "latency_ms": 3500.0,
    })
    
    history = alert_service.get_alert_history()
    print(f"  [OK] Alert History Count: {len(history)}")
    assert len(history) >= 4

    # 3. Test Alert Acknowledgment
    target_id = history[0]["alert_id"]
    ack_res = alert_service.acknowledge_alert(target_id)
    print(f"  [OK] Alert Acknowledged: {ack_res}")
    assert ack_res is True

    print("Phase 10 Observability & Alerting Test PASSED!")

if __name__ == "__main__":
    test_observability_and_alerts()
