---
title: "Privacy Guard: Learning Privacy-Budgeted Active Sensing Policies via Reinforcement Learning in Smart Home Environments"
date: 2026-03-13
authors: "Mohammed Alshehri"
year: 2026
code: "https://github.com/mohammed840/privacy-guard"
tldr: "We train LLM agents using GRPO to perform privacy-budgeted active sensing in smart homes, achieving a 131% detection improvement over baselines while emergent budget-efficient behaviour produces near-perfect privacy compliance as a side-effect."
highlights:
  - "Training distribution matters more than model scale: a 4B model on medium scenarios outperforms a 30B MoE at half the compute."
  - "Chain-of-thought reasoning is structurally incompatible with token-constrained multi-turn RL (97% truncation)."
  - "Privacy compliance (0.994–0.995 identity safety) emerges without any explicit leakage penalty—purely as a consequence of budget efficiency."
contributions:
  - "PrivacyGuardEnv: a multi-turn RL environment with 24 scenarios across three difficulty tiers and configurable episode length."
  - "GRPO training pipeline producing a 131% improvement in detection recall and 65% improvement in overall reward over the best rule-based baseline."
  - "Systematic architecture ablation revealing that CoT reasoning is incompatible with token-constrained multi-turn RL."
  - "Curriculum learning result: medium-difficulty static filtering achieves best performance at half the training compute."
  - "Phase 6 horizon scaling: clean dissociation between detection (horizon-invariant) and privacy management (horizon-sensitive)."
  - "Post-hoc privacy leakage framework with identity leakage proxy and reconstruction risk proxy metrics."
abstract: "We present Privacy Guard, a reinforcement learning framework for privacy-budgeted active sensing in smart homes. The agent detects intrusions by selectively activating cameras and microphones under a finite privacy budget, balancing security with minimal surveillance. Using GRPO, we run 12 experiments varying architecture (4B dense vs. 30B MoE), reasoning mode (standard vs. chain-of-thought), curriculum difficulty, and episode length. The main result is that training distribution matters more than model scale: a 4B model trained on medium-difficulty scenarios for 100 steps reaches 0.912 peak reward and 86.4% detection, outperforming a larger 30B MoE and substantially exceeding rule-based baselines. Chain-of-thought fails in this token-constrained multi-turn setting (97% truncation). Longer-horizon tests show strong detection generalisation but weaker privacy-budget management, identifying temporal budget planning as the key remaining challenge."
---

{::nomarkdown}
{% include papers/issue-paper-2.html %}
{:/nomarkdown}
