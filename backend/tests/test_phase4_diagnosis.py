import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from ai.evaluation.engine import evaluation_engine
from ai.diagnosis.classifier import failure_classifier
from ai.diagnosis.historical_analyzer import historical_failure_analyzer

def test_diagnosis_engine():
    print("Testing Phase 4 Failure Diagnosis Engine & Historical Analysis...")

    # Case 1: Prompt Ambiguity (Short prompt without question mark)
    input_text = "refund"
    output_text = "Refunds take 5-7 business days."
    res1 = evaluation_engine.evaluate_request(input_text, output_text, expected_output="To request a refund, go to Account Orders.")
    diag1 = failure_classifier.classify_and_diagnose(res1, input_text, output_text, expected_output="To request a refund, go to Account Orders.")
    print(f"  [OK] Diagnosis 1 (Prompt Ambiguity): {diag1.diagnosis} (Confidence: {diag1.confidence})")
    assert diag1.diagnosis == "PROMPT_AMBIGUITY"
    assert "input_word_count" in diag1.evidence

    # Case 2: Retrieval Failure (Low retrieval/faithfulness with context)
    input_text = "What is the return window?"
    output_text = "Returns are accepted within 30 days."
    context = ["Company shipping policies state orders deliver in 3 business days."]
    res2 = evaluation_engine.evaluate_request(input_text, output_text, context=context)
    diag2 = failure_classifier.classify_and_diagnose(res2, input_text, output_text, context=context)
    print(f"  [OK] Diagnosis 2 (Retrieval Failure): {diag2.diagnosis} (Confidence: {diag2.confidence})")
    assert diag2.diagnosis in ["RETRIEVAL_FAILURE", "KNOWLEDGE_GAP"]
    assert "retrieval_score" in diag2.evidence or "context_length" in diag2.evidence

    # Case 3: Model Weakness Detection (Sample count >= 30, failure rate >= 50%)
    input_text = "Solve complex calculus integral"
    output_text = "Incorrect answer"
    res3 = evaluation_engine.evaluate_request(input_text, output_text)
    diag3 = failure_classifier.classify_and_diagnose(
        res3, input_text, output_text,
        historical_samples_count=35,
        historical_failure_rate=0.60
    )
    print(f"  [OK] Diagnosis 3 (Model Weakness): {diag3.diagnosis} (Confidence: {diag3.confidence})")
    assert diag3.diagnosis == "MODEL_WEAKNESS"
    assert diag3.evidence["historical_samples"] == 35

    # Case 4: Historical Failure Analyzer
    logs = [
        {"model": "mistral", "passed": False},
        {"model": "mistral", "passed": False},
        {"model": "mistral", "passed": True},
        {"model": "gpt-4o", "passed": True},
        {"model": "gpt-4o", "passed": True},
    ]
    analysis = historical_failure_analyzer.analyze_failure_rates(logs, group_by="model")
    print(f"  [OK] Historical analysis (mistral failure rate): {analysis['mistral']['failure_rate']}")
    assert analysis["mistral"]["failure_rate"] == 0.6667
    assert analysis["gpt-4o"]["failure_rate"] == 0.0

    print("Phase 4 Diagnosis Engine Test PASSED!")

if __name__ == "__main__":
    test_diagnosis_engine()
