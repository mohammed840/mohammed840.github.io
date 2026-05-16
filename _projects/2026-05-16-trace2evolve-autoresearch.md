---
title: "Trace2Evolve: A Karpathy-Style AutoResearch Harness for Customer-Support Agents"
date: 2026-05-16
authors: "Mohammed Alshehri"
year: 2026
code: "https://github.com/mohammed840/trace2evolve-autoresearch"
description: "An AutoResearch-style harness for improving tool-using customer-support agents with benchmark traces, heldout tau2 evaluations, and reliability-gated promotion."
tldr: "Trace2Evolve turns support-agent improvement into an evidence loop: run a locked benchmark, diagnose trace failures, propose a candidate patch, rerun heldout tasks, and promote only if reliability gates pass."
highlights:
  - "Improves tau2-bench retail heldout reward from 0.000 to 0.214 with a frozen v5 candidate, and to 0.429 with a v6 development candidate."
  - "Tracks both final task reward and operational behavior through read/write action-match metrics."
  - "Uses reliability gates to reject candidates that regress reward, pass rate, action discipline, or max-step stability."
contributions:
  - "A Karpathy-style AutoResearch loop adapted to tool-using customer-support agents."
  - "A trace-driven failure taxonomy for cross-order ambiguity, under-inspection, unsafe writes, and max-step loops."
  - "A promotion protocol separating clean holdout evidence, development ablations, transfer checks, and synthetic pressure tests."
abstract: "Trace2Evolve is a proof-of-concept AutoResearch harness for improving customer-support agents. It evaluates a tool-using support agent on tau2-bench retail tasks, records traces, classifies failures, proposes candidate instruction changes, reruns heldout tasks, and promotes only candidates that improve reward while passing reliability gates. The project demonstrates a small but complete research loop: benchmark failure, trace diagnosis, candidate patch, heldout rerun, and reliability-gated promotion."
---

> A technical proof of concept for improving a tool-using retail support agent from real benchmark traces, unseen tau2 holdouts, and hard promotion gates.

Trace2Evolve is a small AutoResearch system for customer-support agents. The project is not only a chatbot demo. It is a controlled loop that runs an agent on a benchmark, records traces, scores the behavior, classifies failures, proposes a candidate program change, and promotes that candidate only when it improves heldout performance without breaking reliability constraints.

The current experiment uses the **tau2-bench retail** environment and evaluates a GPT-5.4-mini support agent with an editable Trace2Evolve candidate program. There are two kinds of evidence in the current writeup:

- a historical 10-task heldout result on retail tasks `20-29`, where v5 improved reward from **0.30 to 0.60**
- a cleaner later-task holdout on retail tasks `100-113`, where v5 improved reward from **0.000 to 0.214** before the v6 ablation work
- a v6 retail result on tasks `100-113`, where conditional user-detail retrieval improved reward from **0.000 to 0.429** and write-action match from **0.194 to 0.444**, but this should be treated as candidate-development evidence because v6 was informed by ablations on that same slice

That distinction matters. The cleanest benchmark proof is the frozen v5 late-holdout result. The v6 result is a stronger retail candidate result, but the blog labels it honestly instead of pretending it used a completely untouched final split.

This is intentionally framed as a research proof of concept, not a leaderboard claim. The important part is the shape of the result:

```text
locked benchmark -> trace evidence -> candidate patch -> heldout rerun -> reliability gate -> promote/discard
```

![Trace2Evolve research loop](/assets/autoresearch-blog/trace2evolve_research_loop.svg)

![Trace2Evolve publishable research protocol](/assets/autoresearch-blog/trace2evolve_publishable_protocol.svg)

## Abstract

Modern customer-support agents need more than fluent answers. They need to call the right tools, inspect the right records, obey policy, avoid unsafe write actions, and recover when a customer gives ambiguous or indirect instructions. Manual prompt tuning can improve isolated cases, but it often lacks a disciplined way to show whether a change generalizes.

Trace2Evolve turns support-agent improvement into an offline research loop. The system evaluates an agent on a locked benchmark, converts execution traces into measurable failure evidence, proposes an editable candidate change, reruns a heldout split, and accepts the change only if reward improves and reliability gates pass.

On the strongest v6 retail run, the candidate improved:

| Metric | Baseline | Candidate v6 | Delta |
| --- | ---: | ---: | ---: |
| Reward | 0.000 | 0.429 | +0.429 |
| Pass rate | 0.000 | 0.429 | +0.429 |
| Overall action match | 0.194 | 0.444 | +0.250 |
| Write action match | 0.194 | 0.444 | +0.250 |

![Retail v6 late-split metrics](/assets/autoresearch-blog/tau2_v6_holdout_metrics.svg)

The earlier 10-task result was stronger numerically:

| Metric | Baseline | Promoted v5 | Delta |
| --- | ---: | ---: | ---: |
| Reward | 0.300 | 0.600 | +0.300 |
| Pass rate | 0.300 | 0.600 | +0.300 |
| Overall action match | 0.423 | 0.769 | +0.346 |
| Read action match | 0.483 | 0.800 | +0.317 |
| Write action match | 0.267 | 0.800 | +0.533 |

![Before and after metrics](/assets/autoresearch-blog/tau2_metrics_before_after.svg)

The key technical result is not simply that one score went up. The system records which evidence is clean final-holdout proof, which evidence is candidate-development evidence, and which evidence is synthetic pressure testing. Synthetic cases were used only as a final pressure test, not as the primary benchmark evidence.

## Problem Statement

Customer-support agents are a useful testbed for AutoResearch because they combine language understanding with operational correctness. A realistic support agent must:

- authenticate the customer
- read account, order, product, and policy records
- distinguish answer-only requests from write-action requests
- ask for confirmation before changing state
- choose the correct tool sequence
- avoid hallucinating private or unavailable data
- stop instead of looping through unnecessary calls

These requirements make simple prompt tuning brittle. A prompt can fix one failure while creating a new failure elsewhere, such as:

- asking for an order ID even though the customer account already contains the order list
- modifying the wrong order item because a cross-order reference was ambiguous
- overusing tools after enough facts were collected
- calling a write tool without confirming the exact action
- getting stuck in max-step loops while trying to resolve a multi-part request

Trace2Evolve attacks that problem by making every improvement measurable. The system treats agent behavior as an experimental artifact: run it, score it, inspect failures, patch the candidate, rerun on different tasks, and keep only changes that pass gates.

## System Design

Trace2Evolve has four conceptual layers:

| Layer | Purpose | Example files |
| --- | --- | --- |
| Locked world | Fixed support environment, data, policies, tools, scoring contracts | `trace2evolve/locked/` |
| Editable candidate | The program surface that AutoResearch can change | `trace2evolve/program.py` |
| Harness | Prepare, run, score, and summarize experiments | `trace2evolve/prepare.py`, `trace2evolve/evaluate.py`, `trace2evolve/autoresearch/auto_tau2.py` |
| Evidence | Scoreboard, experiment logs, CLI demo transcript, blog assets | `results/`, `runs/research/`, `trace2evolve/demo/`, `assets/` |

![Trace2Evolve architecture](/assets/autoresearch-blog/trace2evolve_architecture.svg)

The important design choice is that the editable surface is small. The candidate is not allowed to silently mutate the benchmark, the scoring code, or the locked support world. It can change the agent instruction and harness logic, then the system measures whether that change actually helps.

## Relation to Karpathy-Style AutoResearch

The project follows the same core pattern as Karpathy-style AutoResearch:

| Karpathy-style concept | Trace2Evolve equivalent |
| --- | --- |
| `prepare.py` creates or exposes the task environment | `trace2evolve/prepare.py` plus tau2 benchmark data |
| `program.py` is the editable hypothesis | `trace2evolve/program.py` |
| `evaluate.py` scores the current program | `trace2evolve/evaluate.py` and tau2 scoring summaries |
| Scoreboard records experiment outcomes | `results/tau2_scores.tsv` |
| Promotion requires evidence | Reliability gate in `trace2evolve/autoresearch/auto_tau2.py` |

The difference is the domain. Instead of optimizing a pure coding or puzzle task, Trace2Evolve evaluates a **tool-using support agent** inside a retail environment where correct behavior depends on customer records, order state, product references, and policy constraints.

## Benchmark Protocol

The current benchmark target is **tau2-bench retail**. Trace2Evolve runs the tau2 retail domain through an OpenRouter-backed GPT-5.4-mini agent and user simulation, then imports the resulting scores into its research ledger.

The publishable split protocol is:

| Split | Source | Task IDs / Cases | Purpose | Used to design candidate? | Main proof? |
| --- | --- | --- | --- | --- | --- |
| Discovery | tau2 retail | earlier retail traces, including `0-49` style failure analysis | find failure modes and candidate hypotheses | yes | no |
| Clean late holdout | tau2 retail | `100-113` baseline vs v5 | frozen v5 comparison after earlier candidate design | no for v5 | yes |
| Dev / ablation | tau2 retail | v5/v6 ablations on `100-113` | compare candidate rules and diagnose over-constraint | yes for v6 | no |
| Transfer check | tau2 airline | `40-49` | test whether the retail-derived rule transfers outside retail | no | no, negative control |
| Synthetic hidden holdout | generated support cases | 36 cases, `POST-FREEZE-001` | final safety pressure test after candidate freeze | no | secondary only |

Retail only has task IDs `0-113`, so the originally desired `100-149` final holdout was capped to the real available tau2 retail range, `100-113`.

![Late split protocol](/assets/autoresearch-blog/tau2_late_split_protocol.svg)

The core rule is simple: **real tau2 benchmark tasks are the evidence for improvement**. Synthetic data helps stress safety and edge cases, but it is not the primary proof that AutoResearch improved the agent. When a split is reused for ablation or candidate design, the writeup marks it as development evidence rather than pristine holdout proof.

The current artifacts record:

| Field | Value |
| --- | --- |
| Benchmark | tau2-bench retail |
| Initial holdout split | retail tasks 20-29 |
| Final holdout split | retail tasks 100-113 |
| Initial baseline run | `trace2evolve_retail_20_29_holdout_default` |
| Initial candidate run | `trace2evolve_retail_20_29_candidate_v5` |
| Final baseline run | `trace2evolve_retail_100_113_baseline` |
| Final v5 run | `trace2evolve_retail_100_113_candidate_v5` |
| Final v6 run | `trace2evolve_retail_100_113_candidate_v6` |
| Clean late-holdout candidate | `tau2-retail-candidate-v5-reliable-cross-order` |
| Development candidate | `tau2-retail-candidate-v6-conditional-details` |
| Editable file | `trace2evolve/program.py` |
| Decision | `promote` |
| Scoreboard | `results/tau2_scores.tsv` |
| Initial promoted summary | `runs/research/tau2_harness/2026-05-16T164149Z0000.json` |
| Late-holdout summary | `runs/research/tau2_harness/2026-05-16T173334Z0000.json` |
| v6 retail summary | `runs/research/tau2_expansion/v6_retail_summary.json` |

![Evaluation split design](/assets/autoresearch-blog/tau2_eval_protocol.svg)

The split is small, but the protocol matters:

1. The benchmark environment is external and fixed.
2. The candidate is run on task IDs that are distinct from the original discovery examples.
3. The scoring includes reward and action-level matching, not only final text quality.
4. A candidate can improve reward and still fail promotion if it introduces reliability problems.

## Metrics

Trace2Evolve tracks both task-level outcome and behavioral discipline.

| Metric | Meaning |
| --- | --- |
| Reward | tau2 task reward, usually 0 or 1 for whether the task succeeded |
| Pass rate | fraction of tasks with full success |
| Overall action match | how closely the tool-action trajectory matches expected behavior |
| Read action match | quality of read-only information-gathering tool usage |
| Write action match | quality of state-changing tool usage |
| Max-step status | whether the agent got trapped and exhausted the simulation budget |
| Task reward regressions | whether any previously passing task became failing |

Why action matching matters: a support agent can sometimes stumble into a correct final answer with a poor tool path. In production, that is risky. The agent might answer correctly once but use too many calls, skip required lookups, or perform writes without enough evidence. Action metrics catch that class of failure.

![Action match breakdown](/assets/autoresearch-blog/tau2_action_match_breakdown.svg)

## Candidate Surface

The editable candidate lives in `trace2evolve/program.py` and injects extra instructions into the tau2 agent. The current candidate is:

```python
VERSION = "tau2-retail-candidate-v6-conditional-details"
```

Conceptually, v6 keeps the useful v5 cross-order behavior but makes account-detail retrieval conditional:

1. **Inspect account details only when needed.**
   After successful authentication, call `get_user_details` when the customer lacks order IDs, uses ambiguous references, asks account-level questions, or the write depends on linked records.

2. **Avoid unnecessary detail retrieval.**
   If the customer gives an exact order ID and the request is narrow, inspect that order directly instead of forcing an extra account-wide lookup.

3. **Resolve cross-order references carefully.**
   For phrases like "same as the one I already received," inspect delivered orders and use the delivered item as the target reference. Never modify an item to the same item ID it already has.

4. **Handle all matching records.**
   For requests like "all pending orders," inspect the linked order list and act on every matching record, not only the first one.

The v5 candidate was the clean late-holdout proof. The v6 candidate is the improved retail candidate produced after the ablation study showed that always-on user-detail retrieval was too rigid.

![Candidate lifecycle](/assets/autoresearch-blog/tau2_candidate_lifecycle.svg)

## Experimental Result

The clean late-holdout proof uses 28 benchmark traces:

- 14 baseline traces on retail tasks `100-113`
- 14 v5 candidate traces on the same retail tasks `100-113`

This is the clean comparison for the frozen v5 candidate: same tasks, same model, same benchmark, different candidate instruction.

| Metric | Baseline | Candidate v5 | Absolute delta | Relative lift |
| --- | ---: | ---: | ---: | ---: |
| Reward | 0.000 | 0.214 | +0.214 | n/a |
| Pass rate | 0.000 | 0.214 | +0.214 | n/a |
| Overall action match | 0.194 | 0.306 | +0.111 | +57.1% |
| Write action match | 0.194 | 0.306 | +0.111 | +57.1% |

![Late holdout metrics](/assets/autoresearch-blog/tau2_late_holdout_metrics.svg)

The later v6 candidate was evaluated on the same retail slice after the ablation study. This result is stronger numerically, but it is labeled as candidate-development evidence because v6 was informed by ablations on this slice.

| Metric | Baseline | Candidate v6 | Absolute delta | Relative lift |
| --- | ---: | ---: | ---: | ---: |
| Reward | 0.000 | 0.429 | +0.429 | n/a |
| Pass rate | 0.000 | 0.429 | +0.429 | n/a |
| Overall action match | 0.194 | 0.444 | +0.250 | +128.6% |
| Write action match | 0.194 | 0.444 | +0.250 | +128.6% |

![Retail v6 late-split metrics](/assets/autoresearch-blog/tau2_v6_holdout_metrics.svg)

Six retail tasks improved from reward 0 to reward 1 under v6:

| Task | Baseline reward | Candidate reward | Decision |
| --- | ---: | ---: | --- |
| 101 | 0.0 | 1.0 | improved |
| 102 | 0.0 | 1.0 | improved |
| 106 | 0.0 | 1.0 | improved |
| 107 | 0.0 | 1.0 | improved |
| 108 | 0.0 | 1.0 | improved |
| 111 | 0.0 | 1.0 | improved |

No task regressed from reward 1 to reward 0 because the baseline passed none of the late-holdout tasks.

![Late holdout task deltas](/assets/autoresearch-blog/tau2_late_task_delta_grid.svg)

The original 10-task holdout result remains useful as the first proof that the loop could improve an external benchmark slice:

| Metric | Baseline | Candidate v5 | Absolute delta | Relative lift |
| --- | ---: | ---: | ---: | ---: |
| Reward | 0.300 | 0.600 | +0.300 | +100.0% |
| Pass rate | 0.300 | 0.600 | +0.300 | +100.0% |
| Overall action match | 0.423 | 0.769 | +0.346 | +81.8% |
| Read action match | 0.483 | 0.800 | +0.317 | +65.5% |
| Write action match | 0.267 | 0.800 | +0.533 | +200.0% |

![Before and after metrics](/assets/autoresearch-blog/tau2_metrics_before_after.svg)

The largest relative improvement in the first result was write-action matching. The late-holdout result is more modest, but it repeats the same direction: reward, pass rate, and write-action match all improve on unseen later tasks.

## Task-Level Outcomes

The initial holdout split contains tasks 20-29. Three tasks improved from reward 0 to reward 1. No task regressed from reward 1 to reward 0.

| Task ID | Baseline reward | Candidate reward | Baseline action match | Candidate action match | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| 20 | 0.0 | 0.0 | 0.800 | 0.600 | same |
| 21 | 0.0 | 1.0 | 0.250 | 0.750 | improved |
| 22 | 1.0 | 1.0 | 1.000 | 1.000 | same |
| 23 | 0.0 | 1.0 | 0.417 | 0.917 | improved |
| 24 | 0.0 | 1.0 | n/a | n/a | improved |
| 25 | 1.0 | 1.0 | 0.333 | 1.000 | same |
| 26 | 1.0 | 1.0 | 0.875 | 0.750 | same |
| 27 | 0.0 | 0.0 | 0.000 | 0.000 | same |
| 28 | 0.0 | 0.0 | 0.091 | 0.909 | same |
| 29 | 0.0 | 0.0 | 0.000 | 0.833 | same |

![Task reward deltas](/assets/autoresearch-blog/tau2_task_delta_grid.svg)

The table shows a subtle but useful distinction. Tasks 28 and 29 still failed by reward, but their action match improved substantially. That suggests the candidate moved the agent closer to the correct procedure even when the final outcome was still not perfect.

## Failure Analysis

The most useful failure cluster was not "the model is dumb" or "the benchmark is hard." It was more specific:

```text
The agent can authenticate a customer and inspect records, but it sometimes fails
to resolve cross-order references when the customer describes a target item by
relationship instead of by ID.
```

That cluster matters because real customers rarely speak in database IDs. They say things like:

- "the suitcase from my last order"
- "the same grill I already received"
- "the helmet I bought with the jacket"
- "the other package, not this one"
- "the one that has not shipped yet"

The earlier agent often responded by asking for more identifiers. That is safe, but weak. A better support agent should first inspect available account data and resolve the reference if the records make it unique.

## Case Study: Task 23

Task 23 was the clearest research signal. The customer had a multi-part retail request involving multiple orders:

- exchange a helmet
- exchange a luggage set
- modify a pending grill order
- make the pending grill match the same type as a grill already received

The earlier candidate failed because it interpreted "same type as the one I already received" too locally. It matched the pending grill against itself, then asked for extra confirmation and eventually hit a max-step failure.

The promoted candidate changed the behavior:

```text
If the user says "same as the one I already received,"
search delivered orders for the referenced product type.
Use the delivered item as the target reference.
Do not modify an item to itself.
```

![Task 23 trace repair](/assets/autoresearch-blog/tau2_task23_trace_repair.svg)

This is exactly the kind of failure that makes AutoResearch useful. The fix is small, but the failure is hard to find by staring at a generic chatbot transcript. It appears when a benchmark run exposes a concrete mismatch between expected tool behavior and actual tool behavior.

## Trace Examples

Metrics say what changed. Trace examples show why the change matters.

### Example 1: Retail Task 101, Multi-Order Write Recovery

Task 101 required the agent to modify an address and two pending-order items across different retail orders.

| Run | Reward | Write actions matched | What happened |
| --- | ---: | ---: | --- |
| Baseline | 0.0 | 0/3 | The conversation stopped after the initial user request, so no required writes happened. |
| v6 | 1.0 | 3/3 | The agent authenticated the user, loaded linked orders, found the requested watch and air-purifier variants, asked for explicit confirmation, then performed all three writes. |

The v6 trace followed the production-safe shape:

```text
authenticate -> get user details -> inspect relevant orders -> inspect products
-> summarize intended changes -> ask for confirmation -> write all confirmed changes
```

This is the kind of improvement the project is trying to measure: not just a nicer final answer, but the right operational sequence.

### Example 2: Retail Task 110, Remaining Failure

Task 110 shows what still fails after v6. The expected behavior included:

```text
modify pending order address
modify user address
modify pending order item
```

v6 failed all three write checks. The judge explanation in the tau2 result says the agent kept asking the user to provide a full new address instead of using or clarifying the account address already available in records. It also prepared the tablet exchange but did not execute the final write.

This is useful because it identifies a remaining failure class: **account-address inference and multi-action completion**.

### Example 3: Airline Transfer Check, Negative Result

The airline experiment was deliberately included to avoid a retail-only story. It did not pass.

| Run | Reward | Action match | Decision |
| --- | ---: | ---: | --- |
| Airline baseline | 0.600 | 0.653 | baseline |
| Airline v6 cross-domain | 0.400 | 0.694 | discard |

The cross-domain instruction improved action matching, but hurt task reward and introduced three reward regressions. That means the retail-derived rule is not a general service-agent improvement yet. The reliability gate correctly rejected it.

## V6 Failure Analysis

After v6, the retail result is better but not solved. The remaining failures are specific:

| Failure class | Evidence | Why it matters |
| --- | --- | --- |
| Cancelled-order tracking | Task 103 expected tracking number `286422338955`; v6 transferred or failed to communicate it | The agent must not assume cancelled orders never have tracking data if the record exposes it |
| Account-address inference | Task 110 expected use of the account/order address `760 Elm Avenue`; v6 kept asking for a full address | The agent needs better logic for "use the address already on file" |
| Multi-action completion | Tasks 110 and 112 had several write checks where the agent prepared or discussed changes but did not execute all required writes | Support workflows often require completing every confirmed subtask, not only the easiest one |
| Cross-domain transfer | Airline tasks 41, 47, and 48 regressed from reward 1 to 0 | Retail prompt repairs do not automatically become airline prompt repairs |

This failure analysis is part of the research value. It prevents the blog from claiming the loop is done just because one aggregate number improved.

## Reliability Gate

Trace2Evolve does not promote a candidate just because aggregate reward improves. A candidate must pass a stricter reliability gate.

![Reliability gate](/assets/autoresearch-blog/tau2_reliability_gate.svg)

The v5 candidate passed all checks:

| Gate check | Required condition | v5 result |
| --- | --- | --- |
| Reward improved | candidate reward > baseline reward | pass |
| Pass rate not worse | candidate pass rate >= baseline pass rate | pass |
| Overall action not worse | candidate overall action match >= baseline | pass |
| Read action not worse | candidate read action match >= baseline | pass |
| Write action not worse | candidate write action match >= baseline | pass |
| No task reward regressions | no 1.0 -> 0.0 reward transitions | pass |
| No max-step loops | no task exhausts simulation budget | pass |

![Reliability matrix](/assets/autoresearch-blog/tau2_reliability_matrix.svg)

This gate is what separated v5 from an earlier candidate:

| Candidate | Reward delta | Issue | Decision |
| --- | ---: | --- | --- |
| `tau2-retail-candidate-v3-reliability` | +0.100 | still hit `no_max_steps` gate | evidence only |
| `tau2-retail-candidate-v5-reliable-cross-order` | +0.300 | no failed checks | promote |

This matters for credibility. Without the reliability gate, a candidate could get one or two more tasks right while becoming less stable or less disciplined. The project should reject that kind of change.

On the late holdout, the gate also passes after treating unavailable read-action metrics as not applicable rather than failed. That matters because tasks `100-113` only exposed write-action checks in the tau2 summary; there was no separate read-action denominator to compare.

## Research Ledger

Trace2Evolve records experiments in a scoreboard so the story is auditable.

The key row in `results/tau2_scores.tsv` is:

| Field | Value |
| --- | --- |
| created_at | `2026-05-16T16:41:49+00:00` |
| candidate_version | `tau2-retail-candidate-v5-reliable-cross-order` |
| train_slice | `retail tasks 0-23 plus task-specific reliability smoke` |
| holdout_slice | `retail tasks 20-29` |
| before_run | `trace2evolve_retail_20_29_holdout_default` |
| after_run | `trace2evolve_retail_20_29_candidate_v5` |
| reward_delta | `+0.300000` |
| action_match_delta | `+0.346154` |
| reliability_status | `promote` |
| decision | `keep` |

The summary artifact is:

```text
runs/research/tau2_harness/2026-05-16T164149Z0000.json
```

The stronger late-holdout row is:

| Field | Value |
| --- | --- |
| created_at | `2026-05-16T17:34:21+00:00` |
| candidate_version | `tau2-retail-candidate-v5-reliable-cross-order-late-holdout` |
| train_slice | `retail tasks 0-49 discovery; retail tasks 50-99 dev` |
| holdout_slice | `retail tasks 100-113 late split; treated as v6 development evidence` |
| before_run | `trace2evolve_retail_100_113_baseline` |
| after_run | `trace2evolve_retail_100_113_candidate_v5` |
| reward_delta | `+0.214286` |
| action_match_delta | `+0.111111` |
| reliability_status | `promote` |
| decision | `keep` |

The late-holdout summary artifact is:

```text
runs/research/tau2_harness/2026-05-16T173334Z0000.json
```

The v6 retail candidate row is:

| Field | Value |
| --- | --- |
| created_at | `2026-05-16T19:15:11+00:00` |
| candidate_version | `tau2-retail-candidate-v6-conditional-details` |
| train_slice | `retail tasks 0-99 plus ablation evidence` |
| holdout_slice | `retail tasks 100-113 final holdout` |
| before_run | `trace2evolve_retail_100_113_baseline` |
| after_run | `trace2evolve_retail_100_113_candidate_v6` |
| reward_delta | `+0.428571` |
| action_match_delta | `+0.250000` |
| reliability_status | `promote` |
| decision | `keep` |
| summary_path | `runs/research/tau2_expansion/v6_retail_summary.json` |

The airline transfer check is recorded separately and was rejected:

| Field | Value |
| --- | --- |
| candidate_version | `tau2-v6-cross-domain-service` |
| holdout_slice | `airline tasks 40-49 transfer check` |
| before_run | `trace2evolve_airline_40_49_baseline` |
| after_run | `trace2evolve_airline_40_49_candidate_v6` |
| reward_delta | `-0.200000` |
| action_match_delta | `+0.040816` |
| reliability_status | `discard` |
| failed_checks | `reward_improved`, `pass_rate_not_worse`, `no_task_reward_regressions` |

These summaries include aggregate metrics, task-level deltas, reliability checks, and the path back to the tau2 root.

## Why This Helps Production

In production, this kind of system is useful because it gives the team a safer improvement loop:

| Production concern | Trace2Evolve mechanism |
| --- | --- |
| Did the agent improve or just sound better? | Run fixed benchmark and compare before/after reward |
| Did the new prompt break old behavior? | Block promotion on task-level regressions |
| Did the agent start using tools poorly? | Track read/write/overall action matching |
| Did it loop or waste calls? | Block max-step failures |
| Did it learn from unsafe live data? | Use offline traces and controlled benchmark splits |
| Can we explain what changed? | Store candidate version, summary, and failure case study |

The production value is not that tau2 retail itself is the production environment. The value is the engineering pattern:

```text
every agent change becomes an experiment with evidence
```

That lets a team improve a support agent without shipping blind prompt patches.

## Claims Boundary

The current result is promising, but the claim is deliberately narrow. It does **not** prove:

- that Trace2Evolve beats all agents on tau2 retail
- that the v6 retail number is independent of the `100-113` ablation work
- that the retail-derived candidate generalizes to airline
- that synthetic hidden holdout performance is equivalent to real tau2 benchmark performance
- that the result will hold across hundreds of unseen benchmark tasks
- that GPT-5.4-mini is the optimal operational model
- that the research artifacts alone are sufficient for production monitoring

The honest claims are narrower:

```text
1. A frozen v5 candidate improved a later tau2 retail holdout from 0.000 to
   0.214 reward before the v6 ablation work.

2. A v6 candidate, designed from ablation evidence, improved the same retail
   slice further to 0.429 reward and 0.444 write-action match.

3. The same style of cross-domain instruction did not transfer cleanly to tau2
   airline and was rejected by the reliability gate.

4. A frozen synthetic 36-case support holdout passed as a secondary safety
   pressure test, not as the main benchmark proof.
```

That narrower claim is still valuable because it demonstrates the complete AutoResearch loop end to end while showing both positive and negative evidence.

## Reproducibility

Trace2Evolve and tau2-bench use separate Python environments:

| Component | Python | Purpose |
| --- | --- | --- |
| Trace2Evolve repo | Python 3.10 | research harness, blog assets, local support evals |
| tau2-bench repo | Python >=3.12,<3.14 | official tau2 benchmark runs |

The local Trace2Evolve setup is:

```bash
cd /path/to/autoresearch
uv sync
uv run python -m trace2evolve.prepare --json
```

The tau2 benchmark run uses a separate Python environment because tau2-bench requires Python >=3.12,<3.14 while the Trace2Evolve repo is on Python 3.10.

The successful OpenRouter route uses:

```bash
cd /path/to/tau2-bench
OPENAI_API_KEY=$OPENROUTER_API_KEY \
OPENAI_BASE_URL=https://openrouter.ai/api/v1 \
OPENAI_API_BASE=https://openrouter.ai/api/v1 \
TAU2_AGENT_EXTRA_INSTRUCTION="$(uv run python -m trace2evolve.program)" \
tau2 run --domain retail \
  --agent-llm openrouter/openai/gpt-5.4-mini \
  --user-llm openrouter/openai/gpt-5.4-mini \
  --num-trials 1 \
  --task-ids 20 21 22 23 24 25 26 27 28 29 \
  --max-concurrency 1 \
  --save-to trace2evolve_retail_20_29_candidate_v5 \
  --max-retries 0 \
  --hallucination-retries 0 \
  --log-level ERROR
```

The v6 retail run used the same command shape with task IDs `100-113` and the v6 instruction file:

```bash
cd /path/to/tau2-bench
OPENAI_API_KEY=$OPENROUTER_API_KEY \
OPENAI_BASE_URL=https://openrouter.ai/api/v1 \
OPENAI_API_BASE=https://openrouter.ai/api/v1 \
TAU2_AGENT_EXTRA_INSTRUCTION="$(cat /path/to/autoresearch/runs/research/tau2_expansion/instructions/full_v6.txt)" \
tau2 run --domain retail \
  --agent-llm openrouter/openai/gpt-5.4-mini \
  --user-llm openrouter/openai/gpt-5.4-mini \
  --num-trials 1 \
  --task-ids 100 101 102 103 104 105 106 107 108 109 110 111 112 113 \
  --max-concurrency 1 \
  --save-to trace2evolve_retail_100_113_candidate_v6 \
  --max-retries 0 \
  --hallucination-retries 0 \
  --log-level ERROR
```

The v6 retail summary was produced with:

```bash
cd /path/to/autoresearch
uv run python -m trace2evolve.evaluate \
  --before-run trace2evolve_retail_100_113_baseline \
  --after-run trace2evolve_retail_100_113_candidate_v6 \
  --candidate-version tau2-retail-candidate-v6-conditional-details \
  --train-slice "retail tasks 0-99 plus ablation evidence" \
  --holdout-slice "retail tasks 100-113 late split; v6 development evidence" \
  --summary-path runs/research/tau2_expansion/v6_retail_summary.json \
  --json
```

The airline transfer check was run with:

```bash
cd /path/to/tau2-bench
OPENAI_API_KEY=$OPENROUTER_API_KEY \
OPENAI_BASE_URL=https://openrouter.ai/api/v1 \
OPENAI_API_BASE=https://openrouter.ai/api/v1 \
TAU2_AGENT_EXTRA_INSTRUCTION="$(cat /path/to/autoresearch/runs/research/tau2_expansion/instructions/cross_domain_service.txt)" \
tau2 run --domain airline \
  --agent-llm openrouter/openai/gpt-5.4-mini \
  --user-llm openrouter/openai/gpt-5.4-mini \
  --num-trials 1 \
  --task-ids 40 41 42 43 44 45 46 47 48 49 \
  --max-concurrency 1 \
  --save-to trace2evolve_airline_40_49_candidate_v6 \
  --max-retries 0 \
  --hallucination-retries 0 \
  --log-level ERROR
```

The frozen synthetic hidden holdout was evaluated once with:

```bash
cd /path/to/autoresearch
jq ".cases" runs/research/tau2_expansion/hidden_holdout.json \
  > runs/research/tau2_expansion/hidden_holdout_cases.json

uv run python -m trace2evolve.evals.run_eval \
  --mock \
  --cases-in runs/research/tau2_expansion/hidden_holdout_cases.json \
  --trace-out runs/research/tau2_expansion/hidden_holdout_v6_traces.jsonl \
  --report-out runs/research/tau2_expansion/hidden_holdout_v6_report.json \
  --json
```

The blog assets are checked with:

```bash
find assets -name "*.svg" -print0 | xargs -0 uv run python -m xml.etree.ElementTree
for f in $(grep -o 'assets/[^)]*\\.svg' blog.md | sort | uniq); do
  test -f "$f" || echo "missing:$f"
done
uv run pytest tests
```

The main artifacts are:

| Artifact | Path |
| --- | --- |
| Candidate program | `trace2evolve/program.py` |
| Prepare manifest | `results/tau2_prepare.json` |
| Scoreboard | `results/tau2_scores.tsv` |
| Active candidate | `results/tau2_active_version.json` |
| Initial promoted summary | `runs/research/tau2_harness/2026-05-16T164149Z0000.json` |
| Late-holdout summary | `runs/research/tau2_harness/2026-05-16T173334Z0000.json` |
| v6 retail summary | `runs/research/tau2_expansion/v6_retail_summary.json` |
| v6 airline summary | `runs/research/tau2_expansion/v6_airline_summary.json` |
| Hidden holdout result | `runs/research/tau2_expansion/hidden_holdout_v6_report.json` |
| Blog charts | `assets/` |

## Technical Appendix: Promotion Rule

The promotion rule is deliberately conservative:

```text
promote only if:
  after_reward > before_reward
  after_pass_rate >= before_pass_rate
  after_action_match_rate >= before_action_match_rate
  after_read_action_match_rate >= before_read_action_match_rate
  after_write_action_match_rate >= before_write_action_match_rate
  reward_regressions == 0
  max_step_failures == 0
```

In other words, the candidate must improve the main outcome and avoid degrading operational behavior.

This is the most important technical idea in the project. It keeps the AutoResearch loop from becoming an overfitting loop where every patch that helps one example gets accepted.

## Technical Appendix: Failure Taxonomy

The current support-agent failures can be grouped into five categories:

| Failure class | Description | Detection signal | Example mitigation |
| --- | --- | --- | --- |
| Under-inspection | Agent asks the user for data already available through tools | missing read calls, weak action match | call user/order details after authentication |
| Cross-order ambiguity | Agent fails to resolve references across multiple orders | wrong item target, repeated questions | inspect delivered and pending orders |
| Unsafe write path | Agent performs or prepares a mutation without exact IDs/confirmation | write action mismatch | require summarize -> confirm -> write |
| Max-step loop | Agent keeps calling tools or asking follow-ups without converging | simulation budget exhausted | force one-next-step discipline |
| Partial success | Agent follows some steps but misses one required operation | reward 0 with improved action match | classify remaining missing action |

This taxonomy is useful because it converts messy transcripts into patchable hypotheses.

## Expansion Experiments

After the first retail-only promotion result, I added four expansion experiments to make the claim more research-like:

1. **Multiple domains:** evaluate whether the instruction pattern transfers outside retail.
2. **Candidate ablations:** remove one rule at a time and measure which rule actually matters.
3. **Judge-assisted qualitative scoring:** keep tau2 reward as the primary metric, but add GPT-5.5 ratings for customer-facing quality.
4. **Hidden holdout generation:** freeze the candidate, then generate fresh synthetic edge cases that are used only for final pressure testing.

These experiments do not make the system look magically better. They make it more honest. In particular, the airline and ablation results expose where the current candidate is overfit or over-constrained.

## Multi-Domain Check: Airline

![tau2 airline multi-domain check](/assets/autoresearch-blog/tau2_multidomain_airline.svg)

The second tau2 domain was `airline`, using tasks `40-49`. This domain has a different support world: reservations, passengers, cancellations, flight status, and booking changes instead of retail orders and returns.

The result is mixed:

| Run | Domain | Tasks | Reward | Pass rate | Action match | Write-action match |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Baseline | airline | 10 | 0.600 | 0.600 | 0.653 | 0.000 |
| Cross-domain instruction | airline | 10 | 0.400 | 0.400 | 0.694 | 0.167 |

The cross-domain instruction improved action matching from `0.653` to `0.694`, and it improved write-action matching from `0.000` to `0.167`. But the primary benchmark metric dropped from `0.600` to `0.400`.

That means the current Trace2Evolve candidate should **not** be promoted as a general airline improvement. It shows partial transfer in tool discipline, but it also creates reward regressions. This is useful because a real research harness should be willing to say: "this did not transfer cleanly."

## Candidate Ablation Study

![tau2 candidate ablation study](/assets/autoresearch-blog/tau2_ablation_reward.svg)

The ablation study reruns the same retail holdout, tasks `100-113`, with one v5 rule removed at a time.

| Variant | Reward | Pass rate | Write-action match | Interpretation |
| --- | ---: | ---: | ---: | --- |
| Baseline | 0.000 | 0.000 | 0.194 | no Trace2Evolve candidate |
| Full v5 | 0.214 | 0.214 | 0.306 | promoted retail candidate |
| Remove user-details rule | 0.357 | 0.357 | 0.583 | better on this slice; rule may over-constrain late tasks |
| Remove cross-order rule | 0.071 | 0.071 | 0.306 | large reward drop; cross-order rule matters most |
| Remove no-loop guard | 0.214 | 0.214 | 0.333 | same reward, slightly better write matching |

The strongest positive evidence is for the **cross-order rule**. Removing it drops reward from `0.214` to `0.071`, and it regresses tasks that full v5 handled.

The surprising result is the **user-details rule**. Removing it improves this late slice from `0.214` to `0.357`. That does not automatically mean the rule is bad globally. It means the rule may be too broad: sometimes forcing extra user-detail retrieval helps, and sometimes it slows or distracts the agent. This finding led to v6's conditional detail-retrieval rule.

The no-loop guard looks neutral on reward in this slice, but it slightly improves write-action matching when removed. On this evidence, its contribution is inconclusive.

## GPT-5.5 Qualitative Judge

![GPT-5.5 qualitative judge scores](/assets/autoresearch-blog/tau2_judge_quality.svg)

tau2 reward stays the benchmark metric. The judge is not allowed to replace tau2. Its job is to add a qualitative lens:

```text
Does the assistant sound good to a customer?
Does it explain policy clearly?
Does it use tools with discipline?
Does it avoid risky or confusing behavior even when reward is partially correct?
```

For the retail candidate v5, GPT-5.5 judged 6 traces from tasks `100-105`:

| Run | Judged traces | Judge pass rate | Tone | Helpfulness | Policy clarity | Tool discipline |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Retail candidate v5 | 6 | 0.500 | 0.552 | 0.473 | 0.500 | 0.450 |

For the airline cross-domain run, GPT-5.5 judged 6 traces from tasks `40-45`:

| Run | Judged traces | Judge pass rate | Tone | Helpfulness | Policy clarity | Tool discipline |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Airline cross-domain | 6 | 0.333 | 0.625 | 0.387 | 0.492 | 0.567 |

This catches failures that the high-level reward summary can hide. For example, the airline run had reasonable tone on some failed tasks, but GPT-5.5 identified wrong reservation selection and weak helpfulness. On retail, GPT-5.5 found tool-discipline errors such as attempting lookup with an `"unknown"` email and escalating abruptly.

Two retail judge calls returned empty responses after retry and were counted as failures. That is conservative: a missing judge result should not improve the claim.

## Frozen Hidden Holdout

![Frozen hidden holdout generation](/assets/autoresearch-blog/hidden_holdout_factory.svg)

I also generated a frozen synthetic hidden holdout:

```text
runs/research/tau2_expansion/hidden_holdout.json
```

It contains `36` adversarial customer-support cases created after the current candidate was frozen. These are not used for tuning. They are reserved for final pressure testing.

The important rule is:

```text
use discovered failures for diagnosis,
use dev cases for candidate design,
use hidden holdout only for final reporting.
```

That separation is what keeps the project from becoming "we made a patch for the exact examples we already saw."

## V6 Candidate Result

The v6 candidate made one targeted change: it kept the cross-order rule, but changed user-detail retrieval from always-on to conditional. The agent now calls linked user details only when they are needed for the current request, such as missing order IDs, ambiguous references, account-level requests, or multi-record writes.

On the retail late split, v6 improved the tau2 result, but this is development evidence because v6 was designed after the ablation study:

| Run | Tasks | Reward | Pass rate | Write-action match | Reliability decision |
| --- | ---: | ---: | ---: | ---: | --- |
| Retail baseline | 14 | 0.000 | 0.000 | 0.194 | baseline |
| Retail v5 | 14 | 0.214 | 0.214 | 0.306 | keep |
| Retail v6 conditional details | 14 | 0.429 | 0.429 | 0.444 | promote |

The v6 retail run passed the reliability gate: reward improved, pass rate improved, action matching improved, there were no reward regressions relative to the retail baseline, and no simulation hit max steps.

On airline, v6 did not pass:

| Run | Tasks | Reward | Pass rate | Action match | Reliability decision |
| --- | ---: | ---: | ---: | ---: | --- |
| Airline baseline | 10 | 0.600 | 0.600 | 0.653 | baseline |
| Airline v6 cross-domain | 10 | 0.400 | 0.400 | 0.694 | discard |

This is an important negative result. The v6 pattern improved retail, but it did not generalize cleanly to airline. It improved action matching while hurting reward, so the reliability gate correctly rejected it for airline.

The frozen hidden holdout was then run once:

| Holdout | Cases | Passed | Aggregate score | Safety gates |
| --- | ---: | ---: | ---: | --- |
| `POST-FREEZE-001` | 36 | 36 | 1.000 | pass |

The hidden holdout artifact was used only for this final pressure test, and the result was recorded without tuning on those cases.

## Bottom Line

Trace2Evolve shows a small but real AutoResearch loop:

```text
benchmark failure -> trace diagnosis -> candidate patch -> heldout rerun -> reliability-gated promotion
```

The current result is not a leaderboard claim. It is an evidence trail: a tool-using support agent improved on real tau2 retail benchmark splits, the improvement was measured with task and action metrics, the retail candidate was promoted only after passing reliability gates, and the airline transfer candidate was rejected when it failed those gates.

That is the core idea: make agent improvement look less like prompt vibes and more like an experiment.
