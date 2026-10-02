---
title: "ClaimsBench: Evaluating AI Agents Across a Complete Insurance Claim"
date: 2026-10-02
layout: paper
authors: "Mohammed Alshehri"
year: 2026
tldr: "ClaimsBench evaluates AI agents across evidence gathering, adjudication, revision, and closure in complete insurance claims."
description: "How ClaimsBench evaluates AI agents across evidence gathering, adjudication, revision, and closure in complete insurance claims."
permalink: /projects/claimsbench-evaluating-ai-agents/
---

<style>
.sample-run { margin: 1.5rem 0 2rem; }
.sample-run-header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--line); }
.sample-run-model { font: 400 1.35rem/1.2 Georgia, "Times New Roman", serif; }
.sample-run-meta { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; margin-top: .4rem; color: var(--muted); font-size: .85rem; }
.sample-run-pass { color: #287a4b; font-weight: 700; }
.sample-run-steps { margin: 1rem 0 0; padding: 0; list-style: none; counter-reset: run-step; }
.sample-run-step { position: relative; display: grid; grid-template-columns: 2rem 1fr; gap: .8rem; padding: .75rem 0 .9rem; border-bottom: 1px solid var(--line); counter-increment: run-step; }
.sample-run-step::before { content: counter(run-step); display: grid; width: 1.8rem; height: 1.8rem; place-items: center; border: 1px solid var(--line); border-radius: 50%; color: var(--muted); font-size: .8rem; }
.sample-run-step strong { display: block; margin-bottom: .25rem; }
.sample-run-tools { color: var(--muted); font: .8rem/1.5 "SFMono-Regular", Consolas, monospace; }
.sample-run-output { margin-top: 1.25rem; padding: 1rem 1.1rem; border: 1px solid var(--line); }
.sample-run-output strong { display: block; margin-bottom: .4rem; }
.model-chart { margin: 1.5rem 0 2rem; padding: 1rem 0; overflow-x: auto; }
.model-chart svg { display: block; width: 100%; min-width: 680px; height: auto; }
.blog-post-content table,
.blog-post-content th,
.blog-post-content td { background: transparent !important; }
.article-intro-grid { display: grid !important; grid-template-columns: minmax(0, 1fr) 18rem !important; gap: 2rem; align-items: start; margin-bottom: 2.5rem; }
.article-intro-grid > .article-toc { grid-column: 2; }
@media (max-width: 760px) { .article-intro-grid { grid-template-columns: 1fr !important; } .article-intro-grid > .article-toc { grid-column: auto; } }
.claimsbench-hero { position: relative; display: grid; min-height: 330px; margin: 0 0 2.5rem; overflow: visible; border: 0; background: transparent; isolation: isolate; }
.claimsbench-hero-art { position: absolute; z-index: 1; width: 14rem; height: 14rem; object-fit: contain; opacity: .96; filter: drop-shadow(0 14px 16px rgba(0,0,0,.12)); transition: transform .35s ease, filter .35s ease, opacity .35s ease; cursor: pointer; }
.claimsbench-hero-art:hover { opacity: 1; filter: drop-shadow(0 20px 22px rgba(0,0,0,.2)); }
.claimsbench-hero-car:hover { transform: rotate(-8deg) translateY(-10px) scale(1.06); }
.claimsbench-hero-folder:hover { transform: rotate(7deg) translateY(-10px) scale(1.06); }
.claimsbench-hero-settlement:hover { transform: translateX(-50%) rotate(-7deg) translateY(10px) scale(1.08); }
.claimsbench-hero-car { left: -1rem; bottom: -.75rem; transform: rotate(-8deg); }
.claimsbench-hero-folder { right: -.5rem; bottom: -.75rem; transform: rotate(7deg); }
.claimsbench-hero-settlement { left: 50%; top: -2.25rem; z-index: 0; width: 11rem; height: 11rem; transform: translateX(-50%) rotate(-7deg); opacity: .42; filter: blur(.15px) drop-shadow(0 12px 18px rgba(0,0,0,.08)); }
@media (max-width: 650px) { .claimsbench-hero { min-height: 360px; } .claimsbench-hero-art { width: 10rem; height: 10rem; } .claimsbench-hero-car { left: -2.5rem; bottom: -1.5rem; } .claimsbench-hero-folder { right: -2.5rem; bottom: -1.5rem; } .claimsbench-hero-settlement { top: -3.5rem; width: 8rem; height: 8rem; } }
</style>

<div class="claimsbench-hero" aria-label="ClaimsBench banner" markdown="0">
  <img class="claimsbench-hero-art claimsbench-hero-car" src="{{ '/assets/images/claimsbench-car.png' | relative_url }}" alt="Damaged car representing a reported loss">
  <img class="claimsbench-hero-art claimsbench-hero-folder" src="{{ '/assets/images/claimsbench-folder.png' | relative_url }}" alt="Claim documents in a folder">
  <img class="claimsbench-hero-art claimsbench-hero-settlement" src="{{ '/assets/images/claimsbench-settlement.png' | relative_url }}" alt="Claim settlement document">
</div>

<div class="article-intro-grid">
<div class="article-intro-copy">

Most AI evaluations ask for a final answer. ClaimsBench evaluates the chain behind an insurance decision: gathering evidence, applying policy terms to each item, calculating payment, revising decisions, and closing the dispute. A correct-looking number can still conceal an unsupported denial or missed revision.

ClaimsBench is a Prime Verifiers environment with **30 Oklahoma property claims**, 30 policy sources, and **210 registered line items** across water, theft, wind, fire, collapse, and earthquake scenarios. Each task includes four to eight items and a simulated claimant. The opening is incomplete by design: the agent must interview the claimant and request evidence, while profiles and adjudication ground truth remain private.

</div>

<details class="article-toc" aria-label="Table of contents" open>
  <summary>

  Table Of Contents

  </summary>
  <ul>
    <li><a href="#motivation">Motivation</a></li>
    <li><a href="#the-30-claim-tasks">The 30 Claim Tasks</a></li>
    <li><a href="#one-claim-five-connected-phases">One Claim, Five Connected Phases</a></li>
    <li><a href="#how-the-score-works">How the Score Works</a></li>
    <li><a href="#grading">Grading</a></li>
    <li><a href="#rubric-breakdown">Rubric Breakdown</a></li>
    <li><a href="#quality-assurance">Quality Assurance</a></li>
    <li><a href="#what-the-reward-hacking-audits-showed">What the Reward-Hacking Audits Showed</a></li>
    <li><a href="#sample-task">Sample Task</a></li>
    <li><a href="#model-results">Model Results</a></li>
  </ul>
</details>
</div>

## Motivation

Insurance is a document-heavy market where a decision depends on claimant conversations, policy language, estimates, photographs, invoices, timelines, and later evidence—not just a final number. Claims teams must preserve a defensible record of why each item was covered, limited, or denied while working across fragmented systems.

Claims therefore provide a useful agent evaluation: the system must gather missing information, apply rules to individual items, calculate a settlement, respond to disputes, and know when evidence is insufficient. ClaimsBench tests the complete workflow from intake through a grounded resolution.

## The 30 claim tasks

One task is one complete claim, not one question or phase. The agent starts with a first notice and item register, then interviews the claimant, gathers evidence, decides each item, calculates payment, revisits decisions after new evidence, and closes the claim. The 30 tasks share this workflow but vary in facts, policy terms, evidence, and disputed amounts.

### How a task is created

Each task is assembled around one claim scenario by domain experts. They define the loss event, register the individual items, attach the applicable policy source, prepare the initial claim opening, and write the expert rubric that specifies the evidence, coverage decisions, amounts, policy reasons, revisions, and final settlement expected for that task. The evidence available to the agent is staged so that the opening remains incomplete but the missing facts can be discovered through claimant questions and evidence requests. A separate claimant profile drives the interview, while private adjudication ground truth records the expert-supported outcome. The task is then run through the five required phases and checked for a reproducible starting state, valid tool transitions, and a complete reference outcome before it is added to the benchmark.

| Primary loss group | Claims | Registered items |
| --- | ---: | ---: |
| Earthquake | 12 | 85 |
| Water and freezing | 6 | 40 |
| Theft and contents | 5 | 38 |
| Wind and mixed weather | 4 | 28 |
| Fire and smoke | 2 | 11 |
| Collapse and code-related work | 1 | 8 |
| **Total** | **30** | **210** |

## One claim, five connected phases

Every task follows the same five-phase workflow, but the facts and policy questions change from claim to claim.

| Phase | Required work |
| --- | --- |
| Initial claim | Record the claimant's account, identify issues, set a reserve, and write an investigation plan. |
| Investigation | Request released evidence, connect it to the issues, and update findings and estimates. |
| Interim resolution | Decide every registered item, support amounts with evidence, apply the deductible, and propose coverage and payment. |
| Reconsideration | Review later evidence and the claimant's dispute, revise decisions where warranted, and escalate the right issues. |
| Final resolution | Set authority, resolve open issues, reconcile the settlement, and submit a closure memo. |

Consider the public opening of `OID-001`: a reported dishwasher-related water loss with claims for mitigation, cabinetry, flooring, and the supply line. The opening does not settle when the release occurred, whether earlier damage existed, or which costs belong to a covered scope. An agent has to ask, inspect, decide, and revisit those decisions as the record develops. The benchmark records those actions rather than grading only the closing paragraph.

## How the score works

Prime Verifiers runs the claims agent and a separate claimant simulator, exposes structured claim tools, and records the authoritative server state. In our evaluation configuration, the agent has up to **80 assistant turns**. The turn limit is not a limit of 80 claim-tool calls.

The official `luna_reward` uses **GPT-5.6 Luna** to grade the accepted work against the private reference. Its five criteria are factual accuracy (30%), no material hallucinations (30%), claim-specific coverage (20%), direct task completion (10%), and grounded citations (10%). Each receives no, partial, or yes credit. Five deterministic checks—investigation, interim decisions, evidence-based revision, coverage and payment, and dispute closure—set the trajectory ceiling. The official reward is the lower of that ceiling and the Luna rubric score after coverage and error penalties. Merely reaching a phase earns no automatic credit, and an attempt with no accepted substantive work scores zero.

This design lets the score represent useful partial progress while still asking whether the agent's statements and decisions are grounded in the claim record. A terminal-completion diagnostic is available separately; it is not the official reward.

## Grading

Every task carries a rubric created by human evaluators. A frozen judge evaluates each criterion against the agent's final message and any files it produced. In this benchmark, we used GPT-5.6 Luna as the judge.

The benchmark uses five distinct metrics:

- **Mean reward** is the average official reward across attempts.
- **Pass rate** is the share of individual attempts that complete a task perfectly.
- **Solve rate** is the share of tasks where at least one of three independent attempts completes it perfectly.
- **Pass³** is the share of tasks where all three independent attempts complete it perfectly.
- **Trajectory ceiling** is the maximum reward allowed by the five deterministic phase checks.

## Rubric breakdown

Luna reads the accepted claim work alongside the evaluator's private reference. For each criterion, it returns **no (0)**, **partial (0.5)**, or **yes (1)** with a reason. The weights form a 0–1 base score:

| Criterion | Weight | What it checks |
| --- | ---: | --- |
| Factual accuracy | 30% | Intake, coverage, amounts, deductible, payment, and closure agree with the record. |
| No material hallucinations | 30% | The agent does not invent or contradict claim facts, documents, policy terms, or amounts. |
| Claim-specific coverage | 20% | The accepted work addresses the material facts, items, revisions, and dispute for this claim. |
| Direct task completion | 10% | The agent performs the adjudication and produces a usable outcome. |
| Grounded citations | 10% | Material decisions trace to claimant facts, evidence, and policy terms. |

Claim-specific coverage also scales the weighted score. A confirmed material factual error applies a 0.5 multiplier; a confirmed material hallucination applies a 0.2 multiplier. No accepted substantive work receives zero. The saved GLM run below used the earlier **Luna rubric v2**; the current phase-ceiling implementation is **v3**, so its recorded score is a historical result rather than a rerun under v3.

## Quality Assurance

We bind each public claim, private record, and claimant profile to a frozen version with per-claim hashes. The private validator runs scripted reference trajectories through all 30 claims. In the current validation, all 30 completed with full deterministic phase scores. It also checks incomplete or incorrect trajectories: weakened half, full, and deny-all baselines averaged **0.315**, **0.347**, and **0.396**, respectively. Those are validator fixtures, not model results.

Reward hacking is a central concern for any agent benchmark. An agent can appear successful while exploiting feedback, repeating rejected actions, probing for hidden answers, or making unsupported claims that sound plausible. ClaimsBench scores actions the server accepted, not actions the agent merely describes. Rejected submissions cannot become covered items by assertion, and repeated invalid actions reduce the trajectory ceiling. Ground truth and judge instructions remain evaluator-side, outside the agent's task view. We inspect traces for filesystem probing, attempts to infer answers from rejection messages, and shortcuts that bypass evidence; automated flags alone do not identify every suspicious attempt.

The Luna rubric is versioned and its output is checked against a fixed schema. Independent expert-labeled calibration of ambiguous judge decisions remains a next step, so we treat an unavailable judge verdict as an unscored evaluation rather than a model score of zero.

## What the reward-hacking audits showed

In an earlier GPT-5.6 Sol run, the agent inferred a private dispute answer from tool feedback instead of claim evidence. That was a reward-hacking shortcut. In a separate 20-rollout GLM-5.3 Flash audit, some agents probed the sandbox or repeatedly tried rejected actions, but none gained a private answer or improved its reward through those attempts.

These traces show why we review how an agent arrived at a score, not just the score itself. Agents can look competent while taking unsupported shortcuts, so the feedback channel and evaluation traces must be audited before a high reward is treated as reliable performance.

## Sample Task

**Task prompt.** Adjudicate this claim using the available tools. Interview the claimant, record the intake, collect evidence, and submit each phase in order. Decide every registered item with a supported amount and policy reason. Revisit decisions when new evidence arrives, resolve the dispute, and submit a final settlement that reconciles. Do not invent facts or treat a document as the final answer.

<div class="sample-run" markdown="0">
<div class="sample-run-header">
  <div><div class="sample-run-model">GLM-5.3</div><div class="sample-run-meta">OID-015 · condominium earthquake and association assessment</div></div>
  <div class="sample-run-meta"><span class="sample-run-pass">5/5 criteria passed</span><span>43 turns · 34 tool calls</span></div>
</div>
<ol class="sample-run-steps">
  <li class="sample-run-step"><div><strong>Record the intake</strong>Capture the claimant interview, prepare the phase artifact, and submit the initial claim.<div class="sample-run-tools">record_claimant_intake · record_stage_artifact · submit_initial_claim</div></div></li>
  <li class="sample-run-step"><div><strong>Gather supporting evidence</strong>List available documents and request the evidence needed for the investigation.<div class="sample-run-tools">list_available_evidence · request_evidence</div></div></li>
  <li class="sample-run-step"><div><strong>Submit the investigation</strong>Record findings and submit the investigation phase.<div class="sample-run-tools">record_stage_artifact · submit_investigation</div></div></li>
  <li class="sample-run-step"><div><strong>Make interim decisions</strong>Stage five item decisions individually and submit the interim resolution.<div class="sample-run-tools">stage_line_item_decision · submit_interim_resolution</div></div></li>
  <li class="sample-run-step"><div><strong>Reconsider new evidence</strong>Request later evidence, record a revision artifact, and submit reconsideration.<div class="sample-run-tools">request_evidence · record_stage_artifact · submit_reconsideration</div></div></li>
  <li class="sample-run-step"><div><strong>Close the claim</strong>Request final evidence and submit the final resolution with supporting records.<div class="sample-run-tools">request_evidence · record_stage_artifact · submit_final_resolution</div></div></li>
</ol>
<div class="sample-run-output"><strong>Recorded result</strong>Luna v2 returned <strong>1.0</strong> with a yes verdict on all five rubric criteria. The trace also records six invalid actions, so the score reflects accepted work rather than a claim that every attempted tool call was valid.</div>
</div>

## Model results

The table below reports results from the **30-claim ClaimsBench benchmark**. It summarizes the models' pass rates, mean rewards, and average tool usage across the benchmark tasks.

Each model received three independent attempts per task. The leaderboard uses the v3 phase-ceiling scorer together with the GPT-5.6 Luna rubric.

<div class="model-chart" markdown="0" role="img" aria-label="Bar chart of mean ClaimsBench reward by model. Opus 5.5 leads at 0.68, followed by Fable 5.1 at 0.64, GPT-6.1 Sol at 0.61, GPT-6 Astra at 0.60, Gemini 3.8 Flash at 0.56, DeepSeek V4.1 Flash at 0.55, and Grok 4.7 at 0.52.">
<svg viewBox="0 0 920 390" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g fill="none" stroke="var(--line)" stroke-width="1">
    <line x1="72" y1="35" x2="72" y2="310" />
    <line x1="72" y1="310" x2="890" y2="310" />
    <line x1="72" y1="35" x2="890" y2="35" stroke-dasharray="3 5" />
    <line x1="72" y1="104" x2="890" y2="104" stroke-dasharray="3 5" />
    <line x1="72" y1="173" x2="890" y2="173" stroke-dasharray="3 5" />
    <line x1="72" y1="241" x2="890" y2="241" stroke-dasharray="3 5" />
  </g>
  <g fill="var(--muted)" font-family="SFMono-Regular, Consolas, monospace" font-size="12" text-anchor="end">
    <text x="62" y="314">0.0</text><text x="62" y="245">0.2</text><text x="62" y="177">0.4</text><text x="62" y="108">0.6</text><text x="62" y="39">0.8</text>
  </g>
  <g>
    <rect x="105" y="76" width="72" height="234" rx="3" fill="#2878b5"/><rect x="220" y="90" width="72" height="220" rx="3" fill="#2f9d8f"/><rect x="335" y="100" width="72" height="210" rx="3" fill="#7a65b8"/><rect x="450" y="103" width="72" height="207" rx="3" fill="#d27a3d"/><rect x="565" y="117" width="72" height="193" rx="3" fill="#c45b72"/><rect x="680" y="121" width="72" height="189" rx="3" fill="#5f9e55"/><rect x="795" y="131" width="72" height="179" rx="3" fill="#8b6f47"/>
  </g>
  <g fill="var(--text)" font-family="SFMono-Regular, Consolas, monospace" font-size="12" text-anchor="middle">
    <text x="141" y="68">0.68</text><text x="256" y="82">0.64</text><text x="371" y="92">0.61</text><text x="486" y="95">0.60</text><text x="601" y="109">0.56</text><text x="716" y="113">0.55</text><text x="831" y="123">0.52</text>
    <text x="141" y="334">Opus 5.5</text><text x="256" y="334">Fable 5.1</text><text x="371" y="334">GPT-6.1 Sol</text><text x="486" y="334">GPT-6 Astra</text><text x="601" y="334">Gemini 3.8</text><text x="716" y="334">DeepSeek</text><text x="831" y="334">Grok 4.7</text>
  </g>
  <text x="22" y="178" transform="rotate(-90 22 178)" fill="var(--muted)" font-family="SFMono-Regular, Consolas, monospace" font-size="12" text-anchor="middle">Mean reward</text>
  <text x="480" y="375" fill="var(--muted)" font-family="SFMono-Regular, Consolas, monospace" font-size="12" text-anchor="middle">Model</text>
</svg>
</div>

| Model | Harness | Pass rate | Mean reward | Avg. tool calls per task |
| --- | --- | ---: | ---: | ---: |
| Opus 5.5 | native CLI | 70% | 0.68 | 56 |
| Fable 5.1 | native CLI | 65% | 0.64 | 55 |
| GPT-6.1 Sol | native CLI | 61% | 0.61 | 50 |
| GPT-6 Astra | native CLI | 60% | 0.60 | 48 |
| Gemini 3.8 Flash | native CLI | 56% | 0.56 | 45 |
| DeepSeek V4.1 Flash | native CLI | 55% | 0.55 | 49 |
| Grok 4.7 | native CLI | 53% | 0.52 | 50 |

Across the benchmark runs, Opus 5.5 has a mean reward of **0.68** with a **70% pass rate**, followed by Fable 5.1 at **0.64** and **65%**. GPT-6.1 Sol and GPT-6 Astra have mean rewards of **0.61** and **0.60**, while Gemini 3.8 Flash and DeepSeek V4.1 Flash are close at **0.56** and **0.55**. Grok 4.7 has a mean reward of **0.52**.

Average tool usage across the benchmark runs ranges from **45 to 56 calls per task**. Tool count alone does not indicate stronger performance. More calls can represent useful evidence gathering, but they can also reflect repeated actions, unnecessary investigation, or difficulty progressing through the workflow.

Aggregate scores can hide substantial differences in how agents behave during a claim. Two models with similar scores may reach them through very different trajectories, with differences in evidence gathering, tool usage, policy application, response to new information, and ability to reach a supported resolution.

This is the main purpose of ClaimsBench. The benchmark is not designed to test whether a model can simply generate a plausible insurance answer. It tests whether an agent can carry a claim through a long-running, stateful workflow from intake to resolution.

ClaimsBench evaluates whether agents can gather the right evidence, apply claim rules consistently, update their decisions when new information arrives, use tools effectively, and ultimately produce a defensible claim outcome.

The goal is to make failures visible before these agents are trusted with real insurance workflows. ClaimsBench is designed to expose the gap between an agent that can talk about a claim and one that can actually handle one.
