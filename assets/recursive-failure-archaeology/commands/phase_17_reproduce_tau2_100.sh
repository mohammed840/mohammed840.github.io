#!/usr/bin/env bash
set -euo pipefail

DATASET="datasets/real/tau2_official_retail_100"

.venv/bin/python scripts/import_tau2_official_results.py \
  --limit 100 \
  --output-dir "$DATASET"

.venv/bin/python scripts/validate_dataset.py "$DATASET"
.venv/bin/python scripts/run_signal_detectors.py "$DATASET"
.venv/bin/python scripts/run_segmentation.py "$DATASET"
.venv/bin/python scripts/run_memory_archaeology.py "$DATASET"

.venv/bin/python scripts/build_tau2_labeling_packet.py "$DATASET" \
  --packet-output "$DATASET/labeling_packet.json" \
  --label-output "$DATASET/gold_labels.json" \
  --markdown-output "$DATASET/labeling_packet.md"

.venv/bin/python scripts/run_tau2_llm_judge.py "$DATASET" \
  --output "$DATASET/llm_judge_labels.json" \
  --model openai/gpt-5.5 \
  --resume \
  --live

.venv/bin/python scripts/validate_gold_labels.py "$DATASET" \
  --label-file "$DATASET/llm_judge_labels.json"

.venv/bin/python scripts/run_investigator_batch.py "$DATASET" \
  --experiment-id phase_17_rlm_gpt55_live_100 \
  --limit 100 \
  --segment-limit 6 \
  --root-model openai/gpt-5.5 \
  --segment-model openai/gpt-5.5 \
  --root-max-tokens 1600 \
  --segment-max-tokens 700 \
  --resume \
  --live

.venv/bin/python scripts/run_full_context_baseline_batch.py "$DATASET" \
  --experiment-id phase_17_full_context_gpt55_live_100 \
  --limit 100 \
  --root-model openai/gpt-5.5 \
  --live

.venv/bin/python scripts/run_scientific_benchmark.py "$DATASET" \
  --investigation-dir "$DATASET/experiments/phase_17_rlm_gpt55_live_100/investigations" \
  --method-id rlm_gpt55_llm_judge_100 \
  --label-file "$DATASET/llm_judge_labels.json" \
  --output "$DATASET/experiments/phase_17_rlm_gpt55_live_100/benchmark.json"

.venv/bin/python scripts/run_scientific_benchmark.py "$DATASET" \
  --investigation-dir "$DATASET/experiments/phase_17_full_context_gpt55_live_100/investigations" \
  --method-id full_context_gpt55_llm_judge_100 \
  --label-file "$DATASET/llm_judge_labels.json" \
  --output "$DATASET/experiments/phase_17_full_context_gpt55_live_100/benchmark.json"

.venv/bin/python scripts/compare_benchmarks.py \
  "$DATASET/experiments/phase_17_rlm_gpt55_live_100/benchmark.json" \
  "$DATASET/experiments/phase_17_full_context_gpt55_live_100/benchmark.json" \
  --output "$DATASET/experiments/phase_17_tau2_100_method_comparison.md"
