import logging
import math
import re
from typing import Any, Dict, Optional
from sentinel.core.config import settings
from ai.evaluation.metrics.base import BaseMetric, EvaluationResultSchema

logger = logging.getLogger(__name__)

# Lazy singleton for sentence transformer model
_TRANSFORMER_MODEL = None

def _get_transformer_model():
    global _TRANSFORMER_MODEL
    if _TRANSFORMER_MODEL is None:
        try:
            from sentence_transformers import SentenceTransformer
            _TRANSFORMER_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            logger.warning(f"Could not load sentence-transformers model 'all-MiniLM-L6-v2': {e}")
            _TRANSFORMER_MODEL = False
    return _TRANSFORMER_MODEL

def compute_vector_embedding(text: str, n: int = 3) -> Dict[str, float]:
    """Generates subword n-gram and token frequency vector embedding representation for text."""
    clean_text = text.lower().strip()
    if not clean_text:
        return {}

    vec: Dict[str, float] = {}
    # Token vector features
    words = re.findall(r'\w+|[^\w\s]', clean_text)
    for w in words:
        vec[f"tok_{w}"] = vec.get(f"tok_{w}", 0.0) + 1.0

    # Character subword n-gram vector features (n=3)
    padded = f"_{clean_text}_"
    for i in range(len(padded) - n + 1):
        gram = padded[i:i+n]
        vec[f"gram_{gram}"] = vec.get(f"gram_{gram}", 0.0) + 0.5

    return vec

def calculate_cosine_similarity(text1: str, text2: str) -> float:
    """Computes high-dimensional vector embedding cosine similarity."""
    model = _get_transformer_model()
    if model:
        try:
            embeddings = model.encode([text1, text2])
            vec1, vec2 = embeddings[0], embeddings[1]
            dot = sum(a * b for a, b in zip(vec1, vec2))
            norm1 = math.sqrt(sum(a * a for a in vec1))
            norm2 = math.sqrt(sum(b * b for b in vec2))
            if norm1 > 0 and norm2 > 0:
                return float(dot / (norm1 * norm2))
        except Exception as e:
            logger.warning(f"Transformer vector embedding calculation failed: {e}")

    # Sparse / Dense TF-IDF Subword Vector Embedding Cosine Similarity
    v1 = compute_vector_embedding(text1)
    v2 = compute_vector_embedding(text2)
    if not v1 or not v2:
        return 0.0

    dot = sum(val * v2[k] for k, val in v1.items() if k in v2)
    norm1 = math.sqrt(sum(val * val for val in v1.values()))
    norm2 = math.sqrt(sum(val * val for val in v2.values()))
    if norm1 > 0 and norm2 > 0:
        return float(dot / (norm1 * norm2))

    return 0.0

class CorrectnessMetric(BaseMetric):
    def __init__(self, threshold: Optional[float] = None):
        super().__init__(threshold=threshold or getattr(settings, "EVAL_CORRECTNESS_THRESHOLD", 0.75))

    def evaluate(
        self,
        input_text: str,
        output_text: str,
        expected_output: Optional[str] = None,
        context: Optional[Any] = None,
        latency_ms: float = 0.0,
    ) -> EvaluationResultSchema:
        if not output_text:
            return EvaluationResultSchema(
                metric_name="correctness",
                score=0.0,
                passed=False,
                confidence=1.0,
                reason="Output text is empty.",
                details={"layer": "validation"}
            )

        # Layer 1: Golden Evaluation Suite comparison against expected output
        if expected_output:
            similarity = calculate_cosine_similarity(output_text, expected_output)
            passed = similarity >= self.threshold
            confidence = 0.9 if _get_transformer_model() else 0.7
            return EvaluationResultSchema(
                metric_name="correctness",
                score=round(similarity, 4),
                passed=passed,
                confidence=confidence,
                reason=f"Semantic similarity with expected answer is {similarity:.2f} (threshold: {self.threshold}).",
                details={
                    "layer": "layer_1_golden_suite",
                    "similarity": similarity,
                    "threshold": self.threshold
                }
            )

        # Layer 2: Document Grounding / RAG context similarity
        if context:
            context_str = str(context)
            grounding_sim = calculate_cosine_similarity(output_text, context_str)
            rag_threshold = getattr(settings, "RAG_SIMILARITY_THRESHOLD", 0.60)
            passed = grounding_sim >= rag_threshold
            return EvaluationResultSchema(
                metric_name="correctness",
                score=round(grounding_sim, 4),
                passed=passed,
                confidence=0.8,
                reason=f"Document grounding similarity is {grounding_sim:.2f} (threshold: {rag_threshold}).",
                details={
                    "layer": "layer_2_grounding",
                    "similarity": grounding_sim,
                    "threshold": rag_threshold
                }
            )

        # Layer 3: Heuristic / Open-ended confidence assessment
        # Avoid claiming absolute truth when reference answer is missing
        if len(output_text.strip()) < 10:
            return EvaluationResultSchema(
                metric_name="correctness",
                score=0.4,
                passed=False,
                confidence=0.6,
                reason="Output is overly short or incomplete.",
                details={"layer": "layer_3_heuristics"}
            )

        return EvaluationResultSchema(
            metric_name="correctness",
            score=0.85,
            passed=True,
            confidence=0.65,
            reason="Unable to determine exact truth without reference answer, but output response structure appears well-formed.",
            details={"layer": "layer_3_heuristics", "note": "uncertainty_explicit"}
        )
