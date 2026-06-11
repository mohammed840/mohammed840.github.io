# Notes: Harness Engineering for Long-Running Agents

Working notes for a future blog section.

Sources read:

- Anthropic. 2025. "Effective harnesses for long-running agents." Published November 26, 2025. https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- OpenAI. 2026. "Harness engineering: leveraging Codex in an agent-first world." Published February 11, 2026. https://openai.com/index/harness-engineering/
- Xu, B. et al. 2026. "Polar: Agentic RL on Any Harness at Scale." arXiv:2605.24220v1. Local PDF: `2605.24220v1-2.pdf`.

Retrieved: June 11, 2026.

## Core Theme

Both posts are really about the same deeper shift: the limiting factor for agents is no longer only model capability. The limiting factor is the environment around the agent.

The harness is the operational environment that lets an agent:

- understand the current state of work
- recover context across sessions
- choose the next useful step
- test whether its work actually functions
- leave artifacts for the next run
- operate inside mechanical constraints rather than vague human preference

This is important for the blog because it connects directly to the idea that agent performance depends on environment design, not only prompting or model choice.

## Continuity for Long-Running Agents

One source focuses on agents that need to work across many context windows. The problem is not that the model cannot write code in one session. The problem is that long-running projects require continuity, and each new context window can lose the history of what happened before.

### Main Problem

Long-running agents fail when they cannot carry project state across sessions.

The pattern highlights two repeated failure modes:

- The agent tries to do too much in one run, leaves a half-finished implementation, and the next run has to infer what happened.
- The agent sees partial progress and prematurely decides the project is complete.

The key insight is that compaction alone is not enough. A harness must preserve the right kind of state outside the model context.

### Two-Agent Setup

The setup uses two roles:

- Initializer agent: sets up the environment for the first run.
- Coding agent: makes incremental progress in later runs.

The initializer creates the artifacts that future agents will use, such as:

- `init.sh`
- `progress.txt`
- a feature list
- an initial git commit

The coding agent then reads these artifacts, chooses one piece of work, makes progress, tests it, and leaves clear updates.

### Feature List as External Memory

The feature list is one of the most important ideas. Instead of asking the agent to remember what "done" means, the harness writes a structured list of expected end-to-end features.

The example used JSON because it is harder for the model to casually rewrite than Markdown. Each feature can be marked as passing or failing. The agent is instructed to update only the status field after real testing.

The feature list solves two problems:

- It prevents premature victory.
- It turns a vague product request into inspectable acceptance criteria.

### Incremental Progress

The reported pattern is that agents work better when instructed to work on one feature at a time. This matters because long-horizon tasks become fragile when the agent tries to solve everything at once.

The pattern is:

```text
read progress
read feature list
choose one failing feature
implement only that feature
test it end to end
commit progress
write progress notes
```

This is a harness-level discipline, not just a prompt-level instruction.

### Clean State

The workflow emphasizes that each session should leave the repo in a clean state. Clean state means the next agent can begin work without first repairing unrelated mess.

The clean-state requirement includes:

- working code
- no major bugs from the session
- organized changes
- enough documentation or progress notes for the next run
- git history that explains what happened

This is basically shift handoff for agents.

### Testing Like a User

The warning is that agents often mark work complete without proper end-to-end validation. Unit tests and `curl` checks are not always enough.

For web apps, the harness improved when the agent had browser automation tools and was explicitly told to test features as a human user would.

The important blog takeaway:

```text
An agent does not become reliable just because it can edit code.
It becomes more reliable when the environment gives it tools to observe behavior.
```

### Getting Up to Speed

Each coding session begins with a routine:

- run `pwd`
- read progress notes
- inspect git history
- read the feature list
- run `init.sh`
- start the dev server
- perform a basic end-to-end check
- only then start new work

This is very close to an agent operating protocol. It makes the agent's first moves predictable and reduces wasted context.

### Continuity Takeaway

The continuity pattern can be summarized as:

```text
Long-running agents need continuity artifacts.
Progress is made reliable by external state, incremental tasks, git history, progress logs, and end-to-end tests.
```

## Harness Engineering for Agent-First Workflows

The second source is broader. It argues that in an agent-first workflow, human engineers do less direct coding and more environment design.

The central claim is that humans steer and agents execute. The engineer's job becomes designing the harness: repository structure, tools, docs, checks, evaluation loops, and feedback systems.

### Main Shift

The source describes building an internal product with agent-generated code. The important point for the blog is not the raw amount of code. The important point is the change in engineering work.

Instead of manually implementing every line, humans:

- specify intent
- design the environment
- encode constraints
- create feedback loops
- review outcomes
- convert repeated failures into tools or rules

When the agent fails, the human question becomes:

```text
What capability, constraint, tool, or documentation is missing from the harness?
```

That is the core harness engineering mindset.

### Application Legibility

The design approach emphasizes making the application itself legible to the agent.

Examples:

- bootable app per git worktree
- Chrome DevTools integration
- DOM snapshots
- screenshots
- navigation tools
- local logs
- metrics
- traces

This lets the agent reproduce bugs, validate fixes, and reason about runtime behavior directly.

The deeper idea:

```text
If the agent cannot inspect it, it effectively does not exist.
```

For agent systems, observability is not only for humans. It is part of the agent's perception system.

### Repository Knowledge as the System of Record

The argument is against one huge `AGENTS.md` file. A giant instruction file wastes context, becomes stale, and is hard to verify.

Instead, `AGENTS.md` should act like a table of contents. The deeper knowledge should live in structured repository docs.

Example structure:

```text
AGENTS.md
ARCHITECTURE.md
docs/
  design-docs/
  exec-plans/
  generated/
  product-specs/
  references/
  DESIGN.md
  FRONTEND.md
  PLANS.md
  RELIABILITY.md
  SECURITY.md
```

This gives the agent progressive disclosure. It starts with a small map, then opens the relevant deeper document when needed.

### Plans as First-Class Artifacts

This treats plans as repository artifacts, not temporary chat messages.

This matters because agents cannot rely on private human memory, Slack threads, or one-off conversations. If a plan matters, it should be versioned and discoverable.

The blog angle:

```text
Agent memory should be externalized into artifacts that future agents can inspect.
```

This connects strongly to the progress-file idea.

### Agent Legibility

The repository should be optimized for agent legibility. This is similar to optimizing a codebase for a new engineer, but more literal.

Useful information must be:

- local
- versioned
- structured
- searchable
- mechanically checkable

Knowledge hidden in a person's head or a chat thread is outside the agent's world model.

### Mechanical Constraints

The argument is that documentation alone is not enough. The harness must enforce architecture and taste mechanically.

Examples include:

- strict architectural layers
- validated dependency directions
- custom linters
- structural tests
- file size limits
- structured logging rules
- naming conventions
- clear remediation messages in lint errors

This is important because agents can move quickly, but speed without constraints creates drift.

Good harness design does not micromanage every implementation. It enforces invariants and lets the agent choose local solutions inside those boundaries.

### Throughput Changes the Workflow

The workflow notes that agent throughput changes merge philosophy. When agents can produce many changes quickly, human attention becomes the scarce resource.

This leads to:

- shorter-lived pull requests
- more agent-to-agent review
- less human blocking on every change
- more reliance on automated checks
- follow-up cleanup runs instead of large manual cleanup cycles

This is not a universal recommendation. It works only when the harness has strong testing, observability, documentation, and review loops.

### Autonomy Requires Recovery Loops

The source describes higher autonomy as an end-to-end loop:

```text
validate current state
reproduce bug
record failure
implement fix
validate fix
record resolution
open pull request
respond to feedback
fix build failures
escalate only when judgment is required
merge
```

The agent can do this only because the repository encodes enough context, tools, and guardrails.

### Entropy and Garbage Collection

The post highlights a new failure mode: agents copy existing patterns, including bad ones. Over time, this creates codebase drift.

The solution is recurring cleanup:

- encode golden principles
- run background cleanup tasks
- scan for deviations
- update quality grades
- open targeted refactoring PRs

This is technical debt management for agent-generated systems.

### Harness Engineering Takeaway

The harness-engineering pattern can be summarized as:

```text
Harness engineering means designing the repository, tools, documentation, observability, constraints, and feedback loops so agents can do useful work with less human intervention.
```

## Direct Comparison

| Theme | Session-continuity pattern | Repository-harness pattern |
| --- | --- | --- |
| Main focus | Long-running agents across context windows | Agent-first software engineering |
| Core problem | Agents lose continuity and overreach | Agents need legible environments, tools, and constraints |
| Key artifact | Feature list, progress file, `init.sh`, git history | Structured docs, `AGENTS.md` as map, observability, linters, exec plans |
| Testing | Browser automation and end-to-end feature checks | App-driving, DevTools, logs, metrics, traces, agent reviews |
| Human role | Set up and maintain clean handoff environment | Design harness, encode constraints, turn failures into system improvements |
| Failure mode | One-shotting, half-finished work, premature done | Context overload, stale docs, architectural drift, invisible knowledge |
| Best blog phrase | Continuity artifacts | Agent-legible environment |

## Polar: Agentic RL on Any Harness at Scale

This paper is directly relevant because it turns the blog's harness idea into an RL systems problem.

The central question is:

```text
Can we train agents with RL without opening the box?
```

Polar's answer is yes, at least for LLM-based agents, because every agent harness eventually talks to a model endpoint. Instead of rewriting the harness into a Gym-style RL environment, Polar places a provider-compatible proxy at the model API boundary. The harness continues to run normally, but the proxy records the model traffic needed to reconstruct trainable trajectories.

### Why the Paper Matters for the Blog

The cited engineering posts explain why harnesses matter for building reliable agents. Polar adds a training perspective:

```text
If a harness is the environment where an agent acts, then the harness can also become the rollout environment for RL.
```

This is a very strong connection to the blog's application-layer framing. A harness is not only a runtime for deployment. It can also be the source of behavior-policy trajectories, rewards, and offline data.

### Core Problem

Agentic RL is moving beyond short single-turn tasks. Modern agents operate inside code repositories, browsers, operating systems, tool environments, and multi-agent workflows. These environments produce long trajectories with many model calls, tool calls, context compactions, subagent calls, and tens of thousands of tokens.

Traditional RL assumes that the environment can be wrapped in a standardized interface. That is often unrealistic for agent harnesses. Real harnesses can be:

- implemented in different languages
- distributed as CLIs or binaries
- dependent on provider-specific APIs
- full of internal context management
- built around complex tool protocols
- difficult to port into a trainer-owned environment API

Polar treats this as a systems problem. Instead of forcing every harness to conform to an RL framework, it trains through the common boundary every LLM agent already uses: the model API call.

### Main Architecture

Polar has two main pieces:

- Rollout server: accepts tasks, expands them into sessions, schedules work across gateway nodes, persists compact results, exposes status, and receives callbacks.
- Gateway node: owns each session lifecycle, starts the runtime, prepares the harness, hosts the model proxy, executes the harness, reconstructs trajectories, runs evaluation, tears down resources, and returns results.

The important design choice is that the gateway hosts the model proxy. The harness is configured so its model base URL points to the gateway. The gateway then:

1. Detects provider API shape, such as provider message APIs, chat-completion APIs, response APIs, or Google-style calls.
2. Normalizes the request into a local inference-server format.
3. Captures token-level data: prompts, sampled response tokens, log probabilities, finish reasons, and response messages.
4. Returns the response in the provider shape expected by the original harness.

So the harness runs unchanged, while Polar observes enough to train.

### Proxy Boundary

The proxy boundary is below the agent framework. It does not need to understand the agent's planner, tool logic, context policy, or stopping condition. It only needs to preserve provider compatibility and record the model interactions.

This is the paper's most important systems insight:

```text
The model endpoint can be the rollout boundary.
```

For the blog, this gives a clean phrase:

```text
The harness can stay product-native while the training system listens at the model boundary.
```

### Token-Faithful Trajectory Reconstruction

Polar emphasizes token fidelity because RL credit must be attached to the tokens actually sampled by the behavior policy. If a transcript is decoded and then re-tokenized later, the token IDs may not match the original generation. That creates retokenization drift.

Polar reconstructs traces from captured model calls. Each trajectory can include:

- prompt token IDs
- response token IDs
- loss mask
- prompt messages
- response messages
- tool definitions
- log probabilities
- reward
- metadata

The paper describes two trajectory builders:

- `per_request`: every completion becomes one trace. This is conservative and lossless per call, but fragments long sessions into many small traces.
- `prefix_merging`: reconstructs longer append-only chains when prompt prefixes match, while naturally splitting context compactions, subagents, and independent branches into separate chains.

The correctness invariant is:

```text
Every trainable token matches the behavior policy during rollout, and non-generated tokens are masked out.
```

This is useful for the blog because it makes the idea of "trace" much more precise. It is not merely a transcript. A trainable trace needs token IDs, masks, logprobs, rewards, and provenance.

### Asynchronous Rollout Staging

Long-horizon agent rollouts mix different bottlenecks:

- runtime startup
- dependency preparation
- harness execution
- evaluator setup
- test execution
- patch application
- teardown

Polar separates these into staged worker pools:

- `INIT`: start runtime and prepare dependencies
- `READY`: hold initialized runtimes
- `RUNNING`: execute harness
- `POSTRUN`: build trajectories, evaluate, run hooks, send callbacks, tear down

This matters because agent rollouts have long tails. If setup, execution, and evaluation all block the same worker path, GPU training utilization suffers. Polar's rollout-as-a-service design lets rollout generation scale independently from training.

### Evaluation and Reward

Polar uses registry-backed evaluators after trajectory construction. Built-in examples include:

- session-completion reward
- configurable test-on-output evaluator
- SWE-Bench/SWE-Gym harness evaluator

Rewards can be broadcast to every trace, but the paper warns that naive outcome-reward broadcasting to request-level traces can cause reward hacking. The problem is noisy credit assignment: a whole session reward is attached to small request-level traces without enough normalization or process reward modeling.

This is an important blog point:

```text
Harness-level rewards are easy to collect but hard to assign correctly.
```

### Experiments

Polar trains Qwen3.5-4B with standard GRPO over four coding harnesses on SWE-Gym, then evaluates on SWE-Bench Verified.

Reported pass@1 results:

| Harness | Base | Polar RL | Gain |
| --- | ---: | ---: | ---: |
| Harness A | 3.8% | 26.4% | +22.6 |
| Harness B | 29.8% | 34.6% | +4.8 |
| Harness C | 34.6% | 35.2% | +0.6 |
| Pi | 34.2% | 40.4% | +6.2 |

The largest gain is under Harness A because the base Qwen model is not naturally adapted to that action protocol, context policy, and patch-submission style. Polar optimizes the behavior that actually flows through that harness.

The trajectory-builder ablation is also important:

- `per_request`: 1,185 request-level updates over the compared window, 189.5 minutes, 20.4% average rollout GPU utilization.
- `prefix_merging`: 218 merged-trace updates, 35.2 minutes, 87.7% average rollout GPU utilization.

This supports the paper's systems claim that trajectory reconstruction strategy affects training throughput, not just data formatting.

### Offline Data Generation

Polar can also generate SFT data. In the case study, a Qwen3.5-122B-A10B checkpoint drives the Pi coding harness over 1,638 SWE-Gym instances. A trajectory is accepted only if the SWE-Bench evaluator reports that the patch passes both FAIL_TO_PASS and PASS_TO_PASS tests.

Results:

- 1,638 attempts
- 504 accepted trajectories
- 30.8% acceptance
- about 64 GPU-hours

The paper notes that the same infrastructure can produce:

- rejection sampling data
- verifier-training data
- preference data from accepted/rejected traces
- larger SFT corpora across multiple harnesses

### What Polar Adds to the Blog Argument

The current blog argues that a harness is the application layer around the agent. Polar adds:

```text
A harness is also the trainable environment boundary.
```

This gives a deeper technical claim:

- Deployment harness: makes the agent useful, observable, and safe at test time.
- Training harness: produces trajectories, rewards, and failure data for post-training.
- Proxy boundary: lets the training system observe model behavior without rewriting the harness.

This is a stronger version of "harnesses are the new runtime for AI work." The harness becomes the place where:

- tool use happens
- context management happens
- evaluation happens
- trajectory generation happens
- reward assignment happens
- offline data generation happens

### Blog Section Idea

Add a section after "Evaluation Is the Reward Signal" or before "How to Build a Good Agent Harness":

```text
When the Harness Becomes the RL Environment
```

Main points:

1. In ordinary apps, the harness is a deployment layer.
2. In agentic RL, the harness becomes the environment where rollouts are generated.
3. Polar shows that existing harnesses do not necessarily need to be rewritten as Gym environments.
4. The model API boundary can be used as the observation point.
5. Token-faithful traces matter because RL updates must match the behavior-policy tokens.
6. Harness-level rewards are powerful but credit assignment must be handled carefully.

### Possible Diagram

The blog could add a diagram:

```text
Native harness
  -> model API proxy
  -> token capture
  -> trajectory reconstruction
  -> evaluator reward
  -> RL trainer
  -> updated model
  -> same native harness
```

This would complement the existing "tool gateway" and "evaluation stack" diagrams.

## Synthesis for the Blog

The cited posts together support a strong blog argument:

```text
Prompting is not enough. Long-running agents need harnesses.
```

A harness is not only a wrapper around a model. It is the environment that defines what the agent can see, how it can act, how it knows whether it succeeded, and how its work persists across runs.

For a blog, I would frame the section like this:

1. Models are getting better, but agent reliability still depends on the surrounding environment.
2. At the session-continuity level, this means: progress logs, feature lists, git commits, init scripts, and end-to-end tests.
3. At the organization and repository level, this means: structured docs, local observability, mechanical architecture constraints, agent review loops, and recurring cleanup.
4. The shared lesson is that agents need legible state, executable feedback, and durable memory.
5. The future engineer is not only a coder or prompt writer. The future engineer designs the harness that lets agents operate.

## Possible Blog Section Title Ideas

- From Prompt Engineering to Harness Engineering
- The Environment Around the Agent
- Why Long-Running Agents Need External State
- Agent Legibility as Infrastructure
- Harnesses Are the New Runtime for AI Work

## Blog Angle I Would Use

The most interesting angle is:

```text
An agent harness is an RL environment for software work.
```

The state is the repository, progress files, docs, logs, traces, and feature list.

The action space is editing code, running tests, opening pull requests, updating docs, and asking for review.

The reward signal is not a single scalar. It is a bundle of tests, user-facing validation, lint checks, observability signals, review feedback, and successful deployment.

The curriculum is the feature list, execution plans, and incremental task selection.

The memory is externalized into git history, progress logs, docs, and durable artifacts.

This connects the harness engineering discussion directly to reinforcement learning and environment design.

## Key Claims to Use Carefully

- One cited example is about a full-stack web app setting. The ideas are likely general, but the results are not universal proof for every domain.
- The second cited experience is from an internal product and a heavily engineered repository. The autonomy level depends on investment in tooling, docs, checks, and observability.
- None of the cited work says "just use a better model." Both imply that model gains become useful when paired with the right environment.

## References

Anthropic. 2025. "Effective harnesses for long-running agents." Anthropic Engineering, 26 November. Available at: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

OpenAI. 2026. "Harness engineering: leveraging Codex in an agent-first world." OpenAI, 11 February. Available at: https://openai.com/index/harness-engineering/

Xu, B., Zhang, H., Zhang, S., Han, S., Liu, M., Hu, J., Diao, S., Jin, Z., Zou, Y., Demoret, M., Kautz, J. and Dong, Y. 2026. `Polar: Agentic RL on Any Harness at Scale`. arXiv:2605.24220v1.
