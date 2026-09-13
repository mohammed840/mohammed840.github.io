---
title: "Engineering Environments for Agents to Learn"
date: 2026-09-13
layout: blog
author: Mohammed Alshehri
description: "A practical guide to turning expert software engineering work into reproducible benchmarks and reinforcement-learning environments."
permalink: /blogs/from-real-world-work-to-an-rl-environment/
---

<style>
.blog-post-content a,
.blog-post-content a:visited {
  color: #2684c7;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.blog-post-content a:hover,
.blog-post-content a:focus-visible {
  color: #17649c;
}
.article-toc summary::after {
  content: "−";
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
  font: 14px/1 "SFMono-Regular", Consolas, monospace;
}
.article-toc summary p { margin: 0; font: inherit; }
.article-toc:not([open]) summary::after { content: "+"; }
.benchmark-diagram {
  display: block;
  width: 100%;
  margin: 1.75rem 0 2rem !important;
  border: 0;
  background: transparent;
}
</style>

<div class="article-intro-grid">
<div class="article-intro-copy">

Benchmarks usually begin where real work ends. They present a clean prompt, a bounded set of inputs, and a success condition that can be checked consistently. Professional work rarely arrives in that form. A request such as “fix this authentication bug,” “prepare the investment analysis,” or “resolve the customer issue” is only the visible surface of a much larger process. The person doing the work must determine what the request actually means, locate the relevant evidence, apply rules that may never have been written down, make judgment calls, and leave the surrounding system in a valid state.

This gap is not incidental. It is the central problem in converting real work into a benchmark. [AlphaEval](https://arxiv.org/abs/2604.12162), a production-grounded evaluation of 94 tasks from seven companies, describes production work as structurally different from conventional benchmark tasks: requirements are loosely specified, constraints are often implicit, information is fragmented across heterogeneous documents, and success depends on domain-expert judgment. A benchmark designer must preserve these features while also producing something that can be run repeatedly and graded fairly.

<img class="benchmark-diagram" src="/assets/images/real-work-to-benchmark-task.png?v=4" alt="Diagram contrasting interconnected, ambiguous real work with a reproducible benchmark task composed of a task prompt, environment, and verifiable success criteria.">

</div>

<details class="article-toc" aria-label="Table of contents" open>
  <summary>

  <span>Table Of Contents</span><span class="toc-toggle" aria-hidden="true"></span>

  </summary>
  <ul>
    <li><a href="#capturing-real-work-with-domain-experts">Capturing Real Work With Domain Experts</a></li>
    <li><a href="#extracting-hidden-decision-rules-and-tacit-knowledge">Extracting Hidden Decision Rules and Tacit Knowledge</a></li>
    <li><a href="#turning-the-workflow-into-a-structured-task">Turning the Workflow Into a Structured Task</a></li>
    <li><a href="#reconstructing-the-tools-state-and-environment">Reconstructing the Tools, State, and Environment</a></li>
    <li><a href="#defining-what-success-actually-means">Defining What Success Actually Means</a></li>
    <li><a href="#converting-success-into-verifiable-checks">Converting Success Into Verifiable Checks</a></li>
    <li><a href="#validating-tasks-gold-solutions-and-verifiers">Validating Tasks, Gold Solutions, and Verifiers</a></li>
    <li><a href="#scaling-one-real-workflow-into-a-high-quality-benchmark">Scaling One Real Workflow Into a High-Quality Benchmark</a></li>
    <li><a href="#using-the-benchmark-as-an-rl-environment">Using the Benchmark as an RL Environment</a></li>
    <li><a href="#conclusion">Conclusion</a></li>
  </ul>
</details>
</div>

### Real work is under-specified

A professional rarely receives a perfect prompt. They discover missing information, clarify the objective, resolve contradictions, and decide which assumptions are safe. Sometimes the correct action is to pause, escalate, or refuse to proceed. These are not peripheral behaviors; they are part of the task.

Benchmark construction can accidentally erase this difficulty. If the author rewrites the request so that every ambiguity is resolved, gathers the exact documents needed, labels the relevant fields, and states every applicable rule, the benchmark may quietly provide much of the solution. The model is no longer being tested on problem formulation or information discovery. It is being tested on execution after a human has already performed the hardest interpretive work.

The opposite extreme is equally problematic. An ambiguous prompt without sufficient recoverable context does not create realism; it creates guesswork. The challenge is to preserve *productive ambiguity*: the missing details should be discoverable through the environment, tools, evidence, or appropriate clarification rather than being unknowable. As the essay [“What Benchmarks Aren’t Measuring”](https://molsen.ca/writing/what-benchmarks-arent-measuring/) argues, defining the problem is itself a meaningful part of judgment-intensive professional work.

### Much of the difficulty lives in hidden expertise

Written procedures describe what an organization expects people to do, but they rarely capture everything that makes an experienced person effective. A software engineering workflow may say “investigate the failing test,” while a senior engineer knows which log entry points to the root cause, which passing test provides false confidence, when two intermittent failures suggest a shared state bug, and when a proposed fix threatens an architectural invariant. The procedure records the visible action; the expertise lies in selecting and interpreting the cues.

This is the problem of tacit knowledge. Experts often make fast distinctions they cannot fully reconstruct after the fact. If benchmark authors capture only the final output or interview an expert about the official procedure, they may miss the judgments that actually produced the result. [*Working Minds*](https://doi.org/10.7551/mitpress/7304.001.0001) presents Cognitive Task Analysis as a family of methods for eliciting the cognitive skills, strategies, and decisions that allow people to perform effectively in real settings. For benchmark construction, that means observing how experts work, probing critical incidents, comparing difficult cases, and identifying what changes their decisions—not merely copying an SOP into a prompt.

The same hidden expertise must appear in the grader. A benchmark can contain a realistic task yet still use a shallow success test. If the verifier checks only whether the reported test now passes, it may accept a patch that suppresses the symptom, weakens an assertion, or breaks behavior elsewhere. The checks need to exercise the underlying failure mode, protect architectural invariants, and detect regressions—not require the agent to reproduce the expert’s exact debugging path. Capturing expertise and evaluating expertise are therefore the same design problem viewed from opposite ends.

### Professional work happens inside a world

A real task is embedded in files, databases, messages, permissions, policies, earlier actions, and other people’s decisions. Its meaning depends on the state of that world. A request to “refund the customer” cannot be evaluated from the final chat message alone. The relevant questions include whether the order was eligible, whether the refund was actually created, whether the correct amount was used, and whether unrelated records remained untouched.

[Anthropic’s guide to agent evaluations](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) makes a useful distinction between the agent’s trajectory and the environment’s outcome. An agent can say that it completed a task while leaving the database unchanged. Conversely, it may reach a valid outcome through a trajectory the benchmark author did not anticipate. Reliable evaluation therefore needs access to both what the agent did and what became true in the environment.

This is why a real request or recorded trace is only raw material. The benchmark author must reconstruct enough of the surrounding world for the task to remain meaningful: the available tools, the initial state, relevant documents, access boundaries, transition rules, and the state that should exist afterward. LangChain’s [environment-and-task construction pipeline](https://www.langchain.com/blog/building-agent-environments-and-tasks) formalizes this separation through a task specification and a broader “world specification” containing shared schemas, scripts, services, and domain knowledge. Without that world model, the benchmark tests a detached prompt rather than the original work.

### There may be many correct trajectories

Professional tasks often permit several legitimate approaches. One analyst may begin with the filing, another with the earnings release, and a third with a trusted data service before verifying against the primary source. Their sequences differ, but each may produce a defensible result.

A benchmark built around one golden action sequence mistakes imitation for correctness. It penalizes creative but valid solutions and becomes brittle whenever a model uses a new tool or discovers a better path. This problem becomes more pronounced as agents improve: capable systems can expose shortcuts, alternative workflows, or flaws in the task assumptions that a static reference trajectory did not consider.

The benchmark should therefore distinguish invariants from preferences. Invariants describe what must be true: the right entity was changed, the evidence supports the conclusion, required approvals were respected, and no forbidden side effect occurred. Preferences describe one acceptable way of getting there. Gold trajectories remain useful as examples and debugging aids, but they should not automatically become the only path to full credit.

### Success is multidimensional

A correct final answer can hide an incorrect process. An analyst may report the right number while using the wrong reporting period. An agent may generate the requested document while citing a secondary source where a primary source was required. It may resolve the customer’s immediate request while violating policy or corrupting another record.

For consequential work, correctness decomposes into several dimensions: outcome accuracy, evidence quality, policy compliance, state integrity, and professional quality. The dimensions vary by domain, but the need to separate them is general. [LH-Bench](https://arxiv.org/abs/2603.22744) argues that long-horizon enterprise work cannot be reduced to binary final-answer grading because organizational context, intermediate artifacts, and subjective quality affect whether the work is actually successful. Its evaluation design combines expert-grounded rubrics, curated intermediate artifacts, and human preference checks.

Financial research makes the limitation concrete. [BigFinanceBench](https://arxiv.org/abs/2606.03829) evaluates not only the final figure but also the auditable derivation: entity identification, source selection, period selection, line-item retrieval, accounting adjustments, formulas, and synthesis. Two agents can produce the same number while only one produces work another analyst could trust. A useful benchmark must retain that distinction.

### Long horizons create dependencies

In long workflows, early choices shape what becomes possible later. A mistaken entity match can contaminate every subsequent calculation. A skipped permission check may remain invisible until the agent attempts a final action. An incorrect intermediate artifact can be polished repeatedly and still lead to the wrong deliverable.

Short benchmarks remove this compounding structure. They test isolated actions with freshly prepared context, allowing the agent to succeed without maintaining state, revisiting assumptions, or recovering from earlier mistakes. Long-horizon evaluation must preserve dependencies across steps and artifacts so that decisions have downstream consequences. This does not mean making tasks long for its own sake. The horizon should be long enough for the original causal structure of the work to appear.

### Realism and verifiability pull in opposite directions

Every benchmark must be repeatable enough to compare systems. Yet every simplification introduced for repeatability risks changing the capability being measured. A single expected string is easy to score but cannot represent a defensible professional judgment. A fully realistic open world preserves complexity but may make controlled evaluation impossible.

The goal is not maximal realism. It is *decision fidelity*: preserve the information gaps, cues, branch points, dependencies, and consequences that make the original task difficult, while engineering observable state around them. Some dimensions can be checked with deterministic code, others with state inspection, structured rubrics, model-based graders, or calibrated human review. Production-grounded benchmarks increasingly combine several of these methods because no single grader captures the full shape of success.

### The benchmark itself can be wrong

Evaluation infrastructure is not neutral ground truth. The task instructions may conflict with the initial state. A reference solution may encode one expert’s preference rather than a true requirement. A verifier may reward a superficial proxy, overlook a valid trajectory, or contain a loophole. In these cases, an agent can fail despite behaving correctly—or pass without doing the intended work.

This makes task quality as important as model quality. Each benchmark task needs its own validation: can a qualified person solve it from the provided state, do the instructions and policies agree, does the reference solution satisfy the stated objective, do the graders recognize alternative valid outcomes, and do deliberate violations fail? A benchmark that has not been tested adversarially is an unverified instrument measuring an uncertain target.

The task-construction problem is therefore a compression problem: **how much of the original professional world can we compress into a reproducible environment without removing the decisions that made the task valuable?** Answering that question requires more than collecting prompts or final outputs. It requires working with domain experts to recover the context, cues, judgments, and consequences that ordinarily remain invisible. That is the starting point for the next section: capturing real work with domain experts.

## Capturing Real Work With Domain Experts

A GitHub issue is only the starting point of a software engineering task. The work also includes the repository state, undocumented dependencies, architectural constraints, debugging process, tool usage, tests the engineer chooses to run, and review standards the final patch must satisfy. Capturing that work means reconstructing how an engineer moves from an incomplete request to a change that is ready for production.

This matters most when the task unfolds over a long horizon. An early assumption about ownership can send the engineer into the wrong subsystem. A local fix can break a shared abstraction. A passing unit test can hide a failure that appears only when several services interact. The final diff shows the result of these decisions, but rarely explains the evidence that led to them or the alternatives that were rejected.

### Start with a real engineering episode

Rather than asking a senior engineer how they usually fix bugs, start with a specific issue they have worked on. Recover the original request and the repository state at the time. Ask them to walk through what they inspected, what they initially misunderstood, which observations changed their diagnosis, and why they considered the eventual patch acceptable.

The episode should retain its detours. An engineer may explore the repository, reproduce a failure, form a hypothesis, change the implementation, discover a regression, and revise the approach before broader validation succeeds. These revisions are useful evidence: they reveal dependencies that were not obvious at the start and show how the engineer updates their understanding when a plausible fix fails.

Treat the walkthrough as a timeline, not a polished success story. Preserve commands, edits, logs, test results, and review comments where available. Pair that record with the engineer’s explanation, while distinguishing recorded evidence from what they remember afterward. If a hypothesis was reconstructed during the interview rather than documented during the work, label it accordingly. A retrospective explanation can be useful without being an exact account of the original reasoning.

### Find the decisions inside the timeline

A useful first pass divides the episode into understanding, localization, reproduction, planning, implementation, testing, debugging, validation, and review. These are landmarks rather than a required order: a failed integration test may send the engineer back to localization, and review may expose an assumption that requires a new reproduction.

Then ask where judgment mattered. The number of commands in a phase is a poor proxy for its difficulty. Finding the correct subsystem may require only one search once an expert recognizes a familiar failure pattern. Choosing an abstraction may take longer than writing the patch. Deciding which tests are relevant may depend on architectural knowledge absent from the issue.

| Part of the episode | What to ask the engineer |
| --- | --- |
| Localizing the failure | Which observation pointed to this subsystem, and what ruled out the others? |
| Choosing the change | Which interface or invariant did the implementation need to preserve? |
| Selecting tests | Which behavior could this change break beyond the reported bug? |
| Interpreting a failure | Did the result contradict the hypothesis, expose a regression, or reveal an environment problem? |
| Reviewing the patch | What would make you reject this change even if the visible tests passed? |

These questions extend the cognitive-task-analysis perspective introduced earlier: capture the cues and judgments behind an action as well as the action itself. The output should make it possible to understand why a decision was reasonable given the information available at that moment.

### Record what was known at each decision

Consider an illustrative authentication bug: users can log in, but some requests return a 401 after token refresh. The interesting part is not simply that an engineer edits authentication code. It is how they distinguish a stale-session problem from an expiry calculation, a propagation failure, or a race during token rotation.

For each important decision, record the observed state, available evidence, hypotheses, chosen action, expected result, and actual result. A compact capture record might look like this:

```json
{
  "decision_id": "localize_refresh_failure",
  "stage": "localization",
  "observations": [
    "Initial login succeeds",
    "401 responses occur after token refresh",
    "Refresh requests pass through separate middleware"
  ],
  "hypotheses": [
    "The rotated token is not propagated",
    "Middleware reads stale session state",
    "Token expiry is calculated incorrectly"
  ],
  "next_action": "Trace session state through the refresh middleware",
  "expert_reason": "Compare the working login path with the failing refresh path",
  "expected_observation": "Identify where refreshed state stops propagating",
  "actual_observation": "To be recorded from the trace"
}
```

This is an example of a capture format, not a report of a measured incident. In a real record, each observation should link to its supporting file, log entry, command output, or test result. The record should also identify the repository checkpoint so that evidence from before and after an edit does not become mixed together.

Keep this authoring record separate from the instructions eventually shown to an agent. The selected hypothesis and expert explanation help benchmark authors understand the task; exposing them in the task prompt could give away the localization problem the agent is meant to solve.

### Capture the working environment

The repository alone may not reproduce the episode. The engineer may depend on running services, a database fixture, particular dependency versions, environment configuration, build artifacts, and logs. Record the state required to reproduce the failure, the tools available to inspect it, and which actions change that state.

For the refresh example, that could mean a pinned repository commit, reproducible dependency installation, web and authentication services, a synthetic account, and a controlled way to trigger token rotation. It also means recording constraints: existing login behavior must continue to work, authentication checks must remain active, and credentials must not be exposed. Use sanitized fixtures in place of production secrets or customer data.

The goal is to capture the parts of the environment that affect decisions. A missing service can make a solvable bug impossible to reproduce. Conversely, preloading a diagnosis into the logs or marking the faulty file as relevant can remove the investigation. Each piece of supplied context should be checked against what the engineer could actually access at the start.

### Separate shared knowledge from the individual task

The world specification describes how the software system works: its architecture, services, tool interfaces, state, setup process, and shared constraints. The task specification describes what needs to change in one particular episode, including the original request and initial conditions. Multiple tasks can share the same world while starting from different states and requiring different changes.

For example, a shared authentication environment can support separate tasks involving refresh middleware, expiry handling, concurrent rotation, and stale frontend sessions. Each task needs its own reproducible failure and validation criteria. The common environment does not make those cases interchangeable.

At this capture stage, preserve enough information to author those specifications later. Keep the original issue, environment snapshot, expert trace, explanatory notes, and final patch together. Record which constraints were documented, which were discovered during the work, and which were supplied only during the expert interview. That distinction will matter when deciding what the agent should receive, discover, or be evaluated against.

A directory structure makes this separation explicit:

```text
long-horizon-swe/
│
├── world/
│   ├── repository/
│   ├── architecture.md
│   ├── services.yaml
│   ├── tool_schema.json
│   └── world_spec.yaml
│
├── expert_traces/
│   └── task_001/
│       ├── original_issue.md
│       ├── expert_trace.json
│       ├── expert_notes.md
│       └── final_patch.diff
│
├── tasks/
│   └── task_001/
│       ├── instruction.md
│       ├── initial_state.json
│       ├── task_spec.json
│       └── reference_solution/
│
├── environments/
│   ├── docker/
│   ├── services/
│   └── fixtures/
│
├── verifiers/
│   ├── tests/
│   ├── state_checks/
│   ├── regression_checks/
│   └── rubric/
│
└── validation/
    ├── expert_replay/
    ├── alternative_solutions/
    └── adversarial_runs/
```

The world specification and expert traces inform the task specification. The environment makes the task executable, the verifiers assess its outcome, and validation checks whether the whole package measures the intended work.

### Ask what would change the expert’s decision

Counterfactual questions help identify the boundaries of the expert’s explanation. If the failure occurred before refresh, would they inspect the same subsystem? If the targeted test passed but the browser still failed, what would they investigate next? If the fix required modifying a shared session abstraction, which additional callers and tests would become relevant?

The answers can suggest related tasks, but a hypothetical variation is not yet a valid benchmark case. A proposed race condition needs a reproducible setup. A stale-cache variant needs evidence that distinguishes it from a middleware failure. Each variation must be implemented and checked independently before it can become part of a task family.

### Capture review standards beyond passing tests

Ask the expert to review the final patch as they would a real contribution. A change may pass the available tests while duplicating session logic, weakening an interface contract, relying on an unsafe concurrency assumption, or validating only the reported symptom. Record concrete rejection reasons and the evidence supporting them.

Avoid converting every stylistic preference into a correctness requirement. Ask whether a different implementation would be acceptable and what property it would need to preserve. A concern about backward compatibility might become a regression test; a concern about unintended data changes might become a state assertion; an architectural tradeoff may need a review rubric with examples of acceptable alternatives. These are candidates for later verification, not automatically reliable graders.

The result of expert capture is an evidence-backed account of the episode: what the engineer could observe, which decisions mattered, how actions changed the system, and what made the final change acceptable. Before turning that account into an executable task, the next step is to extract the hidden decision rules and tacit knowledge it contains—especially the cues that distinguish a plausible patch from a sound engineering solution.

## Extracting Hidden Decision Rules and Tacit Knowledge

Once the workflow is captured, the next challenge is recovering the decisions that remain invisible in the issue, repository, tests, and final patch. A trace tells us what happened. To build a useful benchmark, we also need to understand why the engineer chose that path and what evidence would have changed the decision.

For long-horizon software engineering, these hidden rules connect early observations to consequences that may appear much later. An engineer notices that two execution paths maintain the same mutable state, anticipates divergence, and investigates ownership before making a local fix. Another implementation might satisfy the reported example while leaving that underlying risk untouched. The difference becomes measurable only when the benchmark captures the conditions and requirements behind the judgment.

### Focus on decision points

Not every shell command needs an explanation. Searching, opening files, scrolling, and rerunning tests are useful records of activity, but their significance depends on the decisions they serve. Focus on the moments when the engineer selects a subsystem, abandons a hypothesis, rejects an apparently sufficient patch, or expands the scope of validation.

Ask why the engineer stopped following the obvious stack trace. Ask why a small change was inadequate, which shared assumption made a regression test relevant, and what suggested that the problem crossed an architectural boundary. These questions turn a command log into an account of investigation.

```text
Observation
    ↓
Cue recognized
    ↓
Hypothesis
    ↓
Alternatives considered
    ↓
Decision rule
    ↓
Action
    ↓
Expected consequence
    ↓
New evidence ──→ Next observation and decision
```

This is a recording scaffold, not a claim that engineers consciously complete every step in sequence. Some alternatives emerge only after a hypothesis fails. Preserve that timing instead of rewriting the episode into a perfectly ordered explanation.

### Extract cues, expectations, and alternatives

For each critical decision, recover five things: the cue that attracted attention, the expected next observation, plausible alternatives, evidence that would disconfirm the hypothesis, and the reason for choosing the next action. Expectations are especially useful because they make an explanation testable. “This looks like stale state” becomes more informative when the engineer can explain what should happen after the suspected state is reset.

In the following illustrative example, the engineer investigates a cache after observing failures in refreshed sessions:

```json
{
  "decision": "investigate_cache_invalidation",
  "cues": [
    "Failure appears only after background refresh",
    "Fresh sessions do not reproduce the bug"
  ],
  "expectation": "Clearing the suspected cache should remove the stale result",
  "alternatives": [
    "Database replication lag",
    "Client-side state bug",
    "Incorrect cache key"
  ],
  "disconfirming_evidence": [
    "Failure persists after confirming that the relevant cache was cleared"
  ],
  "chosen_action": "Trace cache key construction and test invalidation",
  "reason": "The failure depends on session history rather than initial login"
}
```

The observations narrow the investigation; they do not prove the cause. Record whether the expected result actually occurred, and retain hypotheses that were rejected. Otherwise, the extracted rule can become a retrospective justification for a patch rather than a useful account of how to investigate an uncertain system.

### Look for the experience gap

Ask the expert what someone unfamiliar with the system would probably try first, and why that approach might be insufficient. This comparison can expose knowledge that is difficult to elicit through a general request to explain their expertise.

| Immediate response | Deeper question to investigate |
| --- | --- |
| Fix the line named in the failure | Why did two execution paths diverge? |
| Add a null check | Which invariant was supposed to prevent this state? |
| Run the reported failing test | Which other callers depend on the same assumption? |
| Retry the failed operation | Could retrying duplicate an effect or hide an ordering bug? |

These are illustrative contrasts, not rules about job titles. A local fix may be exactly right. The useful distinction is whether the engineer checks the conditions that make the fix sufficient. That gives benchmark authors a way to construct cases where the obvious test passes but a justified system requirement still fails.

### Separate heuristics from invariants

An expert’s preferred investigation order is different from a requirement the system must satisfy. “I usually inspect the worker first” should not become a rule that every successful agent must follow. Classify extracted knowledge before deciding how it will influence a task or grader.

```text
Extracted knowledge
│
├── Invariant
│   “This state must never occur”
│   └── Candidate state assertion or deterministic test
│
├── Heuristic
│   “When X happens, inspect Y first”
│   └── Task design or diagnostic process signal
│
├── Architectural principle
│   “Keep one authoritative owner of session state”
│   └── Review rubric or narrowly scoped static check
│
├── Warning sign
│   “This pattern can indicate stale state”
│   └── Counterfactual cases that test the hypothesis
│
└── Escalation rule
    “Changing this API requires owner review”
    └── Explicit constraint and available review mechanism
```

These mappings identify candidate evaluation methods. They do not guarantee a reliable verifier. A static check may detect duplicate declarations without determining whether ownership is actually violated, and a test can establish an invariant only over the cases it exercises. Each check needs validation against both acceptable implementations and deliberate violations.

### Capture mental simulation

During review, ask the engineer to explain what they expect to happen when the patch runs beyond the reported example. What happens under retry or concurrency? What if a service restarts between two writes, a dependency becomes unavailable, or an operation returns partial data? What happens to existing callers, repeated migrations, and rollback?

The study [“Code Review as Decision-Making”](https://arxiv.org/abs/2507.09637) examined 34 code reviews with 10 participants using a think-aloud approach. Its model distinguishes an initial phase of establishing context and rationale from an iterative phase of understanding the implementation, assessing it, and selecting the next action. This supports treating review as a sequence of decisions rather than a single judgment of the final diff.

For benchmark construction, the practical implication is to turn an anticipated failure into a concrete scenario. Ask for the starting state, event order, expected outcome, and observable violation. Mental simulation provides the risk hypothesis; a reproducible experiment must establish whether the risk is real in this system.

### Extract the unwritten tests

A reviewer may immediately think of cases absent from the issue and the visible test suite. Capture those cases before they disappear into a comment such as “needs more coverage.” For the session-refresh example, a candidate checklist might be:

```yaml
expert_checks:
  obvious:
    - refresh succeeds for a valid session

  tacit:
    - repeated refresh follows the documented retry contract
    - concurrent refresh does not create unintended duplicate sessions
    - expired refresh tokens are rejected
    - existing login behavior remains unchanged
    - logout invalidates the relevant rotated credentials
```

The retry contract must be established for the particular system: some designs allow a bounded retry, while others reject reuse. The expert’s expectation needs an explicit domain and conditions before it becomes a grading rule.

```text
Expert intuition
      ↓
Risk hypothesis
      ↓
Reproducible scenario
      ↓
Hidden regression test
      ↓
Validated verifier
```

Hidden tests should exercise requirements that are documented, discoverable, or reasonably implied by the task’s contract. They should not penalize an agent for failing to guess an arbitrary preference revealed only in a private interview.

### Give each rule a formal representation

A rule record should retain its source, context, trigger, interpretation, suggested response, and consequences. It should also distinguish a heuristic from a mandatory constraint. The following example is an authoring artifact, not an instruction to expose to the evaluated agent:

```json
{
  "rule_id": "shared_state_003",
  "source": {
    "expert_role": "senior_backend_engineer",
    "episode": "auth_refresh_bug_017"
  },
  "context": {
    "system": "session_management",
    "stage": "debugging"
  },
  "trigger": [
    "Two execution paths maintain copies of the same mutable state"
  ],
  "expert_interpretation": "Copies may diverge if their synchronization contract is incomplete",
  "preferred_response": [
    "Identify the authoritative state owner",
    "Trace mutation and synchronization paths"
  ],
  "avoid": [
    "Patching both paths without checking their consistency contract"
  ],
  "risk_if_ignored": [
    "Delayed state divergence",
    "Failures dependent on operation ordering"
  ],
  "rule_type": "architectural_heuristic",
  "candidate_verification": [
    "hidden_regression_test",
    "expert_rubric",
    "targeted_static_analysis"
  ],
  "validation_status": "candidate"
}
```

In an actual record, link the episode and supporting evidence, document exceptions, and track validation results. Retaining provenance lets authors revisit a rule when a different implementation succeeds or the underlying architecture changes.

### Store the knowledge separately from individual tasks

Keep extracted rules in a reusable knowledge directory alongside the task structure introduced earlier. A rule about state divergence may inform several debugging tasks, review rubrics, and counterfactual variants without being copied into every agent-facing prompt.

```text
long-horizon-swe/
│
├── tacit_knowledge/
│   ├── debugging/
│   │   ├── state_divergence.json
│   │   ├── concurrency.json
│   │   └── failure_localization.json
│   │
│   ├── architecture/
│   │   ├── ownership.json
│   │   ├── abstraction_boundaries.json
│   │   └── compatibility.json
│   │
│   ├── testing/
│   │   ├── regression_patterns.json
│   │   └── hidden_failure_modes.json
│   │
│   └── review/
│       ├── maintainability.json
│       └── deployment_risk.json
│
├── world/
├── expert_traces/
├── tasks/
├── environments/
├── verifiers/
└── validation/
```

Task authors can reference the relevant rule IDs and versions from their authoring records. The resulting task should still leave the investigation to the agent unless the task explicitly supplies that knowledge. A private diagnosis, reference solution, or hidden test must not accidentally enter the agent’s workspace through the shared directory.

### Use disagreement to find missing conditions

When two engineers disagree, ask which assumptions differ. One might prefer a minimal patch because the behavior is isolated. Another might prefer a shared abstraction because several callers rely on the same invariant. The disagreement may reveal a missing fact about the task state rather than a single correct style of engineering.

```text
Expert disagreement
       ↓
Identify the differing assumption
       ↓
Check the repository and episode evidence
       ↓
Make the relevant condition explicit
       ↓
Accept valid alternatives or create distinct task cases
```

Do not force agreement when the evidence leaves a legitimate tradeoff unresolved. Record the range of acceptable solutions and the properties they must preserve. A benchmark gains credibility when it recognizes multiple defensible implementations, including ones the original expert did not choose.

### From tacit knowledge to benchmark artifacts

This process can be understood as a tacit knowledge compiler: an explicit sequence of elicitation, representation, and validation that translates expert observations into usable benchmark material. The term is a design analogy; expert judgment does not become reliable verification merely by being written as JSON.

```text
Expert episode
      ↓
Critical decision
      ↓
Cue and expectation
      ↓
Alternatives and disconfirming evidence
      ↓
Hidden rule and its conditions
      ↓
Failure mode
      ↓
Formal representation
      ↓
Validation against concrete cases
      ↓
┌──────────────────────────────┐
│ Task constraint              │
│ Hidden test                  │
│ Counterfactual case          │
│ Process signal               │
│ Expert rubric                │
└──────────────────────────────┘
```

The goal is to recover the conditions under which the expert’s decisions change. Those conditions explain which variations a benchmark should preserve and which outcomes its verifiers should distinguish. Once the rules have been extracted and checked, they can be embedded in an explicit task specification: the next step is turning the workflow into a structured task.

## Turning the Workflow Into a Structured Task

Convert the expert workflow into a reproducible problem another agent can attempt. Define where the episode begins and ends, then specify the initial repository state, services, fixtures, goal, available tools, observable context, constraints, and termination conditions.

Keep privileged evidence separate. The agent receives the issue and permitted context; the evaluator retains the expert trace, reference patch, and hidden tests. Reveal neither the root cause nor the exact files to edit unless the original task supplied them.

```text
Expert workflow
      ↓
Initial state + goal + constraints
      ↓
Task package
      ├── Agent: tools and observable context
      └── Evaluator: oracle and hidden tests
```

Judge patches against behavioral invariants, allowing multiple valid implementations. The specification reconstructs the conditions that made solving the problem necessary. Next, those conditions must become an executable environment.

## Reconstructing the Tools, State, and Environment

A structured task becomes executable when its software world can be recreated, inspected, modified, and reset. For long-horizon engineering, that world includes the repository, dependencies, runtime, services, database, logs, tests, permissions, and persistent state.

Start from a pinned commit and reproducible dependency installation. Seed the required data, launch services, and verify their health. Every trial must begin from equivalent conditions; repository edits, cached values, or database mutations from a previous attempt must never leak into the next.

<img class="benchmark-diagram" src="{{ '/assets/images/reconstructing-tools-state-environment.png' | relative_url }}" width="1536" height="1024" alt="Task specification connected to an executable software environment with tools, services, persistent state, and reset infrastructure. An agent iterates through actions and observations; validation checks the baseline, reference patch, and reproducibility.">

### Let actions change the world

State should persist within an episode. Editing code changes the worktree; calling an API may mutate the database; restarting a worker changes runtime behavior. Each action produces evidence that informs the next decision.

```text
Task specification
        ↓
Initial world: repository + services + database
        ↓
Agent inspects files, logs, and tests
        ↓
Hypothesis → Action → World changes
                ↑          ↓
                └── New evidence
        ↓
Capture final state → Evaluate → Reset
```

Define the tool surface explicitly: shell, repository search, editing, test execution, and any browser or database access the task requires. Let the agent discover relevant information progressively. Keep reference patches, hidden tests, and evaluator checks outside its accessible workspace.

### Validate the environment before evaluating agents

Replay the baseline, a valid reference solution, and a clean reset. Confirm that the target failure exists initially, the reference fix resolves it, and previously passing behavior remains intact. Check which tests actually executed: a successful command that discovers no relevant tests is not evidence of correctness.

Include controlled failures when recovery is part of the task, recording their triggers or random seeds. Keep shared runtime definitions separate from individual task specifications so one reproducible world can support multiple episodes.

The environment should preserve the consequences of engineering decisions. Once those consequences are observable, the next question is which properties determine success.

## Defining What Success Actually Means

Success is a contract over the resulting system. Begin with the user’s intended outcome: a valid session refresh should keep the user authenticated. Describe the required behavior without prescribing which file, function, or abstraction the agent must change. The expert patch provides evidence of solvability; other implementations should pass when they satisfy the same contract.

### Define what must change and what must remain true

Combine positive requirements with forbidden outcomes. Refresh must work, existing login and logout behavior must remain valid, and authentication and expiry checks must remain enforced. Include required side effects, such as a migration taking effect, and prohibit unrelated database changes or committed credentials when relevant.

A compact success specification makes these expectations explicit:

```json
{
  "task_id": "auth_refresh_017",
  "required_behaviors": [
    "valid_refresh_preserves_session"
  ],
  "regression_requirements": [
    "login_unchanged",
    "logout_invalidates_rotated_credentials"
  ],
  "invariants": [
    "authentication_enforced",
    "expired_credentials_rejected"
  ],
  "forbidden_outcomes": [
    "required_tests_deleted",
    "credentials_hardcoded"
  ],
  "completion": {
    "all_critical_checks_required": true
  }
}
```

For software tasks, combine fail-to-pass checks for the reported defect with pass-to-pass checks for existing behavior. Inspect actual repository, service, database, and test state; the agent’s completion message alone cannot establish success. Passing tests supply evidence within their coverage, so runtime behavior and task-specific invariants may require additional checks.

### Separate completion from diagnostic progress

Require every critical condition for an overall pass. Diagnostic scores can still distinguish an agent that fixes the main behavior but introduces a regression from one that never reproduces the problem. Partial credit must not compensate for a violated authentication requirement. Classify checks according to the task: documentation or lint can be mandatory when the contract requires them.

Some tasks may explicitly accept an evidence-backed escalation when completion requires unavailable information or authority. Define those terminal states beforehand. With the success contract established, the next step is converting its requirements into verifiable checks.

## Converting Success Into Verifiable Checks

A verifier translates each success requirement into observable evidence. Split the contract into atomic claims: valid refresh preserves authentication, expired credentials remain invalid, existing login works, and required tests remain intact. Give each claim its own result so failures remain diagnosable.

### Check behavior through the running system

For session refresh, inspect more than a successful refresh response. Use the returned credential to access a protected route, then confirm that unauthorized access still fails. This illustrative pytest example assumes fixtures providing an isolated application client, a test user, and a server-issued expired credential:

```python
def test_refresh_preserves_authentication(env, test_user):
    session = env.login(test_user)
    refreshed = env.refresh(session.refresh_token)
    assert refreshed.status_code == 200
    assert refreshed.access_token

    account = env.get("/account", token=refreshed.access_token)
    assert account.status_code == 200
    assert account.json()["user_id"] == test_user.id


def test_authentication_remains_enforced(env, expired_token):
    assert env.get("/account", token=None).status_code == 401
    assert env.get("/account", token=expired_token).status_code == 401
```

Adapt the client interface and expected responses to the application’s contract. These tests cover selected behaviors; refresh-token expiry, logout, concurrency, and regressions need separate cases.

Combine fail-to-pass tests for the original defect with pass-to-pass regression tests. Add direct state checks for required database changes, service health, and forbidden side effects. Use structural checks for protected test integrity or committed secrets without requiring the expert’s exact implementation.

### Verify the verifier

Keep grading code and hidden tests outside the agent’s writable environment. Confirm that required tests actually execute, and treat crashes, timeouts, or missing evidence as unresolved evaluation failures rather than success.

Replay reference and alternative valid patches, then challenge the grader with no-ops, partial fixes, deleted tests, and disabled authentication. Every critical requirement must pass; diagnostic scores cannot cancel a security violation.

**Reward hacking** occurs when an agent earns credit by exploiting the verifier without satisfying the intended goal—for example, disabling authentication to make a refresh test pass. When checks become RL rewards, these gaps become optimization targets. Validating acceptance and rejection behavior is therefore the next step in establishing benchmark quality.

## Validating Tasks, Gold Solutions, and Verifiers

Validate the task as a complete system before using it to compare agents or assign RL rewards. A qualified engineer should be able to solve it using exactly the information, tools, and initial state provided. Missing diagnostic evidence or unavailable dependencies can make a realistic-looking task unsolvable.

### Replay valid and invalid solutions

Replay the gold solution from a clean environment. It should resolve the target failure while preserving existing behavior. This establishes evidence of solvability, not a requirement to reproduce that patch. Independently produced alternatives should also pass when they satisfy the success contract.

For a repair task whose initial state contains the defect, use the following expected matrix:

| Candidate | Target behavior | Regressions | Invariants | Verdict |
| --- | --- | --- | --- | --- |
| Gold patch | Pass | Pass | Pass | Pass |
| Valid alternative | Pass | Pass | Pass | Pass |
| No-op | Fail | Pass | Pass | Fail |
| Partial fix | Partial | Pass | Pass | Fail |
| Security bypass | Pass | Pass | Fail | Fail |
| Regression patch | Pass | Fail | Pass | Fail |

These are validation expectations, not measured results. Challenge the verifier with deleted tests, hardcoded outputs, skipped validation, and other reward-hacking attempts. Investigate both false positives, where invalid work passes, and false negatives, where legitimate alternatives fail.

### Check repeatability, access, and coverage

Repeat gold and no-op runs after full resets. Compare repository snapshots, fixtures, service health, and baseline behavior. Attribute failures carefully: infrastructure outages should be recorded separately from agent mistakes, while agent-induced breakage remains relevant evidence.

Inspect accessible Git history, caches, container layers, and temporary files for leaked solutions. Protect private tests and grading code through evaluator isolation. Map every critical requirement to a check and retain its provenance.

Finally, ask an independent engineer to review disagreements and missing assumptions. Record replay outcomes and unresolved failures in a validation manifest. Scaling should begin only after the task consistently accepts legitimate solutions and rejects known violations.

## Scaling One Real Workflow Into a High-Quality Benchmark

Scaling begins by separating the individual case from its reusable engineering structure. A stale-session bug belongs to one repository and commit, but its workflow—localization, hypothesis testing, implementation, regression discovery, and review—can inform many tasks. Preserve those decisions while varying the systems and conditions that make them necessary.

### Vary the work itself

Define task families across debugging, feature development, refactoring, and performance engineering. Vary repository scope, evidence quality, dependency depth, concurrency, compatibility requirements, and delayed failures. Difficulty should come from meaningful engineering dependencies. Missing information must remain discoverable when solving the task requires it.

Reuse environment definitions, setup scripts, tool interfaces, and expert rules. Each new case still needs its own initial state, success contract, reference solution, and verifier. Generation proposes candidates; validation determines which enter the dataset. Reject cases with unreliable resets, missing evidence, or graders that accept shortcuts.

### Standardize the executable package

[Harbor](https://www.harborframework.com/docs/tasks) provides a task format containing instructions, configuration, an environment definition, an optional reference solution, and verification scripts. This gives task authors a common execution boundary while leaving domain requirements and grading quality their responsibility.

```text
task/
├── instruction.md
├── task.toml
├── environment/
│   └── Dockerfile
├── solution/
│   └── solve.sh
└── tests/
    └── test.sh
```

Package reuse reduces repeated setup work, but a shared format does not establish that two tasks measure different capabilities or that either verifier is correct.

### Scale along several dimensions

Existing projects illustrate complementary approaches:

| Project | Scaling lesson |
| --- | --- |
| [DeepSWE](https://arxiv.org/abs/2607.07946) | Its 113 original tasks span 91 repositories and use behavioral verifiers designed to accept different implementations. |
| [FrontierSWE v2](https://www.frontierswe.com/blog/v2) | Its 34 tasks use a 20-hour evaluation horizon, illustrating investment in task depth and domain coverage. |
| [SWE-Marathon](https://github.com/abundant-ai/swe-marathon) | Ultra-long-horizon software tasks, Harbor execution, and published trajectory logs support investigating extended agent behavior. |
| [SWE-Lancer](https://openai.com/index/swe-lancer/) | More than 1,400 paid freelance tasks ground evaluation in real engineering work; implementation tasks use expert-verified end-to-end tests. |
| [Harvey LAB](https://github.com/harveyai/harvey-labs) | Although focused on legal work, its separation of task instructions, documents, rubrics, and execution harness offers a transferable architecture. |

The implication for software benchmarks is that task count, horizon, diversity, and professional relevance are separate design choices. Increasing one does not automatically improve the others.

### Protect diversity and reliability

Track provenance and decision structure so renamed prompts or closely related patches do not inflate coverage. Split related cases together, holding out repositories or workflow families when evaluating transfer. Keep evaluation solutions and private checks outside training data and accessible task artifacts.

Run repeated trials to distinguish reliable completion from occasional success. Report results by workflow, difficulty, and horizon alongside aggregate scores. Record infrastructure failures separately, and version task definitions, environments, and verifiers so changes remain auditable.

Reserve expert review for new failure modes and ambiguous requirements while automating established replay checks. Expansion should preserve the evidence that each task is solvable, discriminative, and resistant to known reward-hacking strategies.

The unit being scaled is the complete verified task pipeline. A diverse collection of executable, resettable tasks also supplies the foundation for the final stage: using the benchmark as an RL environment.

## Using the Benchmark as an RL Environment

The pipeline now produces resettable tasks, executable software worlds, explicit success contracts, validated verifiers, and a diverse task distribution. These are much of the infrastructure reinforcement learning needs. Evaluation runs a fixed policy to measure performance; training repeatedly samples tasks, collects interactions, computes rewards, and updates the policy from that experience.

<img class="benchmark-diagram" src="{{ '/assets/images/benchmark-as-rl-environment.png' | relative_url }}" width="1536" height="1024" alt="A benchmark supplies tasks, a software world, a success contract, and verifiers to an RL environment. The agent interacts through tools, observations, and rewards. Learning collects rollouts and updates the policy, while failures inform new tasks and a better benchmark.">

### Map the benchmark onto the learning problem

| Benchmark component | Role in RL |
| --- | --- |
| Task distribution | Distribution over goals and initial states |
| Repository, services, database | Environment state |
| Files, logs, test results | Observations |
| Shell commands, edits, tool calls | Actions |
| Changes caused by actions | Transition dynamics |
| Success contract | Intended objective |
| Verifier results | Evidence used to compute reward |
| Submission and execution limits | Episode termination or truncation |

The agent observes only part of the software world, so its decisions depend on interaction history. A failed test changes what it knows; an edit changes the system it must reason about next. Retain observations, actions, tool outputs, checkpoints, and final metrics in each rollout. The training algorithm uses these records to assign credit and update the policy; a scalar score alone is not a complete training pipeline.

The same environment implementation can support both modes while preserving the task’s meaning. [Prime Intellect’s Verifiers](https://github.com/PrimeIntellect-ai/verifiers), for example, provides environments for training and evaluating language models. Reusing infrastructure helps avoid discrepancies between what training rewards and what evaluation measures.

### Start with verified outcome rewards

Begin with the success contract already established. An illustrative terminal reward grants credit only when all required conditions pass:

```python
def terminal_reward(checks):
    required = (
        "target_behavior",
        "regressions",
        "security_invariants",
        "verifier_integrity",
    )
    if any(checks.get(name) is not True for name in required):
        return 0.0
    return 1.0
```

This example assumes a completed, valid grading run. Infrastructure failures need separate handling before reward computation; they should not silently become negative training examples. An agent-caused violation, however, remains part of the outcome being evaluated.

Long horizons make terminal rewards sparse. A trajectory that nearly succeeds may receive the same zero as one that never localizes the bug. Diagnostic checks can supply partial-progress signals, but a score decomposed only at the end is still terminal feedback. Intermediate rewards require checking meaningful subgoals during execution.

Reward changes in relevant system properties rather than commands the expert happened to run. Avoid repeatedly paying for the same achievement, and test whether shaping encourages agents to preserve partial credit instead of completing the task. Keep the strict overall success metric separate. Critical security or integrity failures must not be offset by accumulated functionality rewards; a final gate alone cannot erase positive rewards already issued earlier in an episode.

### Expect optimization to expose reward hacking

Under RL, a verifier loophole can become a repeatable strategy: an action earns unintended reward, the update reinforces it, and subsequent rollouts exploit it more often. Prime Intellect’s [account of scaling agentic RL](https://www.primeintellect.ai/blog/scaling-agentic-rl) describes grading artifacts becoming optimization targets and withholding tests until scoring. It also emphasizes that this mitigation does not guarantee isolation when grading shares the agent’s sandbox.

Use a protected evaluation runtime for hidden tests, reference artifacts, and reward computation. Treat submitted code as untrusted even there: moving grading to another container is insufficient if that code can still overwrite the grader or forge its results. Preserve adversarial checks and audit newly rewarded behaviors against the intended engineering outcome.

### Build a curriculum and protect the holdout

If the initial policy almost never succeeds, validated demonstrations or easier tasks can provide a starting point. Increase difficulty through larger dependency chains, weaker but recoverable evidence, integration requirements, and longer horizons. Successful trajectories may support supervised initialization; failures can inform task selection and debugging.

Split task families before training. Keep related variants together, and reserve unseen repositories or workflows for transfer evaluation. Tasks used for policy updates are training data, even if they began as a benchmark. Development results guide iteration; the final holdout must remain outside training and routine task refinement.

Track held-out full success, repeated-trial reliability, regression and invariant violations, reward-hacking attempts, and execution cost alongside training reward. When comparing harnesses, record differences in tools and budgets. Reward gains under one interface do not by themselves establish broader engineering improvement.

### Close the loop with new failures

A rollout that fixes a feature but corrupts rollback reveals a candidate failure mode. Have experts inspect it, recover the missing condition, and construct a new task or verifier case. Validate it before adding it to the training distribution, and version the change so results remain interpretable.

```text
Real work → Expert capture → Hidden decision rules
    ↓
Structured task → Executable world → Success contract
    ↓
Verifier → Validation → Task distribution
    ↓
Training rollouts → Policy updates → Failure analysis
    │                                      │
    └──────── New validated tasks ←─────────┘
```

The path from real work to RL depends on the quality of the tasks being reconstructed. Expert knowledge identifies the decisions that matter; environments give those decisions consequences; verifiers turn outcomes into learning signals. With protected holdouts and continued validation, the resulting system can both measure an agent’s ability and provide the experience through which that ability improves.

## Conclusion

Turning real-world work into an RL environment is ultimately a problem of preserving what makes the work difficult while making it reproducible, observable, and verifiable. The process starts with expert practice, extracts hidden decisions, reconstructs the software world, defines success, and converts that success into checks that can survive adversarial pressure. Once those tasks are validated and scaled, the same infrastructure can support both evaluation and reinforcement learning. Agents act, environments change, verifiers produce learning signals, and failures reveal new tasks to build. The benchmark becomes more than a scorecard: it becomes a continuously improving substrate for learning real work.

<script>
  (function () {
    document.querySelectorAll('pre > code').forEach(function (code) {
      var pre = code.parentElement;
      var language = Array.from(code.classList).find(function (name) { return name.indexOf('language-') === 0; });
      if (!language || pre.querySelector('.copy-code')) return;
      var button = document.createElement('button');
      button.className = 'copy-code';
      button.type = 'button';
      button.textContent = language === 'language-python' ? 'Copy Python' : (language === 'language-json' ? 'Copy JSON' : 'Copy code');
      button.addEventListener('click', function () {
        navigator.clipboard.writeText(code.textContent).then(function () {
          button.textContent = 'Copied';
          window.setTimeout(function () { button.textContent = language === 'language-python' ? 'Copy Python' : (language === 'language-json' ? 'Copy JSON' : 'Copy code'); }, 1400);
        });
      });
      pre.appendChild(button);
    });
  }());
</script>
