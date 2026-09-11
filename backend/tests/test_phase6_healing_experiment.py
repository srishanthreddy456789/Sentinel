import asyncio
import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from ai.healing.prompt_healer import prompt_healer
from ai.healing.verifier import healing_verifier
from ai.experiments.ab_experiment import ab_experiment_runner

async def test_healing_and_ab_experiment():
    print("Testing Phase 6 Self-Healing Engine, Verification Gates & A/B Experimentation...")

    orig_prompt = "Answer the user question accurately."
    failing_inp = "How do I process a return?"
    failing_out = "Contact support"
    exp_out = "Visit account orders page and click Request Return."

    # 1. Candidate Prompt Generation
    healed_prompt = await prompt_healer.generate_healed_prompt(
        original_prompt=orig_prompt,
        failing_input=failing_inp,
        failing_output=failing_out,
        expected_output=exp_out,
        diagnosis_reason="Prompt instructions were incomplete.",
    )
    print(f"  [OK] Healed Candidate Prompt generated ({len(healed_prompt)} chars)")
    assert len(healed_prompt) > len(orig_prompt)

    # 2. Verification Gate Evaluation
    test_cases = [
        {"input_text": failing_inp, "expected_output": exp_out},
        {"input_text": "What is the warranty period?", "expected_output": "Warranty is 1 year from purchase."},
        {"input_text": "How long does shipping take?", "expected_output": "Shipping takes 3-5 business days."},
    ]
    verification_res = healing_verifier.verify_healing_candidate(
        original_artifact=orig_prompt,
        candidate_artifact=healed_prompt,
        test_cases=test_cases,
        diagnosis="PROMPT_QUALITY",
    )
    print(f"  [OK] Verification Decision: {verification_res.decision} (Reason: {verification_res.reasoning})")
    assert verification_res.decision in ["PROMOTE", "REJECT", "NEEDS_REVIEW"]
    assert "overall_score_change" in verification_res.metric_changes

    # 3. A/B Experiment Execution
    ab_result = ab_experiment_runner.run_experiment(
        experiment_id="exp-test-phase6",
        variant_a_prompt=orig_prompt,
        variant_b_prompt=healed_prompt,
        dataset=test_cases,
    )
    print(f"  [OK] A/B Experiment Winner: {ab_result.winner} (Relative Improvement: {ab_result.relative_improvement}%)")
    assert ab_result.sample_size == len(test_cases)
    assert ab_result.winner in ["Variant A (Baseline)", "Variant B (Candidate)", "Tie"]
    assert len(ab_result.confidence_interval_95) == 2

    print("Phase 6 Self-Healing & A/B Experiment Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test_healing_and_ab_experiment())
