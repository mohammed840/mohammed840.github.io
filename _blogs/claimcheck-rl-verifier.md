---
title: "A Correct Verdict Is Not Enough: RL for Evidence-Grounded Claim Verification"
date: 2026-07-02
layout: blog
author: Mohammed Alshehri
---

<style>
.claimcheck-toc {
  float: right;
  width: min(18rem, 40%);
  margin: 0 0 1.5rem 2rem;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
}

.claimcheck-toc h2 {
  margin-top: 0;
}

.claimcheck-toc ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.claimcheck-toc li + li {
  margin-top: 0.45rem;
}

.blog-post-content h2 {
  border-bottom: 0;
  padding-bottom: 0;
}

@media (max-width: 760px) {
  .claimcheck-toc {
    float: none;
    width: auto;
    margin: 0 0 1.5rem;
  }
}

.math-block {
  overflow-x: auto;
  margin: 1.25rem 0;
}
</style>

<script>
  window.MathJax = {
    tex: {
      inlineMath: [["\\(", "\\)"]],
      displayMath: [["\\[", "\\]"]]
    },
    svg: { fontCache: "global" }
  };
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>

<aside class="claimcheck-toc" aria-label="Table of contents">
  <h2>Table Of Contents</h2>
  <ul>
    <li><a href="#introduction">Introduction</a></li>
    <li><a href="#building-the-benchmark">Building the Benchmark</a></li>
    <li><a href="#reward-pressure-and-its-traps">Reward Pressure and Its Traps</a></li>
    <li><a href="#training-routes">Training Routes</a></li>
    <li><a href="#evidence-guardrails">Evidence Guardrails</a></li>
    <li><a href="#separating-the-signals">Separating the Signals</a></li>
    <li><a href="#the-final-grpo-run">The Final GRPO Run</a></li>
    <li><a href="#the-rl-tradeoff">The RL Tradeoff</a></li>
    <li><a href="#what-the-model-learned">What the Model Learned</a></li>
    <li><a href="#closing">Closing</a></li>
  </ul>
</aside>

## Introduction

The idea for this project came from a very practical frustration with retrieval-augmented systems: the answer can sound right while the evidence is doing almost none of the work. In company policies, contracts, HR rules, privacy/security documents, and legal clauses, that is not a small formatting mistake. If a model says a claim is supported, it should be able to point to the exact clause, quote the exact sentence, and separate "fully supported" from "partially supported", "unsupported", "contradicted", or "overclaim".

This started as an information retrieval problem before it became an RL problem.

The retrieval literature kept pulling me in this direction. ColBERT made the case that retrieval should not always compress a whole passage into one vector. Its late-interaction design keeps token-level document vectors and lets the query interact with them through MaxSim at search time, preserving fine-grained matching while still allowing documents to be indexed offline. ColBERTv2 then made that idea lighter by reducing the storage cost of late interaction, and PLAID showed that late-interaction search could be made fast enough for large-scale retrieval. Baleen pushed the same family of ideas into multihop reasoning and claim verification, using condensed retrieval so a system can retrieve, compress what it found, and hop again.

That was exactly the shape of the problem I cared about. Evidence verification is not just "find a similar paragraph." It is closer to: find the right clause, preserve the exact wording, notice which part of the claim is not covered, and sometimes combine multiple pieces of evidence before giving a verdict.

Mixedbread's recent retrieval work made the motivation even stronger. Their ColBERT model and later late-interaction systems argue for the same basic thing: single-vector search is fast and useful, but it can wash away the precise signals that matter in dense, legal, technical, or document-heavy settings. Their newer writing around late-interaction retrieval, edge ColBERT models, reranking, and multimodal search made me think of this project less as "can we train a verifier?" and more as "can we build a verifier whose reward actually cares about retrieval quality?"

So the question became simple:

Can reinforcement learning make a small verifier better at evidence-grounded claim checking, especially when the evidence has to be exact?

At first this looked like a clean RL problem. We could generate controlled documents, create claims with known labels, ask a model to return a structured verdict, and reward it for being right. The output was verifiable: valid JSON, correct final verdict, valid evidence IDs, exact quotes, unsupported spans, and false-support penalties. It felt like the kind of task where RL should shine, because every answer could be scored automatically.

But the more important question was not just whether the model could choose the right label. It was whether the model could ground that label in the retrieved evidence.

A verifier that says "supported" for the right reason is very different from a verifier that says "supported" because the paragraph sounds semantically nearby. A verifier that quotes a vague sentence is different from one that quotes the exact obligation, exception, or condition. A verifier that retrieves one correct policy section but misses the second required condition is still unsafe. This is where the IR ideas mattered: late interaction, reranking, multihop retrieval, and evidence condensing all point toward the same lesson that fine-grained evidence matters.

The project ended up being more interesting than that.

We built a full synthetic verification environment across five document domains: company policies, legal clauses, privacy/security docs, HR rules, and contracts. We added static baselines, quote-grounding metrics, hard and out-of-distribution tests, offline RL scaffolding, an online evidence-search environment, multihop retrieval, hosted GRPO training runs, a Qwen 9B SFT warmup, and multiple RL attempts.

The result was not a clean "RL wins" story.

The supervised fine-tuned Qwen 9B adapter was the first model that made the verifier feel like a real product: valid JSON, exact quotes, evidence IDs, and strong hard/OOD behavior. Early RL after SFT did help in a narrower way, especially on multihop evidence behavior, but it also bent hard and OOD verdict calibration. That was the uncomfortable middle result: RL had clearly learned something useful, but it was not yet safe to promote as the default model.

The later GRPO v2 run changed the ending. The first hosted GRPO run proved that the setup was real, but it also exposed a bad failure mode: the reward got too easy, mixed/hard/OOD saturated, and quote validity degraded in the later checkpoint. GRPO v2 was built specifically to fix that. It used a validity-gated reward: the model only got meaningful verdict credit when the evidence IDs, exact quotes, and quote coverage were also good.

That v2 run did what I wanted a targeted RL run to do. A 20-step GRPO run on `Qwen/Qwen3.5-9B` moved v2 validation and v2 multihop reward from `0.760` to `0.970`, while keeping quote validity at `1.000`. The deployed final adapter also held up on the older evals: legacy mixed `0.960`, hard `0.980`, OOD `0.971`, and legacy multihop `0.910`. Some larger hosted evals failed during sample upload, so those scores are log-derived rather than dashboard-finalized, but the reward summaries were produced before upload failed.

TL;DR:

We tried to use RL to improve evidence-grounded claim verification. The project was motivated by modern information retrieval work: ColBERT-style late interaction, ColBERTv2/PLAID efficiency, Baleen-style multihop retrieval, and Mixedbread's push toward practical late-interaction search. SFT gave the model the verifier language. Early RL exposed the danger of reward pressure. GRPO v2 then showed that a better-gated RL reward can fix a specific grounding failure: quote validity stayed perfect while multihop reward improved. The central lesson is that a correct verdict is not enough: the model must also cite real evidence, quote text that actually appears, and know when the claim is only partially supported or unsupported. The rest of this writeup is the autopsy: what we built, where retrieval mattered, where RL helped, where it regressed, and why the current best system is SFT-first with carefully gated RL experiments.

## Building The Benchmark

The first version of the problem looked deceptively simple: generate a policy-like document, write a question, write an answer, attach evidence, and ask the verifier whether the answer is supported. Because the evidence is synthetic, the ground truth is known. That makes the task attractive for RL: the model can produce an answer, and the environment can score it automatically.

But I did not want a toy dataset where `supported` just means high word overlap and `unsupported` just means the answer uses different vocabulary. The real failure mode I cared about was much quieter than that. A model cites a related clause, changes a deadline from 7 days to 14 days, drops a required condition, applies a rule to the wrong party, or turns a narrow exception into a general policy. The answer sounds reasonable, the citation looks plausible, and the final verdict is wrong.

So the dataset was built around controlled corruptions. Each example starts from a clean source document, then the generator deliberately injects one evidence failure. That gives us both the label and the reason for the label.

![Controlled corruption data generation pipeline](assets/datagen_controlled_corruptions_v2.svg)

The first full dataset covered five document domains: company policies, legal clauses, privacy/security docs, HR rules, and contracts. I picked these because they punish loose retrieval. These documents are full of conditions, exceptions, deadlines, party-specific obligations, and version-sensitive wording. In that setting, being semantically close is not enough. The verifier has to preserve the exact claim.

The label space also had to be richer than binary support. The project uses five verdicts: `supported`, `partially_supported`, `unsupported`, `contradicted`, and `overclaim`. That distinction matters because a verifier should not treat every failure the same way. A contradicted deadline is different from an invented reason, and both are different from an answer that is mostly right but too broad.

Version 1 used 5,000 training examples, 1,000 validation examples, 1,000 OOD examples, and 500 hard examples. Later, I added a 500-example multihop test set because the first retrieval tests were too easy. The full original generator produced 7,500 examples and 7,500 source documents.

| Split | Examples | Why It Exists |
|---|---:|---|
| Train | 5,000 | main supervised/RL training pool |
| Validation | 1,000 | in-distribution model selection |
| OOD test | 1,000 | domain/style generalization |
| Hard test | 500 | subtle overclaims, contradictions, irrelevant citations |
| Multihop test | 500 | cases where one evidence chunk is not enough |

The corruptions were the core of the premise. Some examples are clean supported answers. Others change numbers, dates, entities, causes, scope, or conditions. Some cite topically related evidence that does not prove the answer. Some combine a supported claim with an unsupported one. This gave the model examples where the surface form could look right while the evidence relationship was wrong.

A typical SFT target was not just a class label. The model had to return a structured verification object: claim-level statuses, evidence IDs, exact quotes, unsupported spans, reasons, and a final verdict. That structure is what made the later reward possible. We could score not only whether the model predicted the right label, but whether it used real evidence and quoted text that actually appeared in the snippet.

```json
{
  "claims": [
    {
      "claim": "...",
      "status": "supported | unsupported | contradicted | overclaim",
      "evidence_ids": ["E1"],
      "quote": "...",
      "unsupported_span": "...",
      "reason": "..."
    }
  ],
  "final_verdict": "supported | partially_supported | unsupported | contradicted | overclaim",
  "evidence_used": ["E1"]
}
```

The multihop split changed the character of the benchmark. The earlier examples mostly had one primary evidence chunk plus decoys, so top-3 retrieval saturated. The multihop set gives each example five evidence chunks and often requires combining multiple snippets before deciding. In retrieval terms, this is where the project starts to look more like the ColBERT/Baleen motivation: retrieve useful evidence, condense it, carry the right facts forward, and only then judge the claim.

The premise of the dataset was therefore simple but strict: make the ground truth automatic, make the evidence failures controlled, make the labels balanced, make the output auditable, and make retrieval matter. That gave us a clean place to test the bigger question: does RL actually improve evidence-grounded verification, or is the supervised signal already the stronger teacher?

## Reward Pressure And Its Traps

Once the dataset existed, the next temptation was obvious: just reward the model for the correct final verdict.

That would have been the wrong reward.

In this project, the final label is only the visible end of the task. The real thing we care about is the evidence relationship underneath it. A verifier can predict `supported` and still be useless if it cites the wrong evidence. It can predict `overclaim` but fail to mark the span that overclaims. It can predict `contradicted` while quoting text that never appears in the evidence. All of those outputs might look structured, but they are not trustworthy.

So the reward had to become a bundle of smaller checks:

- did the model return valid JSON?
- did it choose the correct final verdict?
- did it cite real evidence IDs?
- did its quote actually appear in the cited evidence?
- did it identify unsupported spans when the answer was not fully supported?
- did it avoid saying `supported` when the gold label was anything else?

The first reward looked roughly like this:

{::nomarkdown}
<div class="math-block">
\[
\begin{aligned}
R_0 &=
J
+ V
+ E \\
&\quad + Q
+ S
+ F
\end{aligned}
\]
</div>
{:/}

Here `J` means valid JSON, `V` means verdict correctness, `E` means evidence-ID quality, `Q` means quote validity, `S` means unsupported-span quality, and `F` means the false-supported guard.

This made the training signal much less binary. A bad answer could still get partial credit for being valid JSON or citing a real evidence ID. A nearly good answer could lose credit for a fake quote or a missing unsupported span. That mattered because pure correct/incorrect reward was too sparse for the model to learn all of the behavior at once.

Here is the kind of output the reward was designed to inspect:

```json
{
  "claims": [
    {
      "claim": "Customers must submit a reimbursement request within 14 days.",
      "status": "contradicted",
      "evidence_ids": ["E1"],
      "quote": "Customers must submit a reimbursement request within 7 days when the expense is approved by a manager.",
      "unsupported_span": "within 14 days",
      "reason": "The answer changes the deadline from 7 days to 14 days."
    }
  ],
  "final_verdict": "contradicted",
  "evidence_used": ["E1"]
}
```

That JSON is useful because every part of it can be checked. `E1` either exists or it does not. The quote either appears in `E1` or it does not. The unsupported span either appears in the answer or it does not. The final verdict either matches the gold label or it does not.

The reward loop looked like this:

![Grounding-aware reward loop](assets/reward_loop_grounding_v2.svg)

The first major failure mode was exactly what this diagram is trying to catch: a correct-looking verdict with weak evidence. Before the quote-grounded evaluator, a model could get the high-level label right while citing a vague or invalid quote. The quote-grounding tests showed why this mattered: the strongest deterministic verifier by label accuracy was still weaker on quote exact match. That was the warning sign that label accuracy and evidence grounding are not the same metric.

The second failure mode was the RL version of the same problem. The staged RL polish improved some guard behavior, but it weakened final-verdict calibration. The model became good at formatting and grounding pieces of the answer, yet still confused labels like `partially_supported`, `unsupported`, and `overclaim`. This was the important warning: aggregate reward can look reasonable while one critical dimension quietly gets worse.

The next reward changed the verdict term to depend on evidence quality. A correct label should not receive full credit unless the evidence behavior is also good. That reward looked more like this:

{::nomarkdown}
<div class="math-block">
\[
\begin{aligned}
R &=
J
+ V \cdot W_E
+ E \\
&\quad + Q
+ S
+ F
\end{aligned}
\]
</div>
{:/}

Here `W_E` is the evidence-validity weight applied to the verdict term.

This was the right idea, but not yet the final answer. The first verdict-gated run improved multihop substantially, which means the reward really did push the model toward better evidence behavior. But it also hurt hard and OOD performance. The model became stricter, but sometimes too strict: safer partial judgments increased while final-verdict calibration got worse on the general sets.

The later GRPO v2 reward tightened the gate. It did not merely ask whether the model had a correct final verdict and a plausible citation. It made the final verdict credit depend on exact quote behavior and quote coverage:

{::nomarkdown}
<div class="math-block">
\[
\begin{aligned}
G_V &=
V
\cdot E
\cdot Q
\cdot C
\end{aligned}
\]
</div>
{:/}

Here `G_V` is gated verdict credit, and `C` is quote coverage.

That changed the optimization target. A model could no longer get away with "right label, weak evidence" or "right evidence ID, fake quote." The v2 reward had this shape:

{::nomarkdown}
<div class="math-block">
\[
\begin{aligned}
R_{\mathrm{v2}} &=
0.05J
+ 0.30G_V
+ 0.20E \\
&\quad + 0.20Q
+ 0.15C
+ 0.05S
+ 0.05F
\end{aligned}
\]
</div>
{:/}

This was the first RL reward in the project that directly attacked the quote-collapse failure. It preserved the thing that mattered: exact evidence. In the deployed final adapter eval, quote validity stayed at `1.000` across v2 validation, v2 multihop, legacy mixed, hard, OOD, and legacy multihop logs.

That gave us the central reward-shaping lesson of the project:

Rewarding evidence grounding is necessary, but not sufficient. If the reward overweights grounding without protecting label calibration, the model can become a better evidence user and a worse general verifier at the same time.

So the reward had to defend against three related failures:

- **false support:** the model says `supported` because the evidence sounds related,
- **over-caution:** the model avoids support too aggressively and damages hard/OOD verdict accuracy,
- **quote collapse:** the model gives the right verdict while the quoted evidence becomes fake, vague, or incomplete.

The final takeaway for this section is not that reward shaping failed. It is that reward shaping exposed the real problem. The verifier was no longer struggling with JSON. It was struggling with calibrated judgment under evidence constraints.

## Training Routes

At this point the project had a dataset, a structured target, and a reward that cared about grounding. The next question was not "can I train something?" It was "which kind of training signal actually matches the problem?"

The design space had a few obvious options. The simplest option was a static verifier: use lexical overlap, number/date rules, an embedding-style similarity proxy, or an NLI-style proxy to decide whether the answer follows from the evidence. This was important because it protected the project from fake progress. If a cheap rule-based method solved the task, then RL would be theater. The static baselines did surprisingly well on some simple labels, especially when the evidence relationship was obvious, but they were brittle on quote grounding, false support, and multihop evidence.

The next option was supervised fine-tuning. SFT is the boring answer in the best possible way. The model sees the question, answer, evidence, and the full gold verifier JSON. It learns the output format, the label mapping, the evidence ID convention, the quote style, and the unsupported-span behavior directly from examples. This is a dense signal: every token of the target teaches the model something. For this task, that density mattered a lot.

Offline RL was the next step. In the offline setting, the model receives the evidence up front and only has to produce the verifier JSON. That removes the retrieval problem and isolates the reward problem. If offline RL cannot improve evidence use when the evidence is already visible, then online RL with tools would be premature. This is where the project tested whether reward shaping could improve process-sensitive behavior like quote validity, evidence ID F1, unsupported-span detection, and false-supported rate.

Online RL was the more ambitious version. In that setting, the model does not see all evidence at the beginning. It has to search, read, and then submit a verdict. This is closer to Veri-R1 and closer to how an actual retrieval-augmented verifier should behave. The agent needs a tool loop: search for evidence, read a snippet, decide whether it is enough, maybe search again, then return a grounded JSON answer. The reward is no longer just about the final output. It also depends on whether the model cited evidence it actually read.

The retrieval branch became its own design axis. The first retrieval layer was intentionally simple: BM25-style search plus sentence-level condensation. But the direction was inspired by ColBERT and Baleen. The goal was not just to retrieve a top paragraph; it was to preserve small facts, carry them across hops, and make the verifier reason over the right evidence. The multihop split was added because the earlier retrieval tests saturated too quickly. Once recall@1 failed and recall@3 became necessary, the benchmark finally started testing the behavior I cared about.

The algorithmic shape of the verifier was more important than the training label. Each example can be written as:

{::nomarkdown}
<div class="math-block">
\[
\begin{aligned}
x &= (\mathrm{question}, \mathrm{answer}, \mathrm{evidence}) \\
y &= \mathrm{verifier\ JSON}
\end{aligned}
\]
</div>
{:/}

The verifier is trying to learn a policy:

{::nomarkdown}
<div class="math-block">
\[
\pi_{\theta}(y \mid x)
\]
</div>
{:/}

where `y` is not just a class label. It is a structured object containing claim statuses, evidence IDs, quotes, unsupported spans, and a final verdict.

For SFT, the objective is straightforward maximum likelihood on the gold JSON:

{::nomarkdown}
<div class="math-block">
\[
L_{\mathrm{SFT}}(\theta) = - \sum_t \log \pi_{\theta}\left(y_t^* \mid x, y_{\lt t}^*\right)
\]
</div>
{:/}

This gives the model dense token-level supervision. If the gold output contains the right quote, the right evidence ID, and the right final verdict, the model gets direct gradient signal for all of those pieces. That is why SFT was such a strong baseline here.

For RL, the model first samples or generates a verifier output:

{::nomarkdown}
<div class="math-block">
\[
\hat{y} \sim \pi_{\theta}(\cdot \mid x)
\]
</div>
{:/}

Then the environment scores it:

{::nomarkdown}
<div class="math-block">
\[
\begin{aligned}
R(\hat{y}, y^*) &=
w_{\mathrm{json}} \cdot \mathrm{validJson}
+ w_v \cdot \mathrm{finalVerdict}
+ w_e \cdot \mathrm{evidenceId} \\
&\quad + w_q \cdot \mathrm{quoteValidity}
+ w_s \cdot \mathrm{unsupportedSpan}
+ w_f \cdot \mathrm{falseSupportedGuard}
\end{aligned}
\]
</div>
{:/}

The verdict-gated reward changed the verdict term so the label reward depended on evidence quality:

{::nomarkdown}
<div class="math-block">
\[
\begin{aligned}
R_{17}(\hat{y}, y^*) &=
w_{\mathrm{json}} \cdot \mathrm{validJson}
+ w_v \cdot \mathrm{finalVerdict} \cdot \mathrm{evidenceValidityWeight}
+ w_e \cdot \mathrm{evidenceId} \\
&\quad + w_q \cdot \mathrm{quoteValidity}
+ w_s \cdot \mathrm{unsupportedSpan}
+ w_f \cdot \mathrm{falseSupportedGuard}
\end{aligned}
\]
</div>
{:/}

The local RL trainer used a simple reward-weighted update. Intuitively, completions above the reward baseline were reinforced and completions below it were discouraged:

{::nomarkdown}
<div class="math-block">
\[
\begin{aligned}
\mathrm{advantage} &= R(\hat{y}, y^*) - b \\
L_{\mathrm{RL}}(\theta) &=
-\mathrm{advantage} \cdot
\sum_t \log \pi_{\theta}\left(\hat{y}_t \mid x, \hat{y}_{\lt t}\right)
\end{aligned}
\]
</div>
{:/}

That is a much weaker teacher than SFT when the gold JSON is already available. SFT says, token by token, "write this exact structured verifier trace." RL says, after the whole completion, "this sampled trace scored 0.84." The RL signal is useful, but it is coarser and easier to miscalibrate.

The verifier algorithm itself stayed the same across SFT and RL:

```text
for each example:
    receive question and answer
    retrieve or read candidate evidence
    decompose the answer into claims
    for each claim:
        decide claim status
        cite evidence IDs
        quote exact evidence text
        mark unsupported span if needed
    produce final_verdict
    score JSON with grounding-aware reward
```

Training changed how much of that algorithm was taught directly. Static baselines skipped most of it and guessed from surface features. SFT taught the whole output procedure directly. Offline RL started from generated completions and pushed them toward higher reward. Online RL made the model operate the evidence tools before producing the final JSON.

The hosted GRPO runs made the design space less abstract. The early 0.8B RL run improved held-out reward over the base model, especially quote validity and false-supported guard, but the final-verdict score stayed weak. The Qwen 9B SFT warmup solved much more of the task. When RL was applied after SFT, it did not become the best model; it slightly damaged the general held-out scores. The later local verdict-gated reward was more evidence-aware and improved multihop substantially, but again hurt hard and OOD.

The hosted GRPO runs added the missing piece. The first Qwen 9B GRPO run proved the project had crossed from "RL-style local experiment" into real hosted GRPO training, but it also showed why the reward needed to be harder. The step-20 and step-40 checkpoints saturated mixed, hard, and OOD evals, while multihop stayed informative. Worse, the step-40 checkpoint improved aggregate multihop while quote validity dropped. That was the warning sign: the reward was rewarding the right-looking outcome without protecting the evidence surface tightly enough.

GRPO v2 was the narrower answer. It used the same Qwen 9B family and an RL environment, but changed the task distribution and reward so exact quote coverage became central. The final v2 run was deliberately short: 20 steps designed to answer one question: can GRPO improve multihop verification without losing quote grounding? On that question, the answer was yes.

So the design-space conclusion was not "choose RL" or "choose SFT." It was more specific than that. SFT is the strongest way to teach the verifier trace when we have clean gold JSON. RL is useful when we want to pressure a particular behavior that can be scored automatically: exact quotes, evidence IDs, false support, multihop coverage. GRPO v2 showed that this pressure can work, but only after the reward is narrow enough that the model cannot win by weakening the evidence.

## Evidence Guardrails

The deliverable was never just a model that predicts the right verdict. The thing I wanted to protect was a grounded verifier: a model that can say what is supported, cite the exact evidence, quote the relevant text, mark the unsupported span, and give a short reason that does not invent anything.

This is where reward design gets dangerous. The model optimizes what the reward measures, not what I meant. If the reward only checks `final_verdict`, then a completion like this can score perfectly:

```json
{
  "claims": [
    {
      "claim": "Employees must submit the leave request within 21 working days.",
      "status": "supported",
      "evidence_ids": [],
      "quote": "",
      "unsupported_span": "",
      "reason": ""
    }
  ],
  "final_verdict": "supported",
  "evidence_used": []
}
```

The label may be right, but the verifier has failed at the actual job. It did not cite evidence. It did not quote the policy. It gave no auditable reason. In a normal accuracy table this looks fine; in a retrieval-grounded system it is a broken product. This is reward hacking, but not in the flashy sense. It is the quieter kind: the model satisfies the scoreboard while deleting the part of the behavior the product actually needs.

| What the model optimizes | What can go wrong |
|---|---|
| `final_verdict` only | correct label with no evidence |
| valid JSON | parseable but empty verifier output |
| non-empty `quote` | quote-like text that does not appear in evidence |
| evidence ID field | guessing `E1` without checking the snippet |
| short `reason` | generic explanation with no grounded content |

The naive fix would have been an additive format reward: give some points for JSON, some points for a quote, some points for a reason, and hope the model learns to fill the fields. That surface is too easy to game. A model can put text in `quote` without making it a real quote. It can cite `E1` because `E1` often appears in the prompt. It can write a generic reason like "the evidence supports the answer" without actually grounding the claim.

So the protection had to be more structural. The verifier should not get full credit for the verdict unless the evidence behavior is also good. In other words, the label reward needs a gate:

{::nomarkdown}
<div class="math-block">
\[
\mathrm{labelCredit} = \mathrm{finalVerdictCorrect} \cdot \mathrm{evidenceValidityWeight}
\]
</div>
{:/}

where `evidence_validity_weight` is not a style score. It comes from concrete checks: cited evidence IDs must exist, quoted text must appear inside the cited evidence, unsupported spans must be present when needed, and the model must avoid false support.

The protected reward then becomes:

{::nomarkdown}
<div class="math-block">
\[
\begin{aligned}
\mathrm{reward} &=
\mathrm{validJson}
+ \mathrm{labelCredit}
+ \mathrm{evidenceId} \\
&\quad + \mathrm{quoteValidity}
+ \mathrm{unsupportedSpan}
+ \mathrm{falseSupportedGuard}
\end{aligned}
\]
</div>
{:/}

This is the verifier version of a reasoning gate. The protected artifact is not free-form reasoning; it is evidence-grounded JSON. A correct answer with no evidence should not receive the same reward as a correct answer with a real citation and quote.

There was also a tool-side version of the same idea. In the online environment, citing evidence was not enough. The model had to actually read the evidence before citing it. A blind submission with gold-looking JSON could still be penalized if the trace showed that the evidence was never opened. That mattered because otherwise the model could learn a fake verifier workflow: guess the evidence ID, produce plausible JSON, and skip retrieval entirely.

This worked exactly in the narrow way it was supposed to work. The early small RL adapter improved held-out reward from `0.47275` to `0.71850`. The biggest movement was not mysterious: quote validity went from `0.345` to `1.000`, and the false-supported guard went from `0.420` to `0.910`. The model learned that evidence fields were not decorative.

| Metric | Base | RL adapter | Change |
|---|---:|---:|---:|
| Held-out reward | 0.47275 | 0.71850 | +0.24575 |
| Quote validity | 0.345 | 1.000 | +0.655 |
| False-supported guard | 0.420 | 0.910 | +0.490 |

The larger local verdict-gated run gave the same lesson in a sharper form. Multihop reward improved from `0.621933` to `0.720400`, which is a real gain on the part of the benchmark where retrieval and evidence composition matter most. The gate was doing something. It pushed the model toward more disciplined evidence use.

But this is also where the uncomfortable part showed up. The same verdict-gated run that helped multihop hurt the general sets: mixed dipped slightly, hard dropped from `0.915500` to `0.883700`, and OOD dropped from `0.916550` to `0.881500`. The model became stricter, but not always wiser. It started preferring safer partial or unsupported judgments, and final-verdict calibration suffered.

| Split | SFT-only | Verdict-gated RL | Change |
|---|---:|---:|---:|
| Mixed | 0.844158 | 0.840850 | -0.003308 |
| Hard | 0.915500 | 0.883700 | -0.031800 |
| OOD | 0.916550 | 0.881500 | -0.035050 |
| Multihop | 0.621933 | 0.720400 | +0.098467 |

So the gate protected the deliverable from one failure mode while exposing another. Without the gate, the model can be accurate but ungrounded. With too much pressure from the gate, the model can be grounded but miscalibrated.

GRPO v2 was the attempt to protect both sides at once. Instead of only making the model cautious, it made exact evidence a condition for verdict credit. The 20-step run moved v2 validation and v2 multihop from `0.760` to `0.970`, while final adapter eval logs showed:

| Eval | Reward | Quote Validity | Evidence ID | False-Supported Guard |
|---|---:|---:|---:|---:|
| v2 validation | 0.970 | 1.000 | 1.000 | 1.000 |
| v2 multihop | 0.970 | 1.000 | 1.000 | 1.000 |
| legacy mixed | 0.960 | 1.000 | 1.000 | 1.000 |
| legacy hard | 0.980 | 1.000 | 1.000 | 1.000 |
| legacy OOD | 0.971 | 1.000 | 1.000 | 1.000 |
| legacy multihop | 0.910 | 1.000 | 1.000 | 1.000 |

The caveat is that four larger hosted evals failed while uploading sample batches, so their scores come from the logs rather than finalized dashboard rows. Still, the important product signal was visible before upload failed: the adapter kept exact quote validity at `1.000`.

That became the rule for the rest of the project:

```text
do not trust aggregate reward
do not trust final verdict alone
do not trust evidence fields unless the text is checked
do not promote a checkpoint unless it holds up on mixed, hard, OOD, and multihop splits
```

The deliverable was protected only when all of those checks moved together. A model that is accurate but ungrounded is not enough. A model that is grounded but miscalibrated is also not enough. The verifier has to keep both promises at once.

## Separating The Signals

The hardest part of interpreting this project was that "better" did not mean one thing.

A verifier can improve its quote validity while getting worse at final verdicts. It can improve multihop while damaging hard/OOD calibration. It can get a high aggregate reward because the easy fields are perfect, while still failing the rare label that matters most. So I needed a separability diagnostic: a way to ask which skill moved, not just whether the average reward went up.

The diagnostic separated the task into five surfaces:

```text
format        -> valid JSON
grounding     -> evidence IDs and exact quotes
coverage      -> quoted evidence covers the required facts
calibration   -> final verdict and per-label recall
safety        -> false-supported rate and unsupported-span behavior
```

This mattered because the first hosted GRPO run looked good if I only looked at mixed/hard/OOD reward. Those splits saturated at `1.000`, which sounds like success. But multihop remained informative, and the later checkpoint had worse quote validity. That means the reward was too easy. It had stopped separating "knows the answer" from "can ground the answer."

The separability check forced the question into a table like this:

| Run | What Improved | What Got Worse | Diagnosis |
|---|---|---|---|
| SFT-only Qwen 9B | general hard/OOD behavior, structured JSON | multihop remained weak | best default teacher, but not enough pressure on multihop |
| SFT + local RL polish | guard behavior and grounding style | no clear held-out win | reward pressure too broad |
| local verdict-gated RL | multihop reward and quote behavior | hard/OOD verdict calibration | useful but too cautious |
| GRPO v1 | mixed/hard/OOD aggregate reward | quote validity at later checkpoint | reward saturated and allowed evidence drift |
| GRPO v2 | v2 multihop, quote validity, false-support guard | unsupported-span still imperfect | best targeted RL result |

The most useful diagnostic was quote validity versus final-verdict behavior. If quote validity is low, the verifier is not grounded. If final verdict is low, the verifier is not calibrated. A model needs both. The early GRPO result showed why: a checkpoint can have good-looking aggregate reward while quote validity quietly gets worse. The v2 run was designed so that could not be hidden.

The second diagnostic was multihop versus hard/OOD. Hard and OOD examples test subtle corruptions and domain shift. Multihop tests whether the verifier can combine evidence. These are not the same skill. The local verdict-gated run improved multihop and hurt hard/OOD, which meant it was not a clean upgrade. GRPO v2 was better on this axis: it kept legacy hard at `0.980`, legacy OOD at `0.971`, and legacy multihop at `0.910`, while v2 validation and v2 multihop both held at `0.970`.

The third diagnostic was unsupported-span behavior. This stayed the messiest. In the v2 eval logs, unsupported-span reward was `0.400` on v2 validation and v2 multihop, even while quote validity, evidence IDs, and false-supported guard were all `1.000`. That is the remaining sharp edge: the model can know that the evidence is real and still be weak at isolating the exact unsupported phrase.

That is why the project does not end with "the reward is solved." It ends with a cleaner separation of what was solved and what was not:

```text
solved enough:
  JSON format
  evidence ID validity
  exact quote validity
  false-supported guard

still open:
  unsupported-span localization
  label boundary between contradiction, overclaim, and partial support
  harder multihop cases that do not saturate in 20 steps
```

The separability diagnostic is what kept the project honest. Without it, I would have either overclaimed the first RL win or underclaimed the v2 result. With it, the conclusion is sharper: GRPO v2 successfully fixed the quote-grounding failure, but it did not remove the need for better hard multihop data and better verdict calibration.

## The Final GRPO Run

At this point, the project had a very annoying result: RL clearly helped some process metrics, but the best general verifier was still the supervised model. That left one question worth answering before calling it: was RL failing because the idea was wrong, or because we were asking it to learn too much from scratch?

The pure RL setup was asking for a lot. The model had to learn the JSON format, the verdict labels, evidence IDs, quote grounding, unsupported spans, and false-supported behavior from reward alone. That is a sparse and noisy way to teach a structured verifier. So the last serious attempt was staged: first teach the model the verifier format with supervised fine-tuning, then apply a short RL polish.

The reason is that the product was never a single answer token. The product was the whole claim trace.

![The product is a grounded claim trace](assets/claimcheck_panel_01_trace.svg)

The staged recipe used Qwen 9B with thinking disabled. The SFT warmup ran for 60 steps on the gold verifier JSON. Then RL ran for 40 steps from that SFT adapter. The idea was simple: let SFT teach the model how to speak the verifier language, then let RL push the parts that are easier to score than imitate, especially evidence grounding and false-support avoidance.

That is also why SFT had such an advantage. It did not merely reward the finished JSON; it taught the model each field in the trace directly.

![SFT teaches the verifier trace directly](assets/claimcheck_panel_02_signal.svg)

Training reward made this look promising. During the RL polish, valid JSON, quote validity, unsupported-span extraction, and false-supported guard all reached very high values in the training trace. But held-out evaluation told the more important story.

The SFT-only adapter won. The RL polish did not collapse, but it did not improve the model either. It made the verifier more guarded in some ways, but final-verdict calibration got weaker. This was the first serious signal that the supervised traces were already doing most of the useful teaching.

There was still one possible objection. The RL polish had trained on a general balanced mix. Maybe it was not aimed at the actual bottleneck. The model was not failing because it could not produce JSON. It was failing on verdict calibration under evidence constraints, especially multihop and partial-support cases. So the next RL attempt used a failure-focused dataset mined from the SFT-only adapter's mistakes and changed the reward so final-verdict credit was gated by evidence validity.

In math terms, the important change was:

{::nomarkdown}
<div class="math-block">
\[
\mathrm{labelCredit} = \mathrm{finalVerdictCorrect} \cdot \mathrm{evidenceValidityWeight}
\]
</div>
{:/}

This gate was the important idea behind the next RL run.

![The evidence gate](assets/claimcheck_panel_03_gate.svg)

This local run did exactly what it was supposed to do in one place. It improved multihop. SFT remained stronger overall, and the verdict-gated run bought a real multihop gain while paying for it on hard and OOD calibration.

The component scores explain the tradeoff. On multihop, the verdict-gated run improved final verdict from `0.260` to `0.480`, evidence ID from `0.615` to `0.792`, quote validity from `0.880` to `1.000`, and false-supported guard from `0.860` to `1.000`. That is a real gain. It means the reward was not useless. It pushed the model toward better evidence behavior where the task actually required multiple pieces of evidence.

But the same adapter hurt hard and OOD. On hard examples, final-verdict score dropped from `0.746` to `0.650`. On OOD, it dropped from `0.749` to `0.647`. The model became more evidence-strict, but less generally calibrated.

For a while, that looked like the end of the RL story. Not because RL failed completely, but because the result was too specific to promote. The SFT-only adapter remained the best default verifier. The verdict-gated RL adapter became evidence that targeted RL can improve multihop grounding, but also evidence that reward pressure can distort the label boundary.

Then the hosted GRPO runs exposed a different failure. The first real Qwen 9B GRPO run moved reward quickly, but the reward became too easy. Mixed, hard, and OOD saturated; multihop remained useful; and the later checkpoint showed the dangerous part: quote validity dropped. The model could improve aggregate reward while weakening the evidence surface.

So the final shot was not "more steps." It was a narrower reward.

GRPO v2 made exact quote grounding part of the gate. The model did not get full verdict credit unless evidence IDs, quote validity, and quote coverage were also right. It trained for only 20 GRPO steps, with 8 rollouts per example, on Qwen 9B. The run was deliberately short because the question was not "can we spend our way to a bigger number?" It was "can we fix the specific failure mode?"

The answer was yes.

```text
v2 validation: 0.760 -> 0.970
v2 multihop:   0.760 -> 0.970
quote validity in final eval logs: 1.000
```

The deployed final adapter also held up on the older slices:

| Eval | Reward |
|---|---:|
| legacy mixed | 0.960 |
| legacy hard | 0.980 |
| legacy OOD | 0.971 |
| legacy multihop | 0.910 |

That did not erase the earlier lesson. It sharpened it. RL was not the best way to teach the whole verifier from scratch. But once the verifier language existed, GRPO was a good way to put pressure on a specific auditable behavior: do not let the evidence lie.

![The final shape](assets/claimcheck_panel_04_result.svg)

The clean conclusion became:

```text
SFT = teaches the verifier trace
GRPO = pressures the verifier's evidence behavior
GRPO v2 = fixed the quote-grounding failure
full-scale default model = still needs harder multihop and calibration checks
```

The next RL run should not simply be longer or larger. It should be harder and more balanced: keep the quote-grounding gains, preserve hard/OOD calibration, include more adversarial unsupported and multihop cases, and stop if zero-advantage filtering shows the reward has become too easy.

## The RL Tradeoff

The most tempting interpretation is that RL failed. I do not think that is quite right. RL did something real: it made the verifier care more about quotes, evidence IDs, false support, and multihop grounding. The mistake would be treating that as the same thing as building the best overall verifier.

The reason is that this task has two different kinds of difficulty. One difficulty is procedural: the model has to use evidence, quote it, avoid fake support, and connect multiple snippets. RL is useful here because those behaviors can be scored after generation. The other difficulty is calibration: the model has to choose the correct boundary between `supported`, `partially_supported`, `unsupported`, `contradicted`, and `overclaim`. That boundary is delicate, and our best supervised traces taught it more directly.

![GRPO v2 made the behavior cleaner](assets/why_rl_panel_01_tradeoff_line.svg)

The line chart is the first half of the story. The local verdict-gated reward finally moved multihop upward, which is exactly where retrieval and evidence composition matter. But the hard/OOD average moved downward at the same time. RL was not useless; it was directional. It pushed the model toward the behavior the reward emphasized.

GRPO v2 is the second half. Once the reward explicitly gated verdict credit on quote validity and quote coverage, RL stopped looking like a blunt instrument and started looking like a targeted pressure tool. The v2 adapter did not just produce nicer-looking JSON. It kept quote validity at `1.000` while scoring `0.970` on both v2 validation and v2 multihop.

That is why aggregate reward was not enough. If I only averaged every split together, the multihop gain could hide the hard/OOD regression. If I only looked at quote validity, the run would look excellent. If I only looked at final verdict on hard/OOD, the run would look worse than it really was. The right diagnosis had to separate process behavior from verdict calibration.

![Why GRPO v2 worked narrowly](assets/why_rl_panel_02_diagnosis.svg)

SFT was still the method that taught the entire verifier trace directly. The gold target did not just say "this is overclaim." It showed the claim, status, evidence ID, quote, unsupported span, reason, and final verdict. Every one of those fields provided a token-level training signal.

RL had a weaker but useful role. It could say, after the model produced a full output, whether the evidence IDs were valid, whether the quotes appeared in the snippets, whether unsupported spans were present, and whether the model avoided false support. That made it good for pressure-testing and sharpening behaviors. It was not as good at teaching the whole schema and the whole label boundary from scratch, but GRPO v2 showed it can be very good at enforcing one behavior that SFT alone does not guarantee: evidence faithfulness under reward pressure.

So the answer was not:

```text
RL bad, SFT good
```

It was:

```text
SFT teaches the verifier.
RL stresses the verifier.
Evaluation decides whether the stress helped or bent the model.
```

That framing also explains why the answer is not a simple leaderboard claim. The earlier RL adapter was better at one important thing, multihop grounding, but worse as the default verifier. The v2 GRPO adapter fixed the quote-grounding failure and held up much better on legacy hard/OOD, but the larger eval rows still came from logs because sample upload timed out. That makes it a strong targeted RL result, not a reason to stop evaluating.

## What The Model Learned

The models did not all learn the same thing.

The base Qwen model mostly taught us that the task format itself is nontrivial. Without adaptation, it did not reliably emit the strict verifier JSON, so the evaluation path gave it zero reward. That sounds harsh, but it was useful: it showed that this project was not only about classification. The model had to learn a product interface.

The supervised verifier learned that interface very well. It learned to produce valid JSON, cite evidence IDs, copy exact quotes, and keep the output in the schema. On the hard and OOD splits, it was especially strong: valid JSON was `1.000`, quote validity was `1.000`, and unsupported-span scoring was `1.000`. The remaining weakness was not formatting. It was the boundary between verdict labels.

The verdict-gated RL verifier learned a different habit. It became more conservative and more evidence-strict. That helped on multihop cases, where the model had to connect evidence across multiple snippets. But it also made the model overuse safer labels like `partially_supported`, especially when the answer was actually `supported`, `overclaim`, or `contradicted`.

The GRPO v2 verifier learned the cleanest RL lesson: quotes are not optional. It kept valid JSON, evidence IDs, quote validity, quote coverage, and false-supported guard at `1.000` in the v2 eval logs. The remaining weakness was unsupported-span localization. On v2 validation and v2 multihop, unsupported-span reward was only `0.400`, even though the quote and evidence metrics were perfect.

The component metrics make this visible.

| Split | Model | Final Verdict | Evidence ID | Quote Validity | Unsupported Span | False-Supported Guard |
|---|---|---:|---:|---:|---:|---:|
| Hard | SFT-only | 0.746 | 0.900 | 1.000 | 1.000 | 0.990 |
| Hard | Verdict-gated RL | 0.650 | 0.868 | 1.000 | 0.984 | 1.000 |
| OOD | SFT-only | 0.749 | 0.900 | 1.000 | 1.000 | 0.993 |
| OOD | Verdict-gated RL | 0.647 | 0.857 | 0.999 | 0.990 | 1.000 |
| Multihop | SFT-only | 0.260 | 0.615 | 0.880 | 0.440 | 0.860 |
| Multihop | Verdict-gated RL | 0.480 | 0.792 | 1.000 | 0.280 | 1.000 |

This table is the project in miniature. The supervised model is better on general verdict calibration. The RL model is better at multihop evidence discipline. The RL model did not become broadly smarter; it became more sensitive to the reward pressure.

The GRPO v2 adapter changed the evidence side of the table:

| Eval | Reward | Evidence ID | Quote Validity | Quote Coverage | Unsupported Span | False-Supported Guard |
|---|---:|---:|---:|---:|---:|---:|
| v2 validation | 0.970 | 1.000 | 1.000 | 1.000 | 0.400 | 1.000 |
| v2 multihop | 0.970 | 1.000 | 1.000 | 1.000 | 0.400 | 1.000 |
| legacy hard | 0.980 | 1.000 | 1.000 | n/a | 1.000 | 1.000 |
| legacy OOD | 0.971 | 1.000 | 1.000 | n/a | 1.000 | 1.000 |
| legacy multihop | 0.910 | 1.000 | 1.000 | n/a | 0.936 | 1.000 |

This table says something different from the earlier local RL result. It says the model can be pushed toward exact evidence behavior without immediately destroying the older hard/OOD reward. But it also says the v2 dataset became too easy on quote copying. The next hard problem is not "can it quote?" It is "can it identify exactly which part of the answer is not proven?"

For the earlier local verdict-gated run, the per-label behavior shows the same thing.

| Label | SFT Recall On OOD | Verdict-Gated RL Recall On OOD | What Changed |
|---|---:|---:|---|
| `supported` | 1.000 | 1.000 | both models kept clean support cases |
| `partially_supported` | 0.765 | 1.000 | RL strongly learned partial-support behavior |
| `unsupported` | 0.500 | 0.500 | neither solved unsupported fully |
| `contradicted` | 1.000 | 0.735 | RL became less reliable on direct contradiction |
| `overclaim` | 0.480 | 0.000 | RL collapsed many overclaims into partial support |

This was the clearest lesson: the model learned *a style of caution*. Sometimes that caution was exactly what we wanted. Sometimes it erased a more precise distinction.

The qualitative examples below come from that local verdict-gated run. Here is a real multihop example where the model improved the final judgment. The question asked what conditions apply before vendors may begin onboarding. The gold verdict was `partially_supported`: part of the answer was supported, but the answer also added "Approval is automatic and cannot be delayed." The evidence said vendors may begin onboarding after the security questionnaire is approved, and that procurement confirmation creates a two-day deadline. It did not say approval is automatic or cannot be delayed.

The supervised verifier missed that extra unsupported sentence:

```json
{
  "claims": [
    {
      "claim": "Vendors may begin onboarding after the security questionnaire is approved and procurement confirms the vendor record, and they must act within 2 business days.",
      "evidence_ids": ["E1", "E2"],
      "quote": "Vendors may begin onboarding only after the security questionnaire is approved.",
      "reason": "The answer is supported by the cited evidence.",
      "status": "supported",
      "unsupported_span": ""
    }
  ],
  "evidence_used": ["E1", "E2"],
  "final_verdict": "supported"
}
```

The verdict-gated RL verifier did better on the final verdict:

```json
{
  "claims": [
    {
      "claim": "Vendors may begin onboarding after the security questionnaire is approved and procurement confirms the vendor record, and they must act within 2 business days.",
      "evidence_ids": ["E1", "E2"],
      "quote": "Vendors may begin onboarding only after the security questionnaire is approved.",
      "reason": "This part of the answer is supported by the cited evidence.",
      "status": "supported",
      "unsupported_span": "and procurement confirms the vendor record, and they must act within 2 business days."
    }
  ],
  "evidence_used": ["E1", "E2"],
  "final_verdict": "partially_supported"
}
```

This is not perfect. The model correctly changed the verdict to `partially_supported`, but the unsupported span it marked was not the best span. The truly unsupported sentence was "Approval is automatic and cannot be delayed." This is why the reward helped but did not solve the task. It improved the high-level caution, while span localization still needed work.

The opposite failure happened on a hard contradiction example. The question asked for the deadline for vendors to submit a reimbursement request. The evidence said `3 days`; the answer said `4 days`. The gold verdict was `contradicted`. The SFT-only model got this exactly right:

```json
{
  "claims": [
    {
      "claim": "Vendors must submit a reimbursement request within 4 days.",
      "evidence_ids": ["E1"],
      "quote": "Vendors must submit a reimbursement request within 3 days when the expense is approved by a manager.",
      "reason": "The answer conflicts with the cited evidence.",
      "status": "contradicted",
      "unsupported_span": "Vendors must submit a reimbursement request within 4 days."
    }
  ],
  "evidence_used": ["E1"],
  "final_verdict": "contradicted"
}
```

The verdict-gated model cited the right evidence and quote, but softened the label:

```json
{
  "claims": [
    {
      "claim": "Vendors must submit a reimbursement request within 4 days.",
      "evidence_ids": ["E1"],
      "quote": "Vendors must submit a reimbursement request within 3 days when the expense is approved by a manager.",
      "reason": "This part of the answer is not supported by the evidence and may be an overclaim.",
      "status": "overclaim",
      "unsupported_span": "Vendors must submit a reimbursement request within 4 days."
    }
  ],
  "evidence_used": ["E1"],
  "final_verdict": "overclaim"
}
```

That is the most important qualitative finding. The model was not hallucinating wildly. It had the evidence. It quoted the right text. It even knew something was wrong. But it picked the wrong kind of wrong.

So what did the model learn?

| Learned Behavior | Evidence From Runs | Remaining Problem |
|---|---|---|
| Strict JSON format | adapted models reached `1.000` valid JSON across held-out splits | base model still needs prompting/adaptation |
| Quote grounding | quote validity reached `1.000` on hard and near-`1.000` on OOD | quote can be valid but incomplete for multihop |
| False-support avoidance | verdict-gated RL reached `1.000` false-supported guard on all reported splits | over-caution can hurt supported/contradicted labels |
| Multihop evidence use | multihop reward improved from `0.621933` to `0.720400` | unsupported-span localization fell from `0.440` to `0.280` |
| Verdict calibration | SFT remained best on hard/OOD final verdict | RL shifted too many examples toward partial support |
| Exact quote discipline | GRPO v2 held quote validity at `1.000` across eval logs | quote validity can saturate before unsupported spans are solved |

The model learned the verifier language. It learned that quotes matter. It learned that evidence IDs are not decoration. It learned to be suspicious of unsupported claims.

But it did not fully learn the legal-feeling distinction between contradiction, overclaim, unsupported, and partial support. That distinction is the core of the remaining problem.

## Closing

That is the project.

I started with a simple question: can reinforcement learning make an evidence verifier better? The answer turned out to be more useful than a clean yes or no.

RL did help. It made the model care more about quotes, evidence IDs, false support, and multihop grounding. The verdict-gated run was not fake progress; it found a real lever. The GRPO v2 run made that lever cleaner: it directly attacked the quote-grounding failure and kept quote validity at `1.000` while moving v2 validation and v2 multihop to `0.970`.

But RL was not the best default tool. The supervised verifier stayed stronger on the general problem because the target trace already contained the thing we wanted the model to learn. Every gold JSON example showed the claim, the quote, the evidence ID, the unsupported span, the reason, and the final verdict. When the supervision is that dense and that aligned with the product, SFT is hard to beat.

The biggest lesson for me is that "grounded verification" is not one skill. It is several skills stacked together:

- retrieving the right evidence,
- preserving the exact wording,
- separating supported from partially supported,
- not confusing contradiction with overclaim,
- refusing false support,
- and producing an output that another system can audit.

Some of those skills respond well to reward pressure. Some need direct supervision. Some need better retrieval. Treating all of them as one scalar reward hides the interesting part.

The project also changed how I think about RAG. The weak point is not only retrieval, and it is not only generation. It is the contract between them. A model can retrieve a relevant paragraph and still make the wrong claim. It can quote the right sentence and still choose the wrong verdict. It can be careful enough to avoid false support and still become too cautious. The verifier has to live in that uncomfortable middle.

So the final system shape is SFT-first, retrieval-aware, and RL-second. SFT gives the model the verifier language. Retrieval gives it the evidence surface. RL should be used as targeted pressure when we can define the behavior precisely enough to reward it.

That is a less flashy conclusion than "RL solved evidence verification." It is also a more honest one.

The next version should keep the v2 quote discipline, add harder unsupported-span and multihop examples, and keep the hard/OOD calibration checks that caught the earlier regressions. SFT is still the best way to teach the verifier language. GRPO v2 is the strongest evidence that RL can enforce a narrow product requirement: exact quote-grounded evidence.

If there is one sentence I would keep from the whole project, it is this:

```text
A correct verdict is not enough. The evidence has to survive inspection.
```

## Appendix

Artifacts:

| Artifact | Public Link | Scope | Contents |
|---|---|---|---|
| Full traces repo | [mohammed8284/claimcheck-rl-verifier-traces](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces) | all | Public dataset repo containing the verifier trace files. |
| SFT-only Qwen 9B traces | [`sft_qwen9b/`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/tree/main/sft_qwen9b) | mixed, hard, OOD, multihop | Best default verifier traces and summary. |
| SFT + RL polish traces | [`staged_sft_rl_qwen9b/`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/tree/main/staged_sft_rl_qwen9b) | mixed, hard, OOD, multihop | Traces from the short RL polish after SFT warmup. |
| Verdict-gated RL traces | [`verdict_gated_rl_qwen9b/`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/tree/main/verdict_gated_rl_qwen9b) | mixed, hard, OOD, multihop | Traces from the reward run that improved multihop but hurt hard/OOD calibration. |
| Prime GRPO v2 artifact bundle | [`prime_grpo_v2_qwen9b/`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/tree/main/prime_grpo_v2_qwen9b) | Prime GRPO v2 | Public bundle with run metadata, training logs, eval logs, configs, and reports. |
| Prime GRPO v2 bundle README | [`README.md`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/blob/main/prime_grpo_v2_qwen9b/README.md) | Prime GRPO v2 | Short map of the final adapter, run ID, environment ID, eval caveats, and file layout. |
| Prime GRPO v2 run report | [`grpo_v2_plan.md`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/blob/main/prime_grpo_v2_qwen9b/reports/grpo_v2_plan.md) | Prime GRPO v2 | Run IDs, adapter IDs, reward weights, final adapter evals, and upload caveats for the Qwen 9B GRPO v2 run. |
| Prime GRPO v2 dataset note | [`grpo_v2_dataset.md`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/blob/main/prime_grpo_v2_qwen9b/reports/grpo_v2_dataset.md) | Prime GRPO v2 data | Notes on the v2 reward data and why the quote/verdict gate was rebuilt. |
| Prime GRPO v2 environment | [mohammedalshehri-77/claimcheck-grpo-v2](https://app.primeintellect.ai/dashboard/environments/mohammedalshehri-77/claimcheck-grpo-v2) | `claimcheck-grpo-v2` v0.1.1 | Prime environment for validity-gated quote-grounded GRPO training. |
| Prime GRPO v2 final adapter | `Qwen/Qwen3.5-9B:ou9z8i6yca6smvc2to73hx9a` | deployed adapter | Final adapter from the 20-step Prime GRPO v2 run. |
| Prime GRPO v2 training run | [`n1lcta1i3vkv6t8h07d86rr5`](https://app.primeintellect.ai/dashboard/training/n1lcta1i3vkv6t8h07d86rr5) | 20-step Qwen 9B GRPO | Prime hosted RL run: v2 validation/multihop moved from `0.760` to `0.970`. |
| Prime GRPO v2 configs | [`configs/`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/tree/main/prime_grpo_v2_qwen9b/configs) | training and eval | Training configs and final eval configs for the Prime GRPO v2 run. |
| Prime GRPO v2 eval summary | [`summary.json`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/blob/main/prime_grpo_v2_qwen9b/final_adapter_eval_deployed/summary.json) | final adapter eval | Extracted scores for v2 validation, v2 multihop, legacy mixed, hard, OOD, and multihop. |
| Prime GRPO v2 eval logs | [`final_adapter_eval_deployed/`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-verifier-traces/tree/main/prime_grpo_v2_qwen9b/final_adapter_eval_deployed) | final adapter eval | Per-eval Prime metadata and logs for the deployed final adapter. |
| Summary files | `*/summary.json` | all | Aggregate reward, component scores, per-label behavior, and confusion counts. |
| Prediction files | `*_predictions.jsonl` | per split | One row per example with gold verdict, predicted verdict, model JSON completion, reward, quote validity, evidence ID score, unsupported-span score, and false-supported guard. |
| ClaimCheck RL environments | [mohammed8284/claimcheck-rl-environments](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-environments) | Prime package and local contracts | Public mirror of the environment code, metadata, and packaged data splits. |
| Prime Hub package | [mohammedalshehri-77/claimcheck-sft](https://app.primeintellect.ai/dashboard/environments/mohammedalshehri-77/claimcheck-sft) | `claimcheck-sft` v0.1.4 | Prime environment pushed from `environments/claimcheck_sft`; install with `prime env install mohammedalshehri-77/claimcheck-sft`. |
| Prime environment source | [`prime_hub/claimcheck_sft/`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-environments/tree/main/prime_hub/claimcheck_sft) | static verifier | Prime loader, reward functions, environment metadata, and bundled JSONL splits. |
| Local RL environment contracts | [`local_rl_envs/evidence_verifier/`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-environments/tree/main/local_rl_envs/evidence_verifier) | static and online verifier | Offline scoring environment plus tool-based list/search/read/submit environment used to shape the reward design. |
| Earlier RL environment scripts | [`project_rl_environments/`](https://huggingface.co/datasets/mohammed8284/claimcheck-rl-environments/tree/main/project_rl_environments) | offline RL, online tools, packaging, reward training | Static and online environment simulations, reward code, Prime packaging, local reward-weighted RL trainer, configs, and environment reports. |

Sources that shaped the motivation:

- [ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832)
- [ColBERTv2: Effective and Efficient Retrieval via Lightweight Late Interaction](https://arxiv.org/abs/2112.01488)
- [PLAID: An Efficient Engine for Late Interaction Retrieval](https://arxiv.org/abs/2205.09707)
- [Baleen: Robust Multi-Hop Reasoning at Scale via Condensed Retrieval](https://arxiv.org/abs/2101.00436)
- [Stanford ColBERT repository](https://github.com/stanford-futuredata/ColBERT)
- [Mixedbread: Introducing mxbai-colbert-large-v1](https://www.mixedbread.com/blog/mxbai-colbert-large-v1)
- [Mixedbread: How We Built Multimodal Late-Interaction at Billion Scale](https://www.mixedbread.com/blog/multimodal-late-interaction-billion-scale)
