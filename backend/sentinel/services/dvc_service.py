import hashlib
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

class DVCService:
    """
    Service for dataset versioning and reproducibility across evaluation runs.
    Tracks dataset files under data/ subdirectories and generates deterministic dataset version hashes.
    """
    def __init__(self, data_root: Optional[Path] = None):
        self.data_root = data_root or (Path(__file__).parent.parent.parent.parent / "data")
        self._ensure_directories()

    def _ensure_directories(self):
        subdirs = ["golden", "rag", "safety", "regression", "benchmarks"]
        for d in subdirs:
            (self.data_root / d).mkdir(parents=True, exist_ok=True)

    def get_dataset_version_hash(self, dataset_category: str, filename: str) -> str:
        """Computes deterministic SHA256 hash for a dataset file."""
        file_path = self.data_root / dataset_category / filename
        if not file_path.exists():
            # If dataset file doesn't exist on disk yet, return deterministic name-based hash
            return f"v1-{hashlib.sha256(f'{dataset_category}/{filename}'.encode()).hexdigest()[:8]}"
        
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(8192):
                hasher.update(chunk)
        return f"dvc-{hasher.hexdigest()[:12]}"

    def save_dataset_version(
        self,
        dataset_category: str,
        filename: str,
        records: List[Dict[str, Any]],
        description: str = ""
    ) -> Dict[str, Any]:
        """Saves evaluation dataset file and returns version tracking metadata."""
        file_path = self.data_root / dataset_category / filename
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump({"records": records, "description": description}, f, indent=2)

        version_hash = self.get_dataset_version_hash(dataset_category, filename)
        logger.info(f"Saved dataset '{dataset_category}/{filename}' (Version: {version_hash}, {len(records)} records).")
        
        return {
            "dataset_category": dataset_category,
            "filename": filename,
            "dataset_version": version_hash,
            "record_count": len(records),
            "file_path": str(file_path),
        }

dvc_service = DVCService()
