---
title: "Teaching an LLM to Explore: Reinforcement Learning for Document Navigation"
date: 2026-03-30
authors: "Mohammed Alshehri"
year: 2026
code: "https://github.com/mohammed840/tinker-explorer"
tldr: "We trained a Qwen3-8B model to efficiently search through documents using GRPO, inspired by Karpathy's autoresearch — and what Goodhart's Law taught us along the way."
highlights:
  - "Lower training reward = better model: the run with the lowest training reward produced the best model."
  - "Goodhart's Law in action: shaped rewards created a shortcut the agent exploited while ignoring the true objective."
  - "Status text fix was the breakthrough: 50% of outputs were action descriptions instead of answers."
contributions:
  - "Tinker-Explorer: an RL environment for multi-hop document exploration with budget-constrained action space."
  - "Three-run ablation demonstrating that reward quality matters more than reward quantity in GRPO training."
  - "Practical diagnosis of status-text pollution as a dominant failure mode invisible in aggregate metrics."
  - "Evidence that sparse but honest reward signals outperform dense but misleading ones."
abstract: "We present Tinker-Explorer, a reinforcement learning agent that learns to navigate document chunks to answer multi-hop questions, trained using GRPO on the Tinker platform. Inspired by Karpathy's autoresearch, the agent operates under a step budget, deciding which documents to read before answering. Across three training runs, we demonstrate a Goodhart's Law failure (shaped rewards degrading performance), diagnose a status-text pollution problem invisible in aggregate metrics, and show that the run with the lowest training reward produced the best model (F1 = 0.172, 40% improvement over Run 1). The central insight: reward quality matters more than reward quantity."
---

<style>
.paper-content { font-family: Georgia, "Times New Roman", serif; line-height: 1.75; color: #1a1a1a; max-width: 100%; }
.paper-content h1 { font-size: 1.55rem; margin-top: 2rem; }
.paper-content h2 { font-size: 1.25rem; margin-top: 1.8rem; color: #222; }
.paper-content h3 { font-size: 1.05rem; margin-top: 1.4rem; color: #333; }
.paper-header { margin-bottom: 1.5rem; }
.paper-header h1 { border: none; font-size: 1.6rem; line-height: 1.3; font-family: inherit; }
.paper-header .author { font-size: 1rem; color: #555; margin-top: 0.4rem; margin-bottom: 0; font-family: inherit; }
.paper-header .paper-links { display: flex; gap: 1.2rem; align-items: center; justify-content: center; margin-top: 1rem; flex-wrap: wrap; }
.paper-header .paper-links a { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; font-family: inherit; text-decoration: none; color: #333; border: none; background: none; padding: 0; transition: color 0.15s; }
.paper-header .paper-links a:hover { color: #000; text-decoration: underline; }
.paper-content table { border-collapse: collapse; width: 100%; font-size: 0.84rem; margin: 1.4rem auto; border-top: 2px solid #111; border-bottom: 2px solid #111; }
.paper-content th, .paper-content td { border: none; padding: 6px 14px; text-align: left; vertical-align: top; }
.paper-content thead tr { border-bottom: 1px solid #555; font-weight: 600; background: none; }
.paper-content tr:nth-child(even) td { background: none; }
.paper-content blockquote { border-left: 3px solid #bbb; padding: 0.5em 1em; color: #555; margin: 1em 0; background: #f9f9f9; border-radius: 0 4px 4px 0; }
.paper-content img { max-width: 100%; display: block; margin: 1.2em auto; border-radius: 4px; border: 1px solid #e0e0e0; }
.paper-content code { background: #f4f4f4; padding: 1px 5px; border-radius: 3px; font-size: 0.87em; font-family: "SF Mono", "Fira Code", monospace; }
.paper-content pre { background: #f4f4f4; padding: 1em; border-radius: 4px; overflow-x: auto; font-size: 0.84em; }
.paper-content pre code { background: none; padding: 0; }
.paper-content hr { border: none; border-top: 1px solid #e0e0e0; margin: 2rem 0; }
.paper-content ol, .paper-content ul { padding-left: 1.5em; }
.paper-content li { margin-bottom: 0.3em; }
</style>

<div class="paper-content">
<div class="paper-header">
<h1>Teaching an LLM to Explore: Reinforcement Learning for Document Navigation</h1>
<p class="author"><strong>Mohammed Alshehri</strong> &mdash; March 2026</p>
<p><em>How we trained a Qwen3-8B model to efficiently search through documents using GRPO, inspired by Karpathy's autoresearch — and what Goodhart's Law taught us along the way.</em></p>
</div>

<hr />

<h2>Table of Contents</h2>
<ol>
<li><a href="#1-introduction--the-autoresearch-connection">Introduction — The Autoresearch Connection</a></li>
<li><a href="#2-the-problem-partially-observable-multi-hop-qa">The Problem: Partially Observable Multi-Hop QA</a></li>
<li><a href="#3-environment-design">Environment Design</a></li>
<li><a href="#4-the-dataset-2wikimultihopqa">The Dataset: 2WikiMultiHopQA</a></li>
<li><a href="#5-training-infrastructure-tinker--grpo">Training Infrastructure: Tinker + GRPO</a></li>
<li><a href="#6-run-1-shaped-reward--the-goodhart-trap">Run 1: Shaped Reward — The Goodhart Trap</a></li>
<li><a href="#7-run-2-pure-f1--cleaning-the-signal">Run 2: Pure F1 — Cleaning the Signal</a></li>
<li><a href="#8-run-3-status-text-fix--the-breakthrough">Run 3: Status Text Fix — The Breakthrough</a></li>
<li><a href="#9-the-paradox-lower-training-reward--better-model">The Paradox: Lower Training Reward = Better Model</a></li>
<li><a href="#10-results-and-analysis">Results and Analysis</a></li>
<li><a href="#11-lessons-learned">Lessons Learned</a></li>
<li><a href="#12-whats-next">What's Next</a></li>
</ol>

<hr />

<h2 id="1-introduction--the-autoresearch-connection">1. Introduction — The Autoresearch Connection</h2>

<p>In January 2025, Andrej Karpathy <a href="https://x.com/karpathy/status/1884359634653819353">announced autoresearch</a> — a project where an AI agent autonomously improves a language model by searching over code edits, running experiments within a 5-minute budget, and optimizing validation perplexity. The core insight was simple but profound: <strong>give an agent a search space, a budget, and a scalar reward, then let reinforcement learning do the rest.</strong></p>

<p>Karpathy's search space was code modifications. Ours is something different: <strong>document exploration</strong>.</p>

<p>We built <strong>Tinker-Explorer</strong>, an RL agent that learns to navigate a set of document chunks to answer multi-hop questions. Like autoresearch, it operates under a budget (limited steps), must decide what information to gather (which documents to read), and receives a scalar reward (answer correctness). Unlike autoresearch, the search space isn't code — it's evidence.</p>

<p>The mapping between the two projects:</p>

<table>
<thead>
<tr><th></th><th>Karpathy's Autoresearch</th><th>Tinker-Explorer</th></tr>
</thead>
<tbody>
<tr><td><strong>Agent</strong></td><td>Code-editing LLM</td><td>Document-exploring LLM</td></tr>
<tr><td><strong>Search space</strong></td><td>Code modifications</td><td>Document chunk selections</td></tr>
<tr><td><strong>Budget</strong></td><td>5 minutes wall-clock</td><td>10 action steps max</td></tr>
<tr><td><strong>Reward</strong></td><td>val_bpb improvement</td><td>Token F1 on answer</td></tr>
<tr><td><strong>Optimization</strong></td><td>RL over code edits</td><td>GRPO over exploration trajectories</td></tr>
<tr><td><strong>Key challenge</strong></td><td>Which edits improve the model?</td><td>Which documents contain the answer?</td></tr>
</tbody>
</table>

<p>Both projects share the same fundamental question: <em>Can an LLM learn to make better decisions about what to explore, through trial and error?</em></p>

<p>This post documents our journey across three training runs — including a Goodhart's Law failure, a reward debugging mystery, and the realization that looking at your model's actual outputs matters more than tuning hyperparameters.</p>

<hr />

<h2 id="2-the-problem-partially-observable-multi-hop-qa">2. The Problem: Partially Observable Multi-Hop QA</h2>

<p>Standard QA gives the model everything upfront. Retrieval-augmented QA retrieves documents first, then answers. But neither captures the <strong>active information gathering</strong> that humans do naturally.</p>

<p>Consider this question:</p>

<blockquote>
<p><em>"Which film has the director born first, Once A Gentleman or The Girl In White?"</em></p>
</blockquote>

<p>A human researcher would:</p>
<ol>
<li>Look at the available sources</li>
<li>Open the article about "Once A Gentleman" to find the director's birth year</li>
<li>Open the article about "The Girl In White" to do the same</li>
<li>Compare the two dates and answer</li>
</ol>

<p>This process requires <strong>sequential decision-making under uncertainty</strong> — the agent doesn't know which documents are useful until it reads them. This is fundamentally a reinforcement learning problem.</p>

<h3>Why Not Just Retrieve Everything?</h3>

<p>You could argue: "Just open all the documents." But in real-world settings:</p>
<ul>
<li>API calls cost money (think: calling a paid knowledge base)</li>
<li>Context windows have limits</li>
<li>Irrelevant information introduces noise that degrades LLM performance</li>
<li>Some documents are red herrings that actively mislead</li>
</ul>

<p>The goal isn't just to answer correctly — it's to answer correctly <strong>while reading as few documents as possible</strong>. This is the efficiency-accuracy tradeoff that makes the problem interesting.</p>

<hr />

<h2 id="3-environment-design">3. Environment Design</h2>

<p>Tinker-Explorer implements a standard RL environment loop:</p>

<h3>State Space</h3>

<p>At each step, the agent observes:</p>
<ul>
<li><strong>The question</strong> (e.g., "Who is Marie Zéphyrine Of France's paternal grandmother?")</li>
<li><strong>A list of chunk previews</strong> — one-line titles of all available documents, but NOT their contents</li>
<li><strong>Previously opened chunks</strong> — full text of any documents the agent has chosen to read</li>
<li><strong>Remaining step budget</strong> — how many actions it has left</li>
</ul>

<h3>Action Space</h3>

<p>Three possible actions at each step:</p>

<pre><code>{"action": "OPEN", "target": 3, "reasoning": "Chunk 3 mentions Marie Zéphyrine..."}
{"action": "SUMMARIZE", "target": 3, "text": "Born 1750, daughter of Louis XV..."}
{"action": "ANSWER", "text": "Marie Leszczyńska"}</code></pre>

<ul>
<li><strong>OPEN(i)</strong>: Read chunk <code>i</code>'s full text. This is the exploration action.</li>
<li><strong>SUMMARIZE(i)</strong>: Write a summary of chunk <code>i</code>. This helps manage context length.</li>
<li><strong>ANSWER(text)</strong>: Submit a final answer. Ends the episode.</li>
</ul>

<h3>Reward Function</h3>

<p>The agent receives reward only when it answers. The reward is the <strong>token-level F1 score</strong> between its predicted answer and the gold answer — a standard metric from the SQuAD literature that gives partial credit for overlapping words.</p>

<p>For example:</p>
<ul>
<li>Gold: "The Mask Of Fu Manchu" → Predicted: "The Mask of Fu Manchu" → F1 = 1.0 ✅</li>
<li>Gold: "Małgorzata Braunek" → Predicted: "Chunk 4 has been opened" → F1 = 0.0 ❌</li>
</ul>

<h3>Episode Flow</h3>

<pre><code>1. Agent receives question + chunk previews
2. Agent decides: OPEN, SUMMARIZE, or ANSWER?
3. If OPEN/SUMMARIZE → environment reveals text, step counter increments
4. If ANSWER → episode ends, reward = token_f1(predicted, gold)
5. If step budget exhausted → episode ends with reward = 0</code></pre>

<p>A typical successful episode takes 2-4 steps: open the relevant chunks, then answer.</p>

<hr />

<h2 id="4-the-dataset-2wikimultihopqa">4. The Dataset: 2WikiMultiHopQA</h2>

<p>We use <a href="https://github.com/Alab-NII/2wikimultihop">2WikiMultiHopQA</a> — a multi-hop question answering dataset built from Wikipedia. Each question requires reasoning across exactly two Wikipedia articles.</p>

<p><strong>Why this dataset?</strong></p>

<ol>
<li><strong>Natural chunk structure</strong>: Each Wikipedia article is a chunk. The agent must decide which articles to read.</li>
<li><strong>Ground truth supporting facts</strong>: The dataset provides <code>supporting_facts</code> — which paragraphs contain the answer evidence. This lets us measure whether the agent opens the <em>right</em> documents.</li>
<li><strong>Multi-hop reasoning</strong>: Questions require combining information from two sources. The agent can't answer from a single document.</li>
<li><strong>Varied question types</strong>: Comparison ("which film came first"), bridge ("who is the mother of the director of..."), and compositional questions.</li>
</ol>

<h3>Dataset Split</h3>
<ul>
<li><strong>Training</strong>: 5,000 tasks (randomly sampled from the full 167K)</li>
<li><strong>Validation</strong>: 200 held-out tasks for evaluation</li>
<li><strong>Chunk pool</strong>: Each task has ~10 candidate chunks (2 relevant, ~8 distractors)</li>
</ul>

<hr />

<h2 id="5-training-infrastructure-tinker--grpo">5. Training Infrastructure: Tinker + GRPO</h2>

<h3>Tinker Platform</h3>

<p>All training runs on <a href="https://tinker.computer/">Tinker</a> (Temporal Intelligence via Neural Knowledge Extraction and Reasoning) — a cloud platform that provides:</p>
<ul>
<li><strong>Hosted model weights</strong> — Qwen3-8B with LoRA adapters, no local GPU needed</li>
<li><strong>Sampling API</strong> — generate completions from the current policy</li>
<li><strong>Training API</strong> — submit gradient updates (importance-sampled policy gradient)</li>
<li><strong>Checkpointing</strong> — save/restore model states</li>
</ul>

<p>This architecture is powerful: the model lives in the cloud, and our local code just orchestrates rollouts and computes gradients. We ran all experiments on a MacBook with no GPU.</p>

<h3>GRPO (Group Relative Policy Optimization)</h3>

<p>We use <strong>GRPO</strong> — a variant of policy optimization from <a href="https://arxiv.org/abs/2501.12948">DeepSeek-R1</a> — instead of PPO. The key idea:</p>

<ol>
<li>For each task, sample <code>G = 16</code> trajectories from the current policy</li>
<li>Compute rewards for all 16</li>
<li>Normalize rewards within the group: <code>advantage_i = (r_i - mean(r)) / std(r)</code></li>
<li>Update the policy to increase probability of above-average trajectories</li>
</ol>

<p><strong>Why GRPO over PPO?</strong></p>
<ul>
<li><strong>No value function needed</strong> — PPO requires a separate critic network. GRPO computes baselines from the group.</li>
<li><strong>Natural for language</strong> — each trajectory is a sequence of tokens. GRPO treats the whole sequence as one "action."</li>
<li><strong>Simpler implementation</strong> — just a weighted policy gradient update, no GAE, no clipping ratio (handled by importance sampling).</li>
</ul>

<h3>Hyperparameters</h3>

<table>
<thead>
<tr><th>Parameter</th><th>Value</th><th>Rationale</th></tr>
</thead>
<tbody>
<tr><td>GROUP_SIZE</td><td>16</td><td>Balance between variance reduction and compute</td></tr>
<tr><td>BATCH_SIZE</td><td>8</td><td>Tasks per batch (= 128 total rollouts per update)</td></tr>
<tr><td>Learning Rate</td><td>5e-6</td><td>Conservative — RL fine-tuning is sensitive</td></tr>
<tr><td>LoRA Rank</td><td>32</td><td>Enough capacity without overparameterizing</td></tr>
<tr><td>Grad Clip Norm</td><td>1.0</td><td>Prevents IS loss explosions</td></tr>
<tr><td>Max Steps</td><td>10</td><td>Episode timeout</td></tr>
</tbody>
</table>

<h3>SFT Warm-Start</h3>

<p>Before RL training, we performed supervised fine-tuning (SFT) on 450 demonstration episodes generated by a heuristic policy. This gives the model a reasonable starting point — it knows the action format and basic exploration strategy.</p>

<p>The heuristic policy simply:</p>
<ol>
<li>Computes TF-IDF overlap between the question and each chunk title</li>
<li>Opens the highest-overlap chunk</li>
<li>Answers with the chunk title (which is often the Wikipedia article title — and therefore the exact entity name)</li>
</ol>

<p>This heuristic achieves <strong>F1 = 0.246</strong> — a surprisingly strong baseline.</p>

<hr />

<h2 id="6-run-1-shaped-reward--the-goodhart-trap">6. Run 1: Shaped Reward — The Goodhart Trap</h2>

<h3>Hypothesis</h3>

<p>"If we add a bonus for opening relevant chunks, the model will learn to explore more effectively."</p>

<h3>Reward Design</h3>

<pre><code>reward = token_f1(predicted, gold) + 0.2 × (number of relevant chunks opened)</code></pre>

<p>The idea was sound: reward the agent not just for the final answer, but for the intermediate exploration steps. Every relevant chunk opened earns a +0.2 bonus (capped at 0.4).</p>

<h3>Training</h3>

<p>100 batches over ~12 hours. Training reward climbed steadily — the 5-batch average increased from 0.08 to 0.20 over the course of training.</p>

<figure>
<img src="/assets/tinker-explorer/run_1/reward_curve.png" alt="Run 1 Training Reward" />
<figcaption>Run 1 Training Reward</figcaption>
</figure>

<h3>Results</h3>

<table>
<thead>
<tr><th>Model</th><th>F1</th><th>EM</th><th>Answer Rate</th></tr>
</thead>
<tbody>
<tr><td>Heuristic</td><td>0.246</td><td>0.220</td><td>100%</td></tr>
<tr><td>SFT</td><td>0.152</td><td>0.065</td><td>87%</td></tr>
<tr><td><strong>RL Run 1</strong></td><td><strong>0.123</strong></td><td><strong>0.010</strong></td><td>96%</td></tr>
</tbody>
</table>

<p><strong>Wait — F1 went DOWN?</strong> The RL agent performed <em>worse</em> than the SFT baseline it started from. Training reward increased, but actual answer quality decreased.</p>

<h3>The Diagnosis: Goodhart's Law</h3>

<blockquote>
<p>"When a measure becomes a target, it ceases to be a good measure."</p>
</blockquote>

<p>The relevance bonus created a shortcut: the agent learned to open the right chunks (earning the +0.2 bonus) while paying less attention to actually answering correctly. The training reward was dominated by the exploration bonus, not answer quality — so the gradient signal pushed the model to optimize opens, not answers.</p>

<p>This is a textbook case of <strong>reward hacking</strong>. The agent found a way to earn high reward without doing the thing we actually wanted (accurate answers).</p>

<figure>
<img src="/assets/tinker-explorer/comparison/goodharts_law_3runs.png" alt="Goodhart's Law Visualization" />
<figcaption>Goodhart's Law Visualization — the inverse relationship between training reward and model quality</figcaption>
</figure>

<h3>Lesson</h3>

<p>Shaped rewards are dangerous. The extra signal might seem helpful, but if it's easier to optimize than the true objective, the agent will chase the bonus and ignore what matters.</p>

<hr />

<h2 id="7-run-2-pure-f1--cleaning-the-signal">7. Run 2: Pure F1 — Cleaning the Signal</h2>

<h3>The Fix</h3>

<p>Strip everything back to the minimum:</p>

<pre><code>reward = token_f1(predicted, gold)    # nothing else</code></pre>

<p>Plus one safety gate: the agent must open at least 1 chunk before earning any reward. This prevents the degenerate strategy of answering immediately without reading anything.</p>

<h3>Training</h3>

<p>100 batches. Immediately obvious: training reward was <strong>lower</strong> than Run 1. The agent earned less reward per batch because there was no easy bonus to collect.</p>

<figure>
<img src="/assets/tinker-explorer/comparison/all_reward_curves.png" alt="All Reward Curves" />
<figcaption>All training reward curves across three runs — lower training reward correlated with better model quality</figcaption>
</figure>

<p>The red line (Run 1) sits higher than the green line (Run 2) throughout training. To someone only watching the training curves, Run 1 looks better. But...</p>

<h3>Results</h3>

<table>
<thead>
<tr><th>Model</th><th>F1</th><th>EM</th><th>Answer Rate</th></tr>
</thead>
<tbody>
<tr><td>Heuristic</td><td>0.246</td><td>0.220</td><td>100%</td></tr>
<tr><td>SFT</td><td>0.152</td><td>0.065</td><td>87%</td></tr>
<tr><td>RL Run 1 (shaped)</td><td>0.123</td><td>0.010</td><td>96%</td></tr>
<tr><td><strong>RL Run 2 (pure F1)</strong></td><td><strong>0.154</strong></td><td><strong>0.065</strong></td><td>89.5%</td></tr>
</tbody>
</table>

<p><strong>F1 jumped from 0.123 to 0.154</strong> — a 25% improvement — by <em>removing</em> reward signal. The pure F1 agent matched the SFT baseline, which means the RL training at least didn't hurt, even if it didn't help much.</p>

<h3>Error Analysis</h3>

<p>We looked at what the model actually output on the 200 val tasks:</p>

<figure>
<img src="/assets/tinker-explorer/comparison/prediction_breakdown.png" alt="Prediction Breakdown" />
<figcaption>Prediction breakdown showing 50% of outputs were status text instead of answers</figcaption>
</figure>

<p><strong>50% of outputs were status text</strong> — things like:</p>
<ul>
<li>"Chunk(s) 4 and 7 ('Polish-Russian War' and 'Xawery Żuławski') have been opened."</li>
<li>"Chunk 0 ('Blind Shaft') has highest overlap with the question."</li>
</ul>

<p>The model was outputting <strong>descriptions of its own actions</strong> instead of answers. It opened the right chunks, formed the right reasoning — then put the reasoning in the answer field instead of the actual answer.</p>

<p>This error mode is invisible in aggregate metrics. You can only find it by reading examples.</p>

<hr />

<h2 id="8-run-3-status-text-fix--the-breakthrough">8. Run 3: Status Text Fix — The Breakthrough</h2>

<h3>The Insight</h3>

<p>The 50% status text rate meant that half our training signal was wasted. These episodes generated zero reward (because "Chunk 4 has been opened" has zero token overlap with "Małgorzata Braunek") — but the model didn't learn from them because the gradient signal was the same as for genuinely wrong answers.</p>

<p>We needed to make the punishment <em>explicit</em>.</p>

<h3>Three Changes</h3>

<p><strong>1. Reward penalty</strong> — If the answer starts with known status text patterns, force reward to 0:</p>

<pre><code>_STATUS_PREFIXES = ("chunk", "the chunk", "chunks", "i have", "i've", "based on")

if any(answer_text.lower().startswith(p) for p in _STATUS_PREFIXES):
    return 0.0  # you gave me reasoning, not an answer</code></pre>

<p><strong>2. Prompt update</strong> — Added an explicit "NEVER do this" section:</p>

<pre><code>NEVER put any of these in the "text" field:
- "Chunk X has been opened" — this is NOT an answer
- "Chunk X has highest overlap" — this is reasoning, not an answer
- "Based on the text..." — just give the answer directly</code></pre>

<p><strong>3. Same pure F1 base</strong> — No relevance bonus. Min-read gate still active.</p>

<h3>Training</h3>

<p>~102 batches across two sessions (the first session crashed at batch 52 due to a Tinker API network timeout; we resumed from the batch 50 checkpoint).</p>

<p>Training reward was the <strong>lowest of all three runs</strong> — the status text penalty made the signal even sparser (71% nonzero batches, vs 78% in Run 2 and 96% in Run 1).</p>

<figure>
<img src="/assets/tinker-explorer/run_3/reward_curve.png" alt="Run 3 Reward Curve" />
<figcaption>Run 3 Training Reward — lowest training reward, but best model</figcaption>
</figure>

<h3>Results</h3>

<table>
<thead>
<tr><th>Model</th><th>F1</th><th>EM</th><th>Answer Rate</th><th>Avg Opens</th></tr>
</thead>
<tbody>
<tr><td>Heuristic</td><td><strong>0.246</strong></td><td><strong>0.220</strong></td><td>100%</td><td>1.2</td></tr>
<tr><td>SFT</td><td>0.142</td><td>0.060</td><td>87.0%</td><td>1.6</td></tr>
<tr><td>RL Run 1 (shaped)</td><td>0.123</td><td>0.010</td><td>96.0%</td><td>1.4</td></tr>
<tr><td>RL Run 2 (pure F1)</td><td>0.154</td><td>0.065</td><td>89.5%</td><td>1.5</td></tr>
<tr><td><strong>RL Run 3 (status fix)</strong></td><td><strong>0.172</strong></td><td><strong>0.085</strong></td><td><strong>99.5%</strong></td><td><strong>1.2</strong></td></tr>
</tbody>
</table>

<p>🎉 <strong>Best results across every metric:</strong></p>
<ul>
<li><strong>F1 = 0.172</strong> — 40% better than Run 1, 21% better than SFT</li>
<li><strong>EM = 0.085</strong> — 8.5× better than Run 1</li>
<li><strong>Answer Rate = 99.5%</strong> — the model almost always gives an answer now</li>
<li><strong>Efficiency = 1.2 opens</strong> — same as the heuristic, better than SFT</li>
</ul>

<figure>
<img src="/assets/tinker-explorer/comparison/val_all_models.png" alt="Val Results" />
<figcaption>Validation results across all models — Run 3 dominates</figcaption>
</figure>

<h3>The Reasoning Evolution</h3>

<p>The most compelling evidence comes from looking at the same questions across all three runs:</p>

<figure>
<img src="/assets/tinker-explorer/comparison/reasoning_evolution.png" alt="Reasoning Evolution" />
<figcaption>How the same questions were answered across three runs — the model opened the right documents every time, but only Run 3 put the right answer in the answer field</figcaption>
</figure>

<p>Example 2 tells the whole story:</p>
<ul>
<li><strong>Run 1</strong>: "Chunk(s) 4 and 7 have been opened." → F1 = 0.00</li>
<li><strong>Run 2</strong>: "Chunk(s) 4 and 7 have been opened." → F1 = 0.00</li>
<li><strong>Run 3</strong>: "Małgorzata Braunek" → F1 = 1.00</li>
</ul>

<p>The model opened the right documents in all three runs. The reasoning was correct in all three runs. The only difference was <strong>what it put in the answer field</strong>.</p>

<hr />

<h2 id="9-the-paradox-lower-training-reward--better-model">9. The Paradox: Lower Training Reward = Better Model</h2>

<p>This is the central insight of the project. Across three runs, we observed an inverse relationship between training reward and actual model quality:</p>

<figure>
<img src="/assets/tinker-explorer/comparison/paradox_scatter.png" alt="The Paradox" />
<figcaption>The paradox: lower training reward = better model quality</figcaption>
</figure>

<table>
<thead>
<tr><th>Run</th><th>Training Reward</th><th>Val F1</th></tr>
</thead>
<tbody>
<tr><td>Run 1 (shaped)</td><td><strong>0.108</strong> (highest)</td><td><strong>0.123</strong> (worst)</td></tr>
<tr><td>Run 2 (pure F1)</td><td>0.067</td><td>0.154</td></tr>
<tr><td>Run 3 (status fix)</td><td><strong>0.056</strong> (lowest)</td><td><strong>0.172</strong> (best)</td></tr>
</tbody>
</table>

<p><strong>The run with the lowest training reward produced the best model.</strong></p>

<p>Why? Because each successive run used a <strong>stricter, more honest reward function</strong>:</p>
<ul>
<li>Run 1's reward was easy to earn (bonus for opens) but misleading</li>
<li>Run 2's reward was harder (F1 only) but still didn't penalize status text</li>
<li>Run 3's reward was the hardest (F1 + status text penalty) but most aligned with what we actually want</li>
</ul>

<p>Each time we made the reward harder, the training curves looked worse — but the model learned better behaviors. This is the opposite of what intuition suggests. Most practitioners assume higher training reward = better learning. Our experience shows that <strong>reward quality matters more than reward quantity</strong>.</p>

<p>This echoes a broader principle in RL: <strong>easy rewards lead to shallow learning</strong>. The difficulty of the reward function is a feature, not a bug.</p>

<hr />

<h2 id="10-results-and-analysis">10. Results and Analysis</h2>

<h3>Final Comparison Table</h3>

<table>
<thead>
<tr><th>Model</th><th>Token F1</th><th>Exact Match</th><th>Answer Rate</th><th>Avg Opens</th><th>Training</th></tr>
</thead>
<tbody>
<tr><td>Heuristic</td><td><strong>0.246</strong></td><td><strong>0.220</strong></td><td>100%</td><td>1.2</td><td>N/A</td></tr>
<tr><td>SFT (warm-start)</td><td>0.142</td><td>0.060</td><td>87.0%</td><td>1.6</td><td>450 steps</td></tr>
<tr><td>RL Run 1 (shaped)</td><td>0.123</td><td>0.010</td><td>96.0%</td><td>1.4</td><td>100 batches</td></tr>
<tr><td>RL Run 2 (pure F1)</td><td>0.154</td><td>0.065</td><td>89.5%</td><td>1.5</td><td>100 batches</td></tr>
<tr><td>RL Run 3 (status fix)</td><td><strong>0.172</strong></td><td><strong>0.085</strong></td><td><strong>99.5%</strong></td><td><strong>1.2</strong></td><td>~102 batches</td></tr>
</tbody>
</table>

<h3>The Improvement Trajectory</h3>

<figure>
<img src="/assets/tinker-explorer/comparison/f1_progression.png" alt="F1 Progression" />
<figcaption>F1 progression across runs — starting from SFT baseline, RL initially worsened then systematically improved through reward engineering</figcaption>
</figure>

<p>Starting from the SFT baseline (0.142), RL initially made things worse (Run 1: 0.123), then systematically improved through reward engineering (Run 2: 0.154, Run 3: 0.172). The gap to the heuristic (0.246) narrowed from 50% to 30%.</p>

<h3>Answer Quality Distribution</h3>

<figure>
<img src="/assets/tinker-explorer/comparison/answer_quality_evolution.png" alt="Answer Quality Evolution" />
<figcaption>Answer quality evolution — status text dropped dramatically from Run 1 to Run 3</figcaption>
</figure>

<p>The most dramatic change is in the "Status text" category — dropping from ~120 instances in Run 1 to significantly fewer in Run 3, while "Correct" and "Partial" answers increased.</p>

<h3>Where the Gap to the Heuristic Remains</h3>

<p>The heuristic still leads by 30%. Why?</p>

<ol>
<li><strong>Exact entity names</strong>: The heuristic uses Wikipedia article titles as answers, which happen to be the exact entity names that 2WikiMultiHopQA expects. The RL model generates free-text that may paraphrase or include minor variations.</li>
<li><strong>Formatting</strong>: "The Mask Of Fu Manchu" vs "The Mask of Fu Manchu" — capitalization differences reduce F1.</li>
<li><strong>Inherent difficulty</strong>: Some questions require reasoning chains the 8B model struggles with, regardless of which documents it reads.</li>
</ol>

<h3>Cumulative Reward</h3>

<figure>
<img src="/assets/tinker-explorer/comparison/cumulative_reward.png" alt="Cumulative Reward" />
<figcaption>Cumulative average reward — RL runs plateau below heuristic and SFT baselines</figcaption>
</figure>

<p>The cumulative average reward shows both RL runs plateauing well below the heuristic and SFT baselines — confirming that the training signal, while sufficient for improvement, remains sparse.</p>

<hr />

<h2 id="11-lessons-learned">11. Lessons Learned</h2>

<h3>1. Look at Your Model's Actual Outputs</h3>

<p>This is the single most important lesson. We spent hours tuning hyperparameters and reward functions — but the breakthrough came from <strong>reading 20 example predictions</strong> and noticing that half were status text. No amount of quantitative analysis would have revealed this.</p>

<p><strong>Practical advice</strong>: Before any training run, sample 20 predictions and read them manually. Two minutes of qualitative analysis beats two hours of hyperparameter sweeps.</p>

<h3>2. Goodhart's Law Is Real and Painful</h3>

<p>Shaped rewards feel scientific and principled. Adding a bonus for opening relevant chunks seems like it should help. In practice, it creates a shortcut the agent exploits while ignoring the actual objective.</p>

<p><strong>Practical advice</strong>: Start with the simplest possible reward. Add complexity only when you've confirmed the base signal works.</p>

<h3>3. Sparse but Honest &gt; Dense but Misleading</h3>

<p>Run 3 had 71% nonzero batches (vs 96% for Run 1). Many practitioners would look at that and add reward shaping to "help" the agent learn. Our experience shows the opposite: the sparse signal produced the best model because every bit of reward was earned through genuinely correct behavior.</p>

<h3>4. SFT Warm-Start Matters More Than You Think</h3>

<p>Without SFT, the model wouldn't know the action format (JSON with "action", "target", "text" fields). The 450 demonstration episodes gave it the basic vocabulary for exploration. RL then refined the <em>decisions</em> within that format.</p>

<h3>5. Infrastructure Resilience is a First-Class Concern</h3>

<p>Across three runs (~300 total batches), we experienced:</p>
<ul>
<li>2 network timeouts requiring session restart</li>
<li>1 tensor alignment bug requiring code fix</li>
<li>Multiple loss spikes from importance sampling ratios</li>
</ul>

<p>Long-running RL experiments need: checkpointing every N batches, automatic resume logic, and gradient clipping. These aren't optional — they're survival features.</p>

<h3>6. The Heuristic Baseline Was Shockingly Strong</h3>

<p>A simple TF-IDF overlap heuristic achieved F1 = 0.246. After 3 RL runs totaling ~300 batches (~36 hours of training), the learned agent reached 0.172. The heuristic required zero training.</p>

<p>This humbling result is common in RL: carefully engineered baselines are hard to beat. The heuristic's advantage came from a design choice (using chunk titles as answers) that happened to align perfectly with the evaluation metric. The RL agent had to discover this alignment from scratch.</p>

<hr />

<h2 id="12-whats-next">12. What's Next</h2>

<p>The 30% gap to the heuristic is surmountable. Based on our error analysis, these are the highest-ROI next steps:</p>

<h3>Near-Term (Runs 4-5)</h3>

<ol>
<li><strong>Exact Match reward</strong> — Replace token F1 with binary EM. The heuristic wins because its answers are exact matches. Training for EM directly would close the gap, though the sparser signal needs a larger GROUP_SIZE (32 or 64).</li>
<li><strong>Post-processing cleanup</strong> — Strip common prefixes ("The answer is...", "Based on the text...") at eval time. This is a free 2-3% F1 improvement.</li>
<li><strong>Few-shot prompting</strong> — Add 3-4 worked examples to the system prompt showing the complete question → open → answer flow.</li>
</ol>

<h3>Medium-Term</h3>

<ol start="4">
<li><strong>Larger GROUP_SIZE</strong> (32-64) — More rollouts per task reduce variance, which is critical with sparser rewards.</li>
<li><strong>Curriculum learning</strong> — Start with easier questions (single-hop) and gradually introduce multi-hop. This provides denser early reward without sacrificing eventual difficulty.</li>
<li><strong>SEARCH(q) sub-action</strong> — Let the agent compose sub-queries. Instead of just opening chunks by index, it could search for "director of Polish-Russian War" and get filtered results.</li>
</ol>

<h3>Long-Term</h3>

<ol start="7">
<li><strong>Larger models</strong> — Qwen3-8B is capable but limited. 14B or 32B models may have stronger reasoning that translates to better exploration.</li>
<li><strong>Multi-hop reasoning chains</strong> — Visualize and reward intermediate reasoning steps, not just the final answer.</li>
</ol>

<hr />

<h2>Appendix: Technical Details</h2>

<h3>Code Structure</h3>

<pre><code>tinker-explorer/
├── env/
│   ├── explorer_env.py      # RL environment
│   ├── action_schema.py     # JSON action parsing
│   └── reward.py            # Reward function (all 3 variants)
├── train/
│   └── rl_train.py          # GRPO training loop
├── eval/
│   ├── eval_rl.py           # Val set evaluation
│   └── eval_trajectories.py # Trajectory visualization
├── policies/
│   ├── prompts.py           # System prompt
│   └── heuristics.py        # Heuristic baseline
├── runs/                    # Run reports (this post's source data)
├── plots/                   # All figures in this post
└── logs/                    # Raw metrics and rollouts</code></pre>

<h3>Compute</h3>

<p>All experiments ran on a MacBook Pro with no local GPU. Model inference and gradient computation happened on <a href="https://tinker.computer/">Tinker's</a> cloud infrastructure. Total wall-clock time across 3 runs: ~40 hours. Estimated cloud compute: ~120 GPU-hours (Qwen3-8B with LoRA on A100-equivalent).</p>

<h3>Reproducibility</h3>

<p>All metrics, checkpoints, and evaluation results are saved in the repository:</p>
<ul>
<li><code>logs/rl-run-v{1,2,3}/metrics.jsonl</code> — per-batch training metrics</li>
<li><code>logs/eval-rl-v1.json</code> — full per-task evaluation results</li>
<li><code>runs/run_{1,2,3}_*.md</code> — detailed run reports with interpretation</li>
</ul>

<hr />

<p><em>This project was built as a research experiment exploring RL for language agent training. The code, data, and this post are available for educational purposes. Inspired by <a href="https://x.com/karpathy/status/1884359634653819353">Karpathy's autoresearch</a>, built on <a href="https://tinker.computer/">Tinker</a>.</em></p>

</div>
