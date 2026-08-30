import math
from typing import Dict, List, Tuple, Any
import numpy as np
from scipy import stats

class DriftDetectionEngine:
    @staticmethod
    def calculate_ks_test(baseline_data: List[float], current_data: List[float]) -> Tuple[float, float, bool]:
        """
        Performs 2-sample Kolmogorov-Smirnov Test.
        Returns: (ks_statistic, p_value, is_drifted)
        Score > 0.3 or p_value < 0.05 triggers drift flag.
        """
        if not baseline_data or not current_data:
            return 0.0, 1.0, False
        
        stat, p_val = stats.ks_2samp(baseline_data, current_data)
        is_drifted = bool(stat > 0.3 or p_val < 0.05)
        return float(stat), float(p_val), is_drifted

    @staticmethod
    def calculate_psi(baseline_data: List[float], current_data: List[float], num_bins: int = 10) -> float:
        """
        Calculates Population Stability Index (PSI).
        PSI > 0.2 indicates significant distribution shift.
        """
        if not baseline_data or not current_data:
            return 0.0
        
        baseline_arr = np.array(baseline_data)
        current_arr = np.array(current_data)

        # Quantile binning
        percentiles = np.linspace(0, 100, num_bins + 1)
        bins = np.percentile(baseline_arr, percentiles)
        bins[0] -= 1e-5
        bins[-1] += 1e-5

        baseline_counts, _ = np.histogram(baseline_arr, bins=bins)
        current_counts, _ = np.histogram(current_arr, bins=bins)

        # Convert to proportions with smoothing epsilon
        eps = 1e-4
        b_perc = (baseline_counts + eps) / (len(baseline_arr) + eps * num_bins)
        c_perc = (current_counts + eps) / (len(current_arr) + eps * num_bins)

        psi_val = np.sum((c_perc - b_perc) * np.log(c_perc / b_perc))
        return float(psi_val)

    @staticmethod
    def calculate_kl_divergence(p_dist: List[float], q_dist: List[float]) -> float:
        """
        Calculates Kullback-Leibler (KL) Divergence for discrete output probability distributions.
        """
        if not p_dist or not q_dist:
            return 0.0
        
        p = np.array(p_dist, dtype=float) + 1e-8
        q = np.array(q_dist, dtype=float) + 1e-8
        p /= np.sum(p)
        q /= np.sum(q)

        kl_div = stats.entropy(p, q)
        return float(kl_div)

    @staticmethod
    def isolate_root_cause_shap(feature_shifts: Dict[str, float]) -> Tuple[str, str]:
        """
        Identifies the feature with highest shift score.
        Returns (top_drifted_feature, diagnosis_summary)
        """
        if not feature_shifts:
            return "unknown", "No numerical feature shifts recorded."
        
        top_feature = max(feature_shifts, key=feature_shifts.get)
        max_score = feature_shifts[top_feature]

        if max_score > 0.3:
            diagnosis = f"Data Drift detected in primary feature '{top_feature}' (KS score: {max_score:.3f})."
            drift_type = "Data Drift"
        else:
            diagnosis = f"Concept Drift detected — accuracy drop observed without severe single-feature distribution shift."
            drift_type = "Concept Drift"

        return drift_type, diagnosis
