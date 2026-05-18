---
title: "Trace2Evolve: A Karpathy-Style AutoResearch Harness for Customer-Support Agents"
date: 2026-05-16
authors: "Mohammed Alshehri"
year: 2026
code: "https://github.com/mohammed840/trace2evolve-autoresearch"
description: "A research-style AutoResearch harness for improving tool-using customer-support agents using benchmark traces, heldout tau2 evaluations, synthetic pressure tests, and reliability-gated promotion."
tldr: "Trace2Evolve treats support-agent improvement as an offline experimental loop: run a locked benchmark, inspect traces, formulate a candidate patch, rerun heldout tasks, and promote the candidate only if reward and reliability improve together."
abstract: "Trace2Evolve is a proof-of-concept AutoResearch harness for tool-using customer-support agents. The system evaluates an agent on tau2-bench retail tasks, records structured execution traces, classifies recurring failure modes, proposes candidate instruction changes, and reruns heldout benchmark tasks before deciding whether to keep or discard the candidate. The central result is not a leaderboard claim; it is an end-to-end demonstration of a disciplined improvement protocol in which reward, pass rate, action-level tool discipline, max-step stability, and cross-domain regressions are measured before promotion."
---

Trace2Evolve is an attempt to translate the spirit of Karpathy-style AutoResearch into the domain of tool-using customer-support agents. In the original AutoResearch framing, the research object is not edited manually at every step. Instead, a small editable program is changed, a fixed evaluation is run, the evidence is written to a scoreboard, and only empirically useful changes are retained. Trace2Evolve follows the same pattern, but replaces neural pretraining with a support-agent setting in which the agent must authenticate users, inspect records, retrieve policies, call state-changing tools, and avoid unsafe or unsupported actions.

The project should therefore be read as a methodological prototype rather than as a chatbot demonstration. The central object is the improvement loop:

```text
locked benchmark -> trace evidence -> candidate patch -> heldout rerun -> reliability gate -> promote or discard
```

This framing matters because many agent improvements are difficult to evaluate from the final answer alone. A customer-support agent can produce a plausible message while skipping an authentication step, failing to inspect the relevant order, calling a mutation tool too early, or looping through unnecessary tool calls. Trace2Evolve records these intermediate decisions and treats them as part of the experimental evidence.

![Trace2Evolve research protocol](/assets/autoresearch-blog/trace2evolve_publishable_protocol.svg)

## 1. Motivation

Customer-support agents are a useful testbed for automated agent research because their failures are both linguistic and operational. The agent must understand vague customer language, but it must also act correctly in a structured environment. It must know when a request is only informational and when it implies a write action. It must use customer records without leaking private data. It must retrieve policy information when the answer depends on policy. It must ask for confirmation before changing state. These constraints make the domain more interesting than a pure text-response benchmark and more auditable than an open-ended assistant conversation.

Manual prompt tuning is a weak methodology for this type of system. A prompt can repair one visible failure while introducing a new failure on another class of requests. It can make responses sound more helpful while making tool use less disciplined. It can improve a development split and fail on a later holdout. Trace2Evolve was built to make those tradeoffs explicit. Every candidate change is evaluated as an experiment, and a candidate is promoted only when the evidence supports both task improvement and reliability preservation.

The project is inspired by Andrej Karpathy's [autoresearch](https://github.com/karpathy/autoresearch), but the domain shift is deliberate. In Trace2Evolve, the editable program is not a training script for a model; it is the candidate instruction surface and surrounding harness for a support agent. The fixed environment is not a text corpus; it is a benchmarked support world with records, tools, policies, and task-level scoring. The score is not validation loss; it is a combination of task reward, pass rate, action matching, and reliability checks.

## 2. System Design

Trace2Evolve separates the system into a locked evaluation layer, an editable candidate layer, a harness layer, and an evidence layer. The locked layer contains the support world and the scoring contract. The editable layer contains the program surface that can be changed by an AutoResearch loop. The harness runs evaluations, imports benchmark outputs, classifies failures, and writes experiment summaries. The evidence layer stores the scoreboard, traces, summaries, and project artifacts.

| Layer | Role in the research loop | Representative files |
| --- | --- | --- |
| Locked support world | Provides fixed policies, records, tools, and scoring contracts | `trace2evolve/locked/` |
| Editable candidate | Encodes the current hypothesis about how the support agent should behave | `trace2evolve/program.py` |
| Evaluation harness | Runs cases, scores traces, classifies failures, and writes summaries | `trace2evolve/evaluate.py`, `trace2evolve/autoresearch/` |
| Evidence artifacts | Preserve results for audit and comparison | `results/tau2_scores.tsv`, `runs/research/`, `blog.md` |

![Trace2Evolve architecture](/assets/autoresearch-blog/trace2evolve_architecture.svg)

This separation is the most important engineering choice in the project. The candidate is not allowed to silently modify the benchmark, the scoring code, or the locked support data. It can change the behavior of the agent, but the validity of the measurement depends on the environment remaining fixed. In that respect, the locked support world plays a role similar to `prepare.py` in a Karpathy-style research loop: it defines the external world against which candidate programs are measured.

## 3. Benchmark and Evaluation Protocol

The primary benchmark target in the current version is tau2-bench retail. Trace2Evolve runs the tau2 retail domain through an OpenRouter-backed GPT-5.4-mini support agent and then imports the benchmark output into its own research ledger. The project also includes a synthetic support holdout, but synthetic data is not treated as the main proof of improvement. It is used as a pressure test for rare or safety-relevant edge cases after a candidate has been frozen.

The evaluation protocol distinguishes four kinds of evidence. Discovery traces are used to identify recurring failure classes and formulate candidate hypotheses. A clean late-holdout split is used to evaluate a frozen candidate on task IDs that were not used to design that candidate. Development and ablation runs are used to compare variants and understand which rule contributed to a result. A cross-domain transfer check is used to test whether a retail-derived instruction also improves a different tau2 domain.

| Evidence type | Source | Role in the claim |
| --- | --- | --- |
| Discovery evidence | Earlier tau2 retail traces | Used to identify failure modes and candidate hypotheses |
| Clean heldout evidence | Retail tasks `100-113`, baseline versus frozen v5 | Treated as the cleanest benchmark proof in the current writeup |
| Development evidence | v5/v6 ablations on the late retail slice | Used to improve and diagnose the candidate, not treated as pristine holdout proof |
| Transfer evidence | tau2 airline tasks `40-49` | Used as a negative control for domain generality |
| Synthetic pressure evidence | 36 generated support cases | Used as a secondary safety and edge-case stress test |

The distinction between these evidence types is intentionally conservative. The v6 candidate obtains the strongest retail score, but the writeup does not present it as a pristine final-holdout result because v6 was informed by ablation work on the same late retail slice. The cleaner claim is that a frozen v5 candidate improved a later tau2 retail holdout from a reward of `0.000` to `0.214`. The v6 result is then reported as a stronger development result, not as an untouched final proof.

## 4. Metrics

The benchmark reward is the primary metric, but it is not sufficient by itself. A support agent is an operational system, and the intermediate tool trajectory matters. Trace2Evolve therefore tracks reward, pass rate, overall action match, read-action match, write-action match, max-step failures, and task-level reward regressions.

Action matching is included because an agent can sometimes reach an acceptable final answer through a poor process. In production, that is risky. A tool-using agent that answers correctly while skipping required reads, performing unnecessary calls, or preparing writes without sufficient evidence may fail badly under slight distribution shift. Action-level metrics give the evaluation more resolution than final reward alone.

| Metric | Interpretation |
| --- | --- |
| Reward | Whether the task succeeded under tau2 scoring |
| Pass rate | Fraction of tasks that reached full task success |
| Overall action match | Similarity between the observed tool trajectory and the expected behavior |
| Read-action match | Quality of information-gathering tool use |
| Write-action match | Quality of state-changing tool use |
| Max-step status | Whether the agent exhausted the interaction budget |
| Task regressions | Whether a previously passing task became failing |

The promotion rule requires improvement on the main outcome while blocking reliability regressions. A candidate is promoted only if reward improves, pass rate does not decline, action matching does not decline, no task regresses from reward one to reward zero, and no simulation hits a max-step failure.

## 5. Candidate Surface

The editable candidate lives in `trace2evolve/program.py`. The current candidate version is `tau2-retail-candidate-v6-conditional-details`. Conceptually, it is a refinement of the earlier v5 candidate. The v5 candidate introduced more careful handling of cross-order references, especially when a customer described a target item relationally, such as asking for a pending item to match an item already received. The v6 candidate keeps that behavior but makes account-wide detail retrieval conditional rather than always-on.

The relevant change is subtle. Always retrieving full user details can help when the customer lacks an order ID, refers to multiple orders, or asks for an account-level update. However, it can also distract the agent when the customer already provides a specific order ID and the request is narrow. The v6 candidate therefore instructs the agent to inspect user details when they are necessary for ambiguity resolution, account-level requests, or multi-record writes, while allowing direct order inspection for narrow requests with exact identifiers.

This is a small prompt-level modification, but the project treats it as a candidate hypothesis rather than as an assumed improvement. It is evaluated through benchmark runs and accepted only if the measured behavior supports the change.

## 6. Results

The project has three result categories: an initial 10-task holdout, a cleaner later-task holdout, and a v6 development result. The initial result on retail tasks `20-29` improved reward from `0.300` to `0.600` and write-action match from `0.267` to `0.800`. This was the first indication that the loop could improve an external benchmark slice rather than only synthetic examples.

The cleaner late-holdout comparison used retail tasks `100-113`, with 14 baseline traces and 14 frozen-v5 candidate traces. On this split, the baseline reward was `0.000` and the frozen v5 candidate reached `0.214`. Overall action match improved from `0.194` to `0.306`, and write-action match improved by the same amount. This result is modest, but it is the cleanest benchmark evidence because v5 had been fixed before the later v6 ablation work.

The later v6 candidate achieved stronger numbers on the same late retail slice. Reward increased from `0.000` to `0.429`, pass rate increased from `0.000` to `0.429`, and write-action match increased from `0.194` to `0.444`. The result is useful, but it is labeled as development evidence because v6 was designed after inspecting ablation behavior on that slice.

| Comparison | Tasks | Reward change | Write-action match change | Interpretation |
| --- | ---: | ---: | ---: | --- |
| Initial frozen v5 result | 10 | `0.300 -> 0.600` | `0.267 -> 0.800` | First external benchmark improvement |
| Late frozen v5 result | 14 | `0.000 -> 0.214` | `0.194 -> 0.306` | Cleanest heldout proof in the current report |
| Late v6 development result | 14 | `0.000 -> 0.429` | `0.194 -> 0.444` | Stronger result, but informed by ablations |

![Retail v6 metrics](/assets/autoresearch-blog/tau2_v6_holdout_metrics.svg)

The task-level results make the aggregate improvement more interpretable. Under v6, retail tasks 101, 102, 106, 107, 108, and 111 improved from reward zero to reward one. These cases generally required the agent to inspect records more carefully, resolve references across orders, or complete multiple related tool actions rather than stopping after a partial interpretation of the request.

## 7. Failure Analysis

The most informative failure class was cross-order ambiguity. The agent could often authenticate the customer and inspect records, but it struggled when the customer described the target item by relationship rather than by explicit identifier. Real customers rarely speak in database IDs. They say that they want the same item as the one they already received, or the other package, or the suitcase from the last order. A support agent should not immediately ask for an ID if the account records already make the reference uniquely resolvable.

Task 23 was the clearest example of this failure class. The customer made a multi-part retail request involving several orders and asked for a pending grill to match the same type as a grill already received. The earlier candidate interpreted the reference too locally and effectively matched the pending item against itself. The promoted candidate changed the instruction so that, when the customer says "same as the one I already received," the agent searches delivered orders for the referenced product type and uses the delivered item as the target reference. The important point is not that this rule is large; it is that the failure was discovered from trace evidence rather than from speculative prompt editing.

The v6 candidate still has unresolved weaknesses. Task 103 exposed a cancelled-order tracking case where the expected behavior involved communicating a tracking number that existed in the record. Task 110 exposed account-address inference and multi-action completion failures; the agent continued asking for a full address even though the available account data contained the relevant address, and it did not execute all expected write actions. Tasks 110 and 112 also show that the agent can prepare a multi-step support action but fail to complete every confirmed subtask.

These remaining failures are useful because they prevent the project from becoming an aggregate-metric story. The system improved, but it did not become solved. The failure taxonomy gives the next candidate a concrete research target: account-address inference, cancelled-order tracking, and complete execution of multi-action requests.

## 8. Transfer and Negative Evidence

The airline transfer experiment was included to test whether the retail-derived instruction behaved like a general service-agent improvement. It did not. On tau2 airline tasks `40-49`, the baseline reward was `0.600`, while the cross-domain v6-style instruction produced a reward of `0.400`. Action matching improved slightly, from `0.653` to `0.694`, but the primary reward declined and several task-level regressions appeared.

This is an important negative result. It shows that the reliability gate is not merely a way to bless improvements after the fact. It can reject a candidate whose tool behavior appears more disciplined on one metric but whose task outcomes are worse. For production agent development, this is the kind of failure the harness should catch before deployment.

## 9. Synthetic Data and Production Relevance

Synthetic data is used in Trace2Evolve as a pressure mechanism, not as the main source of truth. The project generates hidden-style support cases that stress failure categories such as vague refund requests, indirect address changes, missing order identifiers, policy-edge requests, subtle legal pressure, and multi-intent customer messages. These generated cases help expose rare or expensive failures before they appear in production conversations.

The production value of synthetic data is therefore not that it proves the agent improved. Real benchmark tasks and production-grade evaluation remain the stronger evidence. The value is that synthetic cases can expand the surface area of testing around known weaknesses. If trace analysis shows that the agent struggles with cross-order references, synthetic data can generate many variations of that pattern. If the agent mishandles vague refund pressure, synthetic cases can test indirect phrasing and policy-boundary language. The synthetic set becomes a controlled stress environment that helps detect regressions and safety failures earlier.

In a production support stack, this would correspond to an offline improvement loop. Live conversations would be logged and reviewed under a privacy policy. Failure patterns would be abstracted into evaluation cases. Synthetic variants would expand those patterns into a broader pressure suite. Candidate changes would then be promoted only after passing real benchmark slices, synthetic stress tests, and safety gates. Trace2Evolve implements a small version of that workflow.

## 10. Claims and Limitations

The current result should be interpreted narrowly. It does not show that Trace2Evolve beats all agents on tau2 retail. It does not show that v6 is independent of all late-split ablation evidence. It does not show that the retail-derived rule transfers to airline. It does not show that synthetic hidden holdout performance is equivalent to real benchmark performance. It also does not show that GPT-5.4-mini is the optimal operational model.

The claim is instead that a complete AutoResearch-style loop can be built around a tool-using customer-support agent, that the loop can discover trace-level failure modes, that a frozen candidate can improve a later tau2 retail holdout, that a stronger candidate can improve the same late retail slice under development evidence, and that the same gate can reject a cross-domain candidate when reward regresses.

This narrower claim is more useful than a broad benchmark claim because it captures the actual contribution of the project. Trace2Evolve is a controlled improvement protocol. It makes agent iteration measurable, auditable, and less dependent on subjective prompt editing.

## 11. Reproducibility

Trace2Evolve and tau2-bench use separate Python environments. The Trace2Evolve repository runs on Python 3.10 and contains the research harness, local support evals, synthetic generation, trace storage, and reporting utilities. The tau2 benchmark environment requires Python >=3.12,<3.14 and is run separately.

The main repository is available at [github.com/mohammed840/trace2evolve-autoresearch](https://github.com/mohammed840/trace2evolve-autoresearch). The core local commands are:

```bash
uv sync
uv run pytest tests
uv run python -m trace2evolve.prepare --json
uv run python -m trace2evolve.evaluate --json
```

The tau2 runs use OpenRouter-backed model identifiers and inject the candidate instruction through `TAU2_AGENT_EXTRA_INSTRUCTION`. The project records imported benchmark summaries in `results/tau2_scores.tsv`, with run summaries stored under `runs/research/`.

## 12. Conclusion

Trace2Evolve is a small experiment in making agent improvement look more like research and less like ad hoc prompt editing. The current system is not finished, and the benchmark sample is intentionally presented with caveats. However, the structure is the important part: a fixed environment, trace-level evidence, candidate hypotheses, heldout reruns, synthetic pressure tests, negative transfer checks, and reliability-gated promotion.

That structure is what makes the project useful. It demonstrates how a support-agent team could move from "we changed the prompt and it seems better" to "we changed the candidate, measured the effect on known and heldout tasks, inspected tool behavior, checked for regressions, and promoted only because the evidence supported it."
