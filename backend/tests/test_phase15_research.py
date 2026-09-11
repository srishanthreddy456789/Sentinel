import asyncio
import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.generate_research_results import generate_all_research_artifacts

async def test_research_results_generation():
    print("Testing Phase 15 Research Result Generation & Paper Infrastructure...")

    await generate_all_research_artifacts()

    res_dir = Path(__file__).parent.parent.parent / "research"
    assert (res_dir / "results" / "table1_model_performance.md").exists()
    assert (res_dir / "results" / "table2_ablations.md").exists()
    assert (res_dir / "paper" / "sentinel_paper.md").exists()

    print("  [OK] Table 1 Model Performance Generated")
    print("  [OK] Table 2 Ablation Results Generated")
    print("  [OK] Research Paper Draft Generated")
    print("Phase 15 Research Result Generation Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test_research_results_generation())
