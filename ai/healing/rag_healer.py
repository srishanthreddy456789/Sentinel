import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class RAGHealer:
    """Performs query expansion (5 candidate queries) and reranking for RAG retrieval failures."""

    def expand_query(self, original_query: str) -> List[str]:
        cleaned = original_query.strip()
        candidates = [
            cleaned,
            f"Detailed explanation for: {cleaned}",
            f"Key facts and context regarding {cleaned}",
            f"What are the specific guidelines for {cleaned}?",
            f"Summary of documentation on {cleaned}",
        ]
        return candidates

    def rerank_documents(self, query: str, documents: List[str]) -> List[str]:
        """Reranks retrieved document chunks using semantic similarity."""
        from ai.evaluation.metrics.correctness import calculate_cosine_similarity
        
        scored_docs = []
        for doc in documents:
            sim = calculate_cosine_similarity(query, doc)
            scored_docs.append((sim, doc))
        
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs]

rag_healer = RAGHealer()
