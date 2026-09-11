import logging
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from sentinel.core.config import settings
from ai.evaluation.metrics.correctness import calculate_cosine_similarity
from ai.evaluation.metrics.retrieval_relevance import RetrievalRelevanceMetric
from ai.evaluation.metrics.context_completeness import ContextCompletenessMetric
from ai.evaluation.metrics.faithfulness import FaithfulnessMetric
from ai.evaluation.metrics.correctness import CorrectnessMetric

logger = logging.getLogger(__name__)

class RAGPipelineResult(BaseModel):
    query: str
    retrieved_documents: List[str]
    generated_answer: str
    expected_answer: Optional[str] = None
    retrieval_relevance: float = Field(ge=0.0, le=1.0)
    retrieval_recall: float = Field(ge=0.0, le=1.0)
    context_coverage: float = Field(ge=0.0, le=1.0)
    context_completeness: float = Field(ge=0.0, le=1.0)
    faithfulness: float = Field(ge=0.0, le=1.0)
    answer_correctness: float = Field(ge=0.0, le=1.0)
    overall_rag_score: float = Field(ge=0.0, le=1.0)
    query_expansion_variants: List[str] = Field(default_factory=list)
    reranked_scores: List[float] = Field(default_factory=list)
    passed: bool = True
    intermediate_metrics: Dict[str, Any] = Field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "retrieved_documents": self.retrieved_documents,
            "generated_answer": self.generated_answer,
            "expected_answer": self.expected_answer,
            "retrieval_relevance": self.retrieval_relevance,
            "retrieval_recall": self.retrieval_recall,
            "context_coverage": self.context_coverage,
            "context_completeness": self.context_completeness,
            "faithfulness": self.faithfulness,
            "answer_correctness": self.answer_correctness,
            "overall_rag_score": self.overall_rag_score,
            "query_expansion_variants": self.query_expansion_variants,
            "reranked_scores": self.reranked_scores,
            "passed": self.passed,
            "intermediate_metrics": self.intermediate_metrics,
        }

class RAGEvaluator:
    """
    Dedicated RAG Evaluation Engine testing end-to-end retrieval, context coverage, grounding, and answer accuracy.
    Pipeline:
    QUERY -> RETRIEVAL -> DOCUMENTS -> RELEVANCE SCORING -> CONTEXT COVERAGE -> LLM ANSWER -> GROUNDING -> CORRECTNESS
    """
    def __init__(self):
        self.relevance_metric = RetrievalRelevanceMetric()
        self.completeness_metric = ContextCompletenessMetric()
        self.faithfulness_metric = FaithfulnessMetric()
        self.correctness_metric = CorrectnessMetric()

    def expand_query(self, query: str) -> List[str]:
        """Generates query expansion variants for multi-query retrieval."""
        words = query.strip().split()
        variants = [query]
        if len(words) > 2:
            variants.append(f"Details on {query}")
            variants.append(f"What is {query}?")
        return list(dict.fromkeys(variants))

    def score_and_rerank_documents(self, query: str, documents: List[str]) -> List[float]:
        """Computes reranking relevance scores for each document relative to the query."""
        scores: List[float] = []
        for doc in documents:
            score = calculate_cosine_similarity(query, doc)
            scores.append(round(score, 4))
        return scores

    def evaluate_rag_pipeline(
        self,
        query: str,
        documents: List[str],
        generated_answer: str,
        expected_answer: Optional[str] = None,
        expected_context: Optional[List[str]] = None,
    ) -> RAGPipelineResult:

        threshold = getattr(settings, "RAG_SIMILARITY_THRESHOLD", 0.60)
        exp_variants = self.expand_query(query)
        rerank_scores = self.score_and_rerank_documents(query, documents)

        # 1. Retrieval Relevance (average relevance of retrieved docs to query)
        rel_eval = self.relevance_metric.evaluate(query, generated_answer, context=documents)
        retrieval_relevance = rel_eval.score

        # 2. Retrieval Recall (if ground truth context provided, check fraction matched)
        retrieval_recall = 1.0
        if expected_context:
            matched_count = 0
            for exp_doc in expected_context:
                max_sim = max([calculate_cosine_similarity(exp_doc, d) for d in documents], default=0.0)
                if max_sim >= threshold:
                    matched_count += 1
            retrieval_recall = round(matched_count / max(len(expected_context), 1), 4)

        # 3. Context Coverage & Completeness
        comp_eval = self.completeness_metric.evaluate(query, generated_answer, expected_output=expected_answer, context=documents)
        context_completeness = comp_eval.score
        context_coverage = round((retrieval_relevance + context_completeness) / 2.0, 4)

        # 4. Faithfulness / Grounding
        faith_eval = self.faithfulness_metric.evaluate(query, generated_answer, context=documents)
        faithfulness = faith_eval.score

        # 5. Answer Correctness
        corr_eval = self.correctness_metric.evaluate(query, generated_answer, expected_output=expected_answer, context=documents)
        answer_correctness = corr_eval.score

        # Aggregate overall RAG quality score:
        # Relevance (25%), Recall (15%), Coverage (20%), Faithfulness (20%), Correctness (20%)
        overall_rag_score = round(
            (retrieval_relevance * 0.25) +
            (retrieval_recall * 0.15) +
            (context_coverage * 0.20) +
            (faithfulness * 0.20) +
            (answer_correctness * 0.20),
            4
        )

        passed = overall_rag_score >= threshold and faithfulness >= 0.50

        intermediate_metrics = {
            "relevance_eval": rel_eval.to_dict(),
            "completeness_eval": comp_eval.to_dict(),
            "faithfulness_eval": faith_eval.to_dict(),
            "correctness_eval": corr_eval.to_dict(),
            "document_count": len(documents),
        }

        return RAGPipelineResult(
            query=query,
            retrieved_documents=documents,
            generated_answer=generated_answer,
            expected_answer=expected_answer,
            retrieval_relevance=retrieval_relevance,
            retrieval_recall=retrieval_recall,
            context_coverage=context_coverage,
            context_completeness=context_completeness,
            faithfulness=faithfulness,
            answer_correctness=answer_correctness,
            overall_rag_score=overall_rag_score,
            query_expansion_variants=exp_variants,
            reranked_scores=rerank_scores,
            passed=passed,
            intermediate_metrics=intermediate_metrics,
        )

rag_evaluator = RAGEvaluator()
