import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from ai.evaluation.rag_evaluator import rag_evaluator

def test_rag_pipeline_evaluator():
    print("Testing Phase 5 RAG Evaluation Pipeline & Context Optimization...")

    query = "What is SENTINEL's return policy window?"
    documents = [
        "SENTINEL support documentation: Customer returns are accepted within 30 calendar days of invoice date.",
        "SENTINEL shipping policy: Standard ground shipping takes 3 to 5 business days across USA.",
    ]
    generated_answer = "SENTINEL accepts customer returns within 30 calendar days of invoice date."
    expected_answer = "Returns are accepted within 30 days."
    expected_context = ["Customer returns are accepted within 30 calendar days of invoice date."]

    rag_res = rag_evaluator.evaluate_rag_pipeline(
        query=query,
        documents=documents,
        generated_answer=generated_answer,
        expected_answer=expected_answer,
        expected_context=expected_context,
    )

    res_dict = rag_res.to_dict()
    print(f"  [OK] Overall RAG Score: {rag_res.overall_rag_score} (Passed: {rag_res.passed})")
    print(f"  [OK] Retrieval Relevance: {rag_res.retrieval_relevance}")
    print(f"  [OK] Retrieval Recall: {rag_res.retrieval_recall}")
    print(f"  [OK] Context Coverage: {rag_res.context_coverage}")
    print(f"  [OK] Faithfulness: {rag_res.faithfulness}")
    print(f"  [OK] Answer Correctness: {rag_res.answer_correctness}")
    print(f"  [OK] Query Expansions: {rag_res.query_expansion_variants}")
    print(f"  [OK] Reranked Scores: {rag_res.reranked_scores}")

    assert rag_res.retrieval_relevance > 0.0
    assert rag_res.retrieval_recall == 1.0
    assert rag_res.faithfulness > 0.0
    assert len(rag_res.query_expansion_variants) >= 1
    assert len(rag_res.reranked_scores) == len(documents)
    assert "document_count" in res_dict["intermediate_metrics"]

    print("Phase 5 RAG Evaluator Test PASSED!")

if __name__ == "__main__":
    test_rag_pipeline_evaluator()
