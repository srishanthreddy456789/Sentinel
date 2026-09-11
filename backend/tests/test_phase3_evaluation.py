import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from ai.evaluation.engine import evaluation_engine
from sentinel.core.config import settings

def test_evaluation_engine_structured_output():
    print("Testing Phase 3 EvaluationEngine Hardening & Structured Metrics...")
    
    input_text = "Summarize the hours of operation in JSON format under 20 words."
    output_text = '{"hours": "Mon-Fri 9am-5pm"}'
    expected_output = "We are open Monday through Friday from 9 AM to 5 PM EST."
    context = ["Company operating hours are Monday to Friday, 9:00 AM to 5:00 PM EST."]
    
    result = evaluation_engine.evaluate_request(
        input_text=input_text,
        output_text=output_text,
        expected_output=expected_output,
        context=context,
        latency_ms=250.0,
    )

    result_dict = result.to_dict()
    print(f"Overall Score: {result.overall_score}, Passed: {result.passed}")
    
    # Verify presence of all 9 metrics
    expected_metrics = [
        "correctness", "faithfulness", "hallucination", "toxicity",
        "consistency", "latency", "retrieval_relevance",
        "context_completeness", "instruction_following"
    ]
    for metric_name in expected_metrics:
        assert metric_name in result_dict["metrics"], f"Metric '{metric_name}' missing from results"
        m_data = result_dict["metrics"][metric_name]
        assert "metric" in m_data
        assert "score" in m_data
        assert "passed" in m_data
        assert "confidence" in m_data
        assert "reason" in m_data
        assert "evidence" in m_data
        print(f"  [OK] Metric '{metric_name}': score={m_data['score']}, passed={m_data['passed']}, confidence={m_data['confidence']}")

    print("Phase 3 Evaluation Engine Test PASSED!")

if __name__ == "__main__":
    test_evaluation_engine_structured_output()
