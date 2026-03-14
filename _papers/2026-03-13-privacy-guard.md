---
title: "Privacy Guard: Learning Privacy-Budgeted Active Sensing Policies via Reinforcement Learning in Smart Home Environments"
date: 2026-03-13
authors: "Mohammed Alshehri"
year: 2026
tldr: "We train LLM agents via GRPO to detect intrusions in smart homes under a finite privacy budget, finding that training distribution quality matters more than model scale: a 4B model on medium-difficulty scenarios outperforms a 30B MoE at half the compute."
highlights:
  - "131% improvement in detection recall over untrained LLM and rule-based baselines using GRPO on Prime Intellect."
  - "Training distribution matters more than model scale: Curriculum Medium (4B, 100 steps) beats 30B MoE (200 steps)."
  - "Chain-of-thought reasoning fails catastrophically in token-constrained multi-turn RL (97% truncation rate)."
  - "Near-perfect privacy compliance (0.994–0.995 identity safety) emerges without any explicit leakage penalty."
  - "Detection generalises across episode lengths; privacy budget management requires episode-length-specific training."
contributions:
  - "PrivacyGuardEnv: a multi-turn RL environment for privacy-budgeted active sensing with 24 scenarios across three difficulty tiers."
  - "GRPO training pipeline producing 131% detection improvement and 65% overall reward improvement over best hand-crafted baseline."
  - "Systematic architecture ablation revealing scale provides negligible benefit and CoT is structurally incompatible with token-constrained multi-turn RL."
  - "Curriculum learning result: static medium-difficulty filtering achieves best overall performance at half the compute."
  - "Phase 6 horizon scaling: clean dissociation between detection (horizon-invariant) and privacy management (horizon-sensitive)."
  - "Post-hoc privacy leakage framework with identity leakage proxy and reconstruction risk proxy metrics."
abstract: "We present Privacy Guard, a reinforcement learning framework for privacy-budgeted active sensing in smart homes. The agent detects intrusions by selectively activating cameras and microphones under a finite privacy budget, balancing security with minimal surveillance. Using GRPO, we run 12 experiments varying architecture (4B dense vs. 30B MoE), reasoning mode (standard vs. chain-of-thought), curriculum difficulty, and episode length. The main result is that training distribution matters more than model scale: a 4B model trained on medium-difficulty scenarios for 100 steps reaches 0.912 peak reward and 86.4% detection, outperforming a larger 30B MoE and substantially exceeding rule-based baselines. Chain-of-thought fails in this token-constrained multi-turn setting (97% truncation). Longer-horizon tests show strong detection generalisation but weaker privacy-budget management, identifying temporal budget planning as the key remaining challenge."
---

{::nomarkdown}
{% raw %}
{% include papers/issue-paper-2.html %}
{% endraw %}
{:/nomarkdown}
