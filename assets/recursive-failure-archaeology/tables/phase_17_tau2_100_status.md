# Phase 17 Tau2 50/100-Trace Status Table

## Dataset

| Item | Value |
| --- | ---: |
| Official tau2 retail traces | 100 |
| Successful controls | 70 |
| Failed traces | 30 |
| Detected signals | 149 |
| Hierarchical segments | 802 |
| LLM-judge labels | 100 |
| LLM-judge validation errors | 0 |

## Complete 50-Trace Method Comparison

| Method | Reports | Semantic Root | Causal Consistency | Turn Error | Evidence Recall | Evidence Precision | Anchor Recall | Control Correct | False Positive | Parse Success |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rlm_gpt55_llm_judge_50 | 50/50 | 0.6535 | 0.7555 | 4.5400 | 0.8773 | 0.2673 | 0.7079 | 0.7838 | 0.2162 | 1.0000 |
| full_context_gpt55_llm_judge_50 | 50/50 | 0.8351 | 0.8783 | 1.1429 | 0.9075 | 0.4528 | 0.6222 | 1.0000 | 0.0000 | 0.9800 |

## Completion Status

| Component | Status |
| --- | --- |
| 100-trace import | complete |
| Signals/segments/memory | complete |
| GPT-5.5 LLM-as-judge labels | complete |
| RLM GPT-5.5 investigations | complete for 50-trace comparison |
| Full-context GPT-5.5 investigations | complete for 50-trace comparison |
| Final 50-trace method comparison | complete |
| Final 100-trace method comparison | deferred |
