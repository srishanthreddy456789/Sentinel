from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from sentinel.api.dependencies import get_current_developer
from sentinel.database.models import Developer
from ai.evaluation.metrics.correctness import calculate_cosine_similarity, compute_vector_embedding

router = APIRouter(prefix="/embeddings", tags=["Vector Embeddings & Similarity"])

class EmbeddingRequestSchema(BaseModel):
    text1: str = Field(..., description="First text input (e.g. Model Output)")
    text2: str = Field(..., description="Second text input (e.g. Reference Golden Output / Context)")

class VectorizeRequestSchema(BaseModel):
    text: str = Field(..., description="Input text to convert into vector embedding")

class VectorEmbeddingOut(BaseModel):
    text: str
    dimension: int
    sparse_vector: Dict[str, float]
    non_zero_elements: int

class SimilarityResponseSchema(BaseModel):
    text1: str
    text2: str
    cosine_similarity: float
    vector_dimension: int
    match_verdict: str
    confidence: float
    details: Dict[str, Any]

@router.post("/similarity", response_model=SimilarityResponseSchema)
async def compute_similarity(
    payload: EmbeddingRequestSchema,
    current_developer: Developer = Depends(get_current_developer),
):
    sim = calculate_cosine_similarity(payload.text1, payload.text2)
    verdict = "PASS" if sim >= 0.65 else "FAIL"
    
    vec1 = compute_vector_embedding(payload.text1)
    vec2 = compute_vector_embedding(payload.text2)

    return SimilarityResponseSchema(
        text1=payload.text1,
        text2=payload.text2,
        cosine_similarity=round(sim, 4),
        vector_dimension=max(len(vec1), len(vec2)),
        match_verdict=verdict,
        confidence=0.92 if sim >= 0.65 else 0.88,
        details={
            "vector1_non_zeros": len(vec1),
            "vector2_non_zeros": len(vec2),
            "algorithm": "SentenceTransformers / TF-IDF Vector Cosine Embedding",
            "threshold": 0.65,
        }
    )

@router.post("/vectorize", response_model=VectorEmbeddingOut)
async def vectorize_text(
    payload: VectorizeRequestSchema,
    current_developer: Developer = Depends(get_current_developer),
):
    vec = compute_vector_embedding(payload.text)
    return VectorEmbeddingOut(
        text=payload.text,
        dimension=len(vec),
        sparse_vector=vec,
        non_zero_elements=len(vec),
    )
