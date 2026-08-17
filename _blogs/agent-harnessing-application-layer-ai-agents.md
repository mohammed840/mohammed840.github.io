---
title: "Agent Harnessing: Building the Application Layer Around AI Agents"
date: 2026-06-11
layout: blog
author: Mohammed Alshehri
description: "A technical guide to agent harnessing: how the application layer gives AI agents state, tools, memory, validation, observability, and RL-ready traces."
---

<style>
.agent-harness-post {
  color: #111;
  font-size: 17px;
  line-height: 1.72;
}
.agent-harness-post .agent-harness-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 235px;
  gap: 42px;
  align-items: start;
}
.agent-harness-post .dek {
  color: #333;
  font-size: 1.08rem;
  line-height: 1.65;
  margin: 0 0 1.8rem;
}
.agent-harness-post h2 {
  font-size: 1.62rem;
  line-height: 1.25;
  margin: 2.8rem 0 0.85rem;
  letter-spacing: 0;
  border-bottom: 0;
  padding-bottom: 0;
}
.agent-harness-post h3 {
  font-size: 1.18rem;
  line-height: 1.32;
  margin: 1.7rem 0 0.55rem;
  letter-spacing: 0;
  border-bottom: 0;
  padding-bottom: 0;
}
.agent-harness-post p {
  margin: 0 0 1rem;
}
.agent-harness-post table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.35rem 0;
  font-size: 0.94rem;
}
.agent-harness-post th,
.agent-harness-post td {
  border-bottom: 1px solid #e7e7e7;
  padding: 0.62rem 0.5rem;
  text-align: left;
  vertical-align: top;
}
.agent-harness-post th {
  font-weight: 700;
  background: #fafafa;
}
.agent-harness-post figure {
  width: min(1180px, calc(100vw - 88px)) !important;
  max-width: min(1180px, calc(100vw - 88px)) !important;
  margin: 2.55rem 0 2.55rem 50%;
  transform: translateX(-50%);
}
.agent-harness-post figure img {
  width: 100% !important;
  max-width: none !important;
  height: auto !important;
  display: block;
  border: 1px solid #e7e7e7;
  border-radius: 6px;
  background: #fff;
}
.agent-harness-post figcaption {
  color: #5f6368;
  font-size: 0.92rem;
  line-height: 1.55;
  margin-top: 0.6rem;
  text-align: center;
}
.agent-harness-post .callout {
  border: 1px solid #e7e7e7;
  background: #f8f8f8;
  border-radius: 7px;
  padding: 1rem;
  margin: 1.3rem 0;
}
.agent-harness-post .principle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
  margin: 1.35rem 0;
}
.agent-harness-post .principle {
  border: 1px solid #e7e7e7;
  border-radius: 7px;
  padding: 0.9rem;
  background: #fff;
}
.agent-harness-post .principle h3 {
  margin-top: 0;
  font-size: 1.03rem;
}
.agent-harness-post .principle p {
  margin-bottom: 0;
  color: #333;
  font-size: 0.96rem;
}
.agent-harness-post pre {
  overflow-x: auto;
  background: #fbfbfb;
  border: 1px solid #e7e7e7;
  border-radius: 6px;
  padding: 1rem;
  margin: 1.25rem 0;
  line-height: 1.55;
}
.agent-harness-post pre code {
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 0.88rem;
}
.agent-harness-post code {
  overflow-wrap: anywhere;
}
.agent-harness-post .toc {
  position: fixed;
  top: 92px;
  left: calc(50% + 270px);
  width: 235px;
  max-height: calc(100vh - 116px);
  overflow-y: auto;
  border-left: 1px solid #e7e7e7;
  padding-left: 1rem;
  padding-right: 0.25rem;
  color: #5f6368;
  font-size: 0.9rem;
  z-index: 10;
}
.agent-harness-post .toc strong {
  display: block;
  color: #111;
  margin-bottom: 0.6rem;
}
.agent-harness-post .toc a {
  display: block;
  color: inherit;
  text-decoration: none;
  margin: 0 0 0.55rem;
  line-height: 1.35;
}
.agent-harness-post .toc a:hover {
  color: #111;
  text-decoration: underline;
}
.agent-harness-post .reference-list p {
  font-size: 0.95rem;
  color: #333;
  overflow-wrap: anywhere;
}
@media (max-width: 980px) {
  .agent-harness-post .agent-harness-layout {
    grid-template-columns: 1fr;
  }
  .agent-harness-post .toc {
    position: static;
    width: auto;
    max-height: none;
    overflow: visible;
    border-left: 0;
    border-top: 1px solid #e7e7e7;
    padding: 1rem 0 0;
    order: -1;
  }
  .agent-harness-post .principle-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<div class="agent-harness-post" markdown="0">
<p class="dek">
        A useful agent is not just a model with a long prompt. It is a model operating inside an application layer that gives it tools, state, memory, constraints, validation, observability, and a way to recover when work spans many steps. The harness is where an AI system stops being a demo and starts becoming software.
      </p>
  <div class="agent-harness-layout">
    <div class="agent-harness-main">
        <section id="what-is-agent-harnessing">
          <h2>What Is Agent Harnessing?</h2>
          <p>
            Agent harnessing is the practice of building the application layer around an AI agent so that the agent can do useful work in a controlled, observable, and recoverable way. The harness is not the model itself. It is the surrounding system that tells the model what it can see, what it can do, how tool use works, how progress is stored, how success is checked, and when a human should be brought back into the loop.
          </p>
          <p>
            This matters because agent quality is not determined only by model capability. A strong model inside a weak harness will still lose context, call the wrong tool, skip validation, repeat stale assumptions, or confidently declare success before the task is actually complete. A smaller model inside a strong harness can sometimes behave more reliably because the environment makes the correct behavior easier and the incorrect behavior harder.
          </p>
          <p>
            I think of an agent harness as a runtime for applied reasoning. It turns an open-ended instruction like "fix this bug", "review this contract", or "process this support request" into a structured loop: gather state, choose a workflow, call tools through a gateway, validate the result, persist progress, and expose enough evidence for review.
          </p>
          <p>
            The reason this deserves its own term is that an agent harness is not just orchestration glue. It decides what the agent is allowed to know, how it is allowed to act, how it receives feedback, and how its work becomes durable. In normal application development, we think carefully about the user interface, database schema, authorization layer, background jobs, and observability stack. Agent applications need the same seriousness around the model's operating environment.
          </p>
          <p>
            A chat model can answer a question from its context window. An agent has to do more: inspect the world, choose between possible actions, update external state, notice when an action failed, and continue without losing the thread. That is why the harness is best understood as the application layer around the agent, not as a prompt template.
          </p>

          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Main question</th>
                <th>Example responsibility</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Model</td>
                <td>What should I reason about next?</td>
                <td>Generate a plan, choose a tool, draft an answer, revise after feedback.</td>
              </tr>
              <tr>
                <td>Harness</td>
                <td>What can the agent see and do?</td>
                <td>Provide context, tools, policies, memory, validation, and traces.</td>
              </tr>
              <tr>
                <td>Application</td>
                <td>What is the real product workflow?</td>
                <td>Legal review, ticket resolution, data analysis, customer account update.</td>
              </tr>
            </tbody>
          </table>

          <figure>
            <img src="/assets/agent-harness-blog/01-harness-application-layer.svg" alt="Agent harness as an application layer diagram">
            <figcaption>
              Figure 1. The harness sits between intent and action. It is the layer that grounds the agent in application state, mediates tools, checks outputs, and records what happened.
            </figcaption>
          </figure>
        </section>

        <section id="why-prompting-is-not-enough">
          <h2>Why Prompting Is Not Enough</h2>
          <p>
            Prompting tells the model what you want. A harness gives the model a world it can operate in. That distinction is the whole point.
          </p>
          <p>
            For a short one-turn task, a prompt may be enough. But once an agent has to work across files, documents, browser state, API calls, user preferences, logs, tests, memory, or multiple sessions, the prompt becomes only one part of the system. The agent needs an environment that preserves facts outside the context window and gives the model feedback about whether its actions worked.
          </p>
          <p>
            I frame this as two connected problems. First, agents need continuity: durable artifacts such as progress logs, feature lists, setup scripts, and clean handoff state. Second, agents need a legible application environment: they need tools to inspect runtime behavior, structured state they can trust, and repeated lessons encoded as mechanical checks instead of relying on memory or vibes.
          </p>
          <p>
            The shared lesson is simple: if the agent cannot inspect the state, it will infer. If it cannot validate the result, it will guess. If it cannot persist progress, the next run starts from fog. The harness exists to remove as much of that fog as possible.
          </p>
          <p>
            This is also where many agent projects go wrong. They begin by asking "how do I make the model smarter?" when the more useful question is often "what is the model missing from its environment?" Maybe it needs a real browser, not a screenshot. Maybe it needs a structured task ledger, not a summary in chat. Maybe it needs a safe tool gateway, not direct database access. Maybe it needs a verifier that can reject shallow work, not another paragraph in the system prompt.
          </p>
          <p>
            Prompting is still important. The model needs role, task, style, and policy instructions. But prompting does not create durable memory. It does not create a database transaction boundary. It does not guarantee a browser flow actually works. It does not decide whether a refund tool is safe to call. Those are harness responsibilities.
          </p>

          <div class="callout">
            <p><strong>Definition:</strong> an agent harness is the structured application layer that gives an agent state, tools, policies, memory, validation, observability, and handoff protocols.</p>
          </div>
        </section>

        <section id="what-the-source-posts-add">
          <h2>What the Two Source Posts Add</h2>
          <p>
            The two engineering posts that motivated these notes are useful because they attack the same problem from different levels. One is mostly about how an agent keeps working across long-running sessions. The other is about how an engineering organization changes when agents become part of the development loop. I do not want to copy their vendor-specific framing. The deeper point is more general: agents need legible environments.
          </p>
          <p>
            The long-running-agent view is practical and almost operational. It asks: when the context window is gone, what does the next run know? What counts as done? What should the agent do first when it wakes up? What should it leave behind before stopping? This leads to artifacts like progress logs, feature lists, setup scripts, git history, and end-to-end checks.
          </p>
          <p>
            The harness-engineering view is broader. It asks: how should an application be built so an agent can inspect it, modify it, test it, and learn from failures? This leads to structured documentation, local observability, mechanical rules, shorter feedback cycles, task plans stored in the repository, and automated cleanup of drift.
          </p>

          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>Harness answer</th>
                <th>Application-layer version</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>The agent forgets what happened before.</td>
                <td>Externalize memory into artifacts.</td>
                <td>Store task state, decisions, traces, and unresolved work in durable storage.</td>
              </tr>
              <tr>
                <td>The agent marks work done too early.</td>
                <td>Define acceptance criteria outside the prompt.</td>
                <td>Use feature checklists, workflow tests, and verifier gates.</td>
              </tr>
              <tr>
                <td>The agent cannot see runtime behavior.</td>
                <td>Make the application legible.</td>
                <td>Expose logs, screenshots, DOM snapshots, database fixtures, and metrics.</td>
              </tr>
              <tr>
                <td>The agent repeats bad patterns.</td>
                <td>Encode constraints mechanically.</td>
                <td>Add linters, policy gates, schema checks, and regression tests.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="control-loop">
          <h2>The Agent Harness Control Loop</h2>
          <p>
            A good harness is not a single request-response wrapper. It is a loop. The agent observes state, makes a plan, acts through tools, validates the result, persists what changed, and uses failures to improve the future environment.
          </p>
          <p>
            This is why harness engineering feels close to reinforcement learning environment design. The agent does not just emit text. It interacts with a stateful environment. The environment defines the observation space, the action space, the transition function, and the reward signals. In software and product work, those reward signals are tests, user-visible behavior, logs, evals, human review, and production telemetry rather than a single scalar reward.
          </p>
          <p>
            The control loop is the place where a harness becomes more than a wrapper. A wrapper takes a user request, sends it to a model, and returns the model's answer. A harness asks what state is relevant, what action is safe, what result should be expected, what evidence was produced, and what should happen if the result is not good enough.
          </p>
          <p>
            That last part is important. A strong harness does not treat failure as a surprise. It expects failures and gives them structure. A tool can fail because its arguments were invalid, because the user lacks permission, because the resource does not exist, because the external API timed out, or because the observation contradicts the agent's plan. Those are different failures. A harness should represent them differently so the agent can recover differently.
          </p>

          <table>
            <thead>
              <tr>
                <th>RL term</th>
                <th>Agent harness equivalent</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>State</td>
                <td>Current task context</td>
                <td>User request, active document, logs, tool history, memory.</td>
              </tr>
              <tr>
                <td>Action</td>
                <td>Tool call or final response</td>
                <td>Search document, inspect account, run browser test, ask for approval.</td>
              </tr>
              <tr>
                <td>Transition</td>
                <td>Application state update</td>
                <td>New observation, changed ticket, added note, failed test output.</td>
              </tr>
              <tr>
                <td>Reward</td>
                <td>Validation signal</td>
                <td>Tests pass, verifier accepts, user goal completed, no policy violation.</td>
              </tr>
            </tbody>
          </table>

          <figure>
            <img src="/assets/agent-harness-blog/02-agent-control-loop.svg" alt="Agent harness control loop diagram">
            <figcaption>
              Figure 2. The harness control loop should be explicit. Observe, plan, act, validate, persist, and improve. The model lives inside the loop rather than acting directly on the world.
            </figcaption>
          </figure>

          <p>
            The practical result is that the harness reduces the number of things the model has to hold in fragile natural-language memory. The current task is represented in a task object. The available actions are represented in a tool registry. The last outcome is represented in logs. The acceptance criteria live in a test or checklist. The model still reasons, but the environment carries more of the burden.
          </p>
          <p>
            A useful design question is: what should be inside the model's context, and what should live outside it? The answer should almost never be "everything goes into the context." The context should contain the relevant slice. The rest should live as retrievable state, durable artifacts, and tools that can be invoked when needed.
          </p>
        </section>

        <section id="workflow-design">
          <h2>Workflow Design</h2>
          <p>
            In harness engineering, the structure of the workflow can either be manually designed by domain experts or discovered through automated search. Auto-research systems are a useful example because they show how different researchers turn the research process itself into an agentic pipeline.
          </p>
          <p>
            One line of work focuses on building end-to-end research agents. For example, <strong>AI Scientist</strong> by Lu et al. frames scientific discovery as a full pipeline: the system generates research ideas, implements code, runs experiments, interprets the results, writes a paper, and then reviews the output. The important idea is not just that the model writes code or text, but that the whole research loop is decomposed into reusable stages that can be evaluated and improved.
          </p>

          <figure>
            <img src="/assets/agent-harness-blog/07-auto-research-harness-loop.png" alt="Auto-research harness loop diagram">
            <figcaption>
              Figure 3. A generic auto-research harness where ideas, experiments, evidence checks, writing, and review form a closed feedback loop.
            </figcaption>
          </figure>

          <p>
            A related direction is <strong>ScientistOne</strong> by Meng et al. (2026), which puts verification at the center of the workflow. Instead of allowing the system to freely produce claims, every citation, number, method, and conclusion must be connected back to evidence. This makes the harness more auditable because the system is not only judged by whether the final answer sounds good, but by whether its reasoning chain can be traced to reliable sources.
          </p>
          <p>
            Another example is <strong>Autodata</strong> by Kulikov et al. (2026), which treats the agent as a data scientist for generating training and evaluation data. The workflow is organized around several roles: a challenger that creates problems, a weak solver, a strong solver, and a verifier or judge. The goal is to synthesize tasks that are neither too easy nor impossible. Ideally, the strong solver should pass while the weak solver fails, which creates data at the right difficulty level.
          </p>
          <p>
            The Autodata loop also updates the challenger prompt based on feedback from the solvers and verifier. However, one limitation is that the generated tasks are mainly used to improve weaker models rather than the strongest model in the loop. Because of this, the process looks less like full recursive self-improvement and more like a form of indirect distillation over a generated task distribution.
          </p>

          <figure>
            <img src="/assets/agent-harness-blog/08-difficulty-calibrated-data-generation.png" alt="Difficulty-calibrated data generation diagram">
            <figcaption>
              Figure 4. A difficulty-calibration loop for synthetic data generation, where useful tasks are those that separate weak and strong solvers.
            </figcaption>
          </figure>

          <p>
            The broader design space for agentic workflows is extremely large. This makes workflow design itself a search problem: rather than relying only on humans to handcraft workflows, we can use optimization algorithms to discover stronger designs.
          </p>
          <p>
            This is the motivation behind <strong>Automated Design of Agentic Systems</strong> by Hu et al. (2025). ADAS treats the design of agents as a meta-level optimization problem. It starts with a small archive of simple workflows, such as chain-of-thought or self-refinement agents. A meta-agent then proposes new workflow designs, writes them in code, critiques and revises them, evaluates their performance, and stores successful designs back into the archive. Over time, the archive becomes a growing library of agentic strategies discovered through search.
          </p>
          <p>
            A similar idea appears in <strong>AFlow</strong> by Zhang et al. (2025), but with a graph-based representation. In AFlow, an agentic workflow is represented as a graph: nodes are LLM actions, while edges define the logical control flow between them. The optimization process uses Monte Carlo Tree Search. Starting from an initial workflow template, the system selects promising candidates, asks an LLM to modify them based on evaluation feedback, tests the new version, and keeps it if it improves performance. The search continues until the score plateaus or the compute budget is reached.
          </p>

          <figure>
            <img src="/assets/agent-harness-blog/09-workflow-search-optimization.png" alt="Workflow search as optimization diagram">
            <figcaption>
              Figure 5. Workflow design as a search process, where a meta-agent proposes, implements, evaluates, and archives improved agent designs.
            </figcaption>
          </figure>

          <p>
            The key lesson from these systems is that workflow design is becoming a first-class research object. Early systems relied heavily on handcrafted pipelines, but newer approaches increasingly treat the workflow itself as something that can be searched, evaluated, mutated, and improved. This is especially important for auto-research, where the quality of the system depends not only on the base model, but also on the structure of the loop around it: how ideas are generated, how experiments are run, how evidence is checked, and how failures are fed back into the next iteration.
          </p>
        </section>

        <section id="key-principles">
          <h2>Key Principles of a Good Agent Harness</h2>
          <p>
            A good agent harness should make useful work easier than chaotic work. These are the principles I would start from when designing one.
          </p>
          <p>
            These principles are intentionally boring. That is a feature, not a weakness. Reliable agent systems are usually built from ordinary software engineering ideas applied very deliberately: typed boundaries, logging, testability, recovery, permissions, and state management. The novelty is that the "user" of many internal interfaces is now a model.
          </p>

          <div class="principle-grid">
            <div class="principle">
              <h3>Externalize state</h3>
              <p>Do not ask the model to remember the project. Store state in files, databases, memory stores, traces, plans, feature lists, and progress logs.</p>
            </div>
            <div class="principle">
              <h3>Make the application legible</h3>
              <p>Expose logs, screenshots, DOM state, database fixtures, tool traces, and metrics so the agent can observe behavior instead of guessing.</p>
            </div>
            <div class="principle">
              <h3>Use typed tools</h3>
              <p>Every tool should have a schema, permission level, result shape, error format, and audit trail. Tool calls are actions, not casual text.</p>
            </div>
            <div class="principle">
              <h3>Validate end to end</h3>
              <p>Unit tests are useful, but agents also need user-level checks: browser flows, document reviews, task completion, and realistic workflows.</p>
            </div>
            <div class="principle">
              <h3>Persist handoff evidence</h3>
              <p>Long-running work needs clean handoff artifacts: what changed, what passed, what failed, what remains, and how the next run should start.</p>
            </div>
            <div class="principle">
              <h3>Encode constraints mechanically</h3>
              <p>Architecture rules, permissions, lint checks, safety gates, and evals should enforce invariants instead of living only in instructions.</p>
            </div>
          </div>
          <p>
            The last point is probably the most underrated. Agents are good at following local patterns. That means they will also copy bad local patterns. If your codebase, workflow, or application has no mechanical boundary, the agent will slowly normalize whatever it sees. A harness should make the preferred path obvious and the dangerous path difficult.
          </p>
          <p>
            In practical terms, this means the harness should come with a product-specific constitution. Not a giant system prompt, but a set of executable rules: what tools require approval, what outputs need citations, what states are allowed to transition, what tests must pass, what files can be edited, what data can leave the boundary, and what must be escalated to a human.
          </p>
        </section>

        <section id="continuity">
          <h2>Continuity Artifacts for Long-Running Agents</h2>
          <p>
            The hardest agent tasks are not always the hardest reasoning tasks. Often they are the longest tasks. The agent has to work, stop, resume, and still know where it is. That requires continuity artifacts.
          </p>
          <p>
            The key pattern from the long-running-agent view is that each session should leave the next session in a better state. A future agent should not need to reconstruct the entire project from a transcript. It should be able to read the current feature list, progress notes, git history, failing tests, and setup instructions, then choose one next unit of work.
          </p>
          <p>
            This is where the initialization-versus-continuation pattern is especially useful. The first run should create the scaffolding that future runs depend on. It should not only start the app. It should write the setup script, define the feature list, create the progress file, and make the first clean checkpoint. After that, continuation runs should behave more like disciplined workers: read the state, choose one unfinished feature, test it, commit or persist the outcome, and update the handoff artifacts.
          </p>

          <figure>
            <img src="/assets/agent-harness-blog/03-continuity-artifacts.svg" alt="Continuity artifacts for long running agents diagram">
            <figcaption>
              Figure 6. Continuity should be externalized. A progress log, feature list, git history, and setup script let future agent runs start from evidence instead of guessing.
            </figcaption>
          </figure>

          <p>
            This matters outside coding too. A legal agent can persist the uploaded document, the current matter, the jurisdiction, reviewed clauses, unresolved risks, and user preferences. A customer-support agent can persist account context, the active ticket, tool calls already made, and policy references. A research agent can persist hypotheses, rejected experiments, scripts, and result tables.
          </p>
          <p>
            The principle is general: the harness should decide what must survive the context window.
          </p>
          <p>
            A continuity artifact should be precise enough that the next run can take action. "Made progress on the UI" is not useful. "Checkout flow opens, payment form renders, address validation fails for empty apartment field, next step is to fix `validateAddress` and rerun browser test `checkout_empty_apt`" is useful. The goal is not writing a diary. The goal is compressing the operational state of the work.
          </p>

          <h3>A Minimal Continuity Contract</h3>
          <pre><code>{
  "task_id": "contract_review_042",
  "current_goal": "Review indemnity and liability clauses",
  "completed": [
    "uploaded document indexed",
    "jurisdiction identified as California",
    "liability cap clause retrieved"
  ],
  "open_questions": [
    "whether limitation of liability conflicts with indemnity scope",
    "whether consequential damages exclusion is mutual"
  ],
  "last_validated_step": "retrieval returned sections 8.1, 8.2, and 12.4",
  "next_action": "run clause-risk workflow on retrieved sections",
  "handoff_notes": "Do not answer from general law until document clauses are cited."
}</code></pre>

          <p>
            This kind of object is more valuable than a loose chat summary because it separates completed work, open uncertainty, validation, and the next recommended action. The next agent can inspect it, challenge it, or continue from it.
          </p>
        </section>

        <section id="tool-use">
          <h2>Tool Use Is the Action Space</h2>
          <p>
            Tool use is where agent harnessing becomes real application engineering. Once an agent can call tools, it can affect the outside world. It can read documents, query a database, browse an interface, update a ticket, write a file, call an API, trigger a workflow, or send a message. That means tool use needs more structure than "the model asked for a function".
          </p>
          <p>
            In a mature harness, tools should sit behind a gateway. The gateway validates arguments, checks permissions, controls whether the action is read-only or state-changing, normalizes results, records an audit trail, and returns errors in a form the agent can reason about.
          </p>
          <p>
            This is one of the biggest differences between a toy agent and an application-layer agent. In a toy agent, tools are convenience functions. In a real harness, tools are governed interfaces. They are the action space of the system. If the tools are vague, unsafe, or inconsistent, the agent's behavior becomes vague, unsafe, and inconsistent too.
          </p>

          <figure>
            <img src="/assets/agent-harness-blog/04-tool-gateway.svg" alt="Tool gateway architecture diagram">
            <figcaption>
              Figure 7. The tool gateway is the boundary between model reasoning and real-world action. It handles schemas, permissions, execution, normalization, and audit logging.
            </figcaption>
          </figure>

          <p>
            The gateway should also separate read tools from write tools. Read tools gather evidence. Write tools change state. A good harness may allow the agent to freely call low-risk read tools, require confirmation for high-risk write tools, and block destructive tools unless a policy condition is satisfied.
          </p>
          <p>
            This is where many weak agents fail. They have tools, but the tools are too raw. The agent sees ambiguous errors, receives inconsistent output formats, or gets permission to do too much too early. The result is not real autonomy. It is unstructured automation.
          </p>
          <p>
            I like to divide tools into four classes. Observation tools gather state. Analysis tools transform state into a useful intermediate artifact. Proposal tools draft an action without committing it. Commit tools change the world. Most agent applications become safer when these classes are explicit. The agent can observe and analyze freely, propose with explanation, and commit only when policy allows it.
          </p>

          <table>
            <thead>
              <tr>
                <th>Tool class</th>
                <th>Purpose</th>
                <th>Example</th>
                <th>Default policy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Observation</td>
                <td>Read the environment.</td>
                <td>Retrieve document chunk, inspect ticket, open browser page.</td>
                <td>Usually allowed, but logged.</td>
              </tr>
              <tr>
                <td>Analysis</td>
                <td>Create intermediate reasoning artifacts.</td>
                <td>Classify clause risk, cluster failures, compare traces.</td>
                <td>Allowed if inputs are authorized.</td>
              </tr>
              <tr>
                <td>Proposal</td>
                <td>Prepare an action without applying it.</td>
                <td>Draft refund, draft contract redline, draft database migration.</td>
                <td>Allowed, requires user-visible explanation.</td>
              </tr>
              <tr>
                <td>Commit</td>
                <td>Change external state.</td>
                <td>Issue refund, send email, merge change, update record.</td>
                <td>Approval gated or verifier gated.</td>
              </tr>
            </tbody>
          </table>

          <h3>What a Good Tool Contract Includes</h3>
          <table>
            <thead>
              <tr>
                <th>Contract element</th>
                <th>Why it matters</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Typed schema</td>
                <td>Prevents vague or malformed actions.</td>
              </tr>
              <tr>
                <td>Permission tier</td>
                <td>Separates safe reads from risky writes.</td>
              </tr>
              <tr>
                <td>Idempotency rule</td>
                <td>Lets the harness retry safely when a call fails.</td>
              </tr>
              <tr>
                <td>Stable result shape</td>
                <td>Lets the agent compare results across calls.</td>
              </tr>
              <tr>
                <td>Error taxonomy</td>
                <td>Turns failures into recoverable information.</td>
              </tr>
              <tr>
                <td>Audit record</td>
                <td>Makes actions reviewable by humans and future agents.</td>
              </tr>
            </tbody>
          </table>
          <p>
            Tool output is just as important as tool input. If one tool returns free text, another returns partial JSON, and a third returns a stack trace, the model has to normalize the environment itself. That is wasted reasoning. A harness should normalize outputs into a stable shape with status, data, warnings, and recoverable error categories.
          </p>

          <pre><code>{
  "tool_name": "retrieve_document_chunks",
  "permission": "read",
  "input_schema": {
    "document_id": "string",
    "query": "string",
    "top_k": "integer"
  },
  "result_schema": {
    "status": "ok | no_match | permission_denied | error",
    "chunks": "array",
    "citations": "array",
    "warnings": "array"
  },
  "audit": {
    "record_input": true,
    "record_output_hash": true,
    "requires_human_approval": false
  }
}</code></pre>
        </section>

        <section id="architecture">
          <h2>Reference Architecture</h2>
          <p>
            A general-purpose agent harness can be designed as a set of application services around the model. The model can be swapped. The harness is the part that routes tasks, builds context, exposes tools, checks output, stores memory, and surfaces evidence.
          </p>
          <p>
            I would separate the architecture into six planes: task routing, context construction, agent runtime, tool mediation, verification, and memory or observability. Each plane should be owned by application code rather than hidden inside a monolithic prompt. This keeps the system debuggable.
          </p>

          <figure>
            <img src="/assets/agent-harness-blog/06-reference-architecture.svg" alt="Reference architecture for an agent harness">
            <figcaption>
              Figure 8. A platform-neutral reference architecture. The harness includes task routing, context building, tool mediation, verification, observability, memory, and application integrations.
            </figcaption>
          </figure>

          <h3>The Main Components</h3>
          <p>
            <strong>Task router.</strong> The router classifies what kind of job this is. Is it a document review, a support ticket, a code change, a data analysis request, or a workflow action? It also estimates risk. A low-risk explanation task and a high-risk account update should not use the same policy.
          </p>
          <p>
            <strong>Context builder.</strong> The context builder decides what the model should see. It retrieves documents, memory, logs, database rows, policy snippets, and prior decisions. The goal is not to stuff everything into context. The goal is to construct the smallest context that is sufficient for the current step.
          </p>
          <p>
            <strong>Agent runtime.</strong> This is where model calls happen. The runtime may ask the model to plan, choose a tool, summarize evidence, generate a candidate answer, or revise after validation. It should not be allowed to bypass the harness.
          </p>
          <p>
            <strong>Tool gateway.</strong> This mediates all action. Tools should be typed, permissioned, logged, and normalized. For risky tools, the gateway can require human confirmation or a separate verifier.
          </p>
          <p>
            <strong>Verifier.</strong> The verifier checks whether the work satisfies the task. Depending on the domain, this may be tests, browser automation, a rubric, a policy check, a consistency check, a quote-grounding check, or human review.
          </p>
          <p>
            <strong>Memory and artifacts.</strong> The memory layer stores what should survive. This may include user preferences, active matter state, unresolved tasks, experiment results, known failures, generated plans, or tool traces.
          </p>
          <p>
            <strong>Observability.</strong> A good harness produces traces. You should be able to answer: what did the agent see, what did it decide, what tool did it call, what came back, what check passed, what failed, and what changed?
          </p>
          <p>
            Notice what is missing from this architecture: there is no assumption that the agent is one specific product. The model runtime could be any strong language model. The harness is the durable part. It is where the product workflow, risk model, data access rules, evaluation logic, and memory format live.
          </p>

          <h3>Three Example Harnesses</h3>
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>State</th>
                <th>Tools</th>
                <th>Verifier</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Legal document assistant</td>
                <td>Document, jurisdiction, matter history, user risk tolerance.</td>
                <td>Clause retrieval, citation extraction, risk rubric, redline draft.</td>
                <td>Grounding check, missing-clause check, legal disclaimer policy.</td>
              </tr>
              <tr>
                <td>Customer-support agent</td>
                <td>User account, active ticket, policy docs, prior tool calls.</td>
                <td>Inspect order, retrieve policy, draft refund, update ticket.</td>
                <td>Authentication check, policy compliance, write-action confirmation.</td>
              </tr>
              <tr>
                <td>Research agent</td>
                <td>Hypotheses, datasets, scripts, experiment logs, result tables.</td>
                <td>Run experiment, plot results, inspect failures, write report.</td>
                <td>Reproducibility check, heldout eval, regression comparison.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="evaluation">
          <h2>Evaluation Is the Reward Signal</h2>
          <p>
            If the harness is the environment, evaluation is the reward signal. But in real applications, the reward should rarely be one number. A useful agent needs layered feedback.
          </p>
          <p>
            Fast checks catch cheap mistakes: syntax, types, formatting, schema compliance. Integration checks catch tool and data problems. User-level checks catch whether the workflow actually functions. Outcome checks catch whether the result was useful, safe, and non-regressive.
          </p>

          <figure>
            <img src="/assets/agent-harness-blog/05-evaluation-stack.svg" alt="Evaluation stack for agent harnesses">
            <figcaption>
              Figure 9. Evaluation should be layered. The harness should turn failures into new checks, docs, constraints, or test cases.
            </figcaption>
          </figure>

          <p>
            This is why an agent harness should not only run tests after the agent finishes. It should use evaluation throughout the loop. Before acting, it can check whether the context is sufficient. After tool use, it can check whether the observation answered the question. Before final output, it can check grounding, policy, formatting, and user-facing quality. After deployment, it can use real failures to expand the regression suite.
          </p>
          <p>
            The most important evaluation habit is turning failures into harness changes. If the agent repeatedly answers without citing the uploaded document, do not only tell it "please cite the document." Add a grounding verifier that rejects uncited claims. If the agent repeatedly calls a write tool too early, do not only add a warning to the prompt. Add a permission gate that requires the right preconditions before the tool can execute.
          </p>
          <p>
            This is where harness engineering becomes a compounding process. Every serious failure should leave behind an artifact: a new test, a new verifier rule, a new tool constraint, a clearer state field, or a better handoff note. The system should get harder to fool over time.
          </p>

          <pre><code>failure observed
  -> classify the failure
  -> decide whether it is a model issue or harness issue
  -> add a general check or constraint
  -> rerun the task and nearby tasks
  -> keep the change only if it reduces failures without blocking valid work</code></pre>
        </section>

        <section id="harness-in-rl">
          <h2>When the Harness Becomes the RL Environment</h2>
          <p>
            The next step is the one I find most interesting: once a harness defines state, actions, tools, traces, and evaluation, it starts to look like an RL environment. This does not mean every application harness should immediately become a training system. It means the same design choices that make an agent useful at test time also make it possible to collect better training data later.
          </p>
          <p>
            The Polar paper makes this point very directly. It argues that agentic RL increasingly depends on custom harnesses: coding harnesses, browser harnesses, operating-system harnesses, multi-agent harnesses, and long-running tool-use systems. These harnesses are not simple Gym environments. They are complex software products with their own context management, tool formats, runtime setup, evaluation logic, and action protocols.
          </p>
          <p>
            The key idea in Polar is to avoid rewriting the harness into an RL framework. Instead, keep the native harness running as-is and observe it at the model API boundary. Every LLM agent eventually calls a model endpoint. If a proxy sits at that boundary, it can record prompts, sampled tokens, log probabilities, tool definitions, responses, and metadata while returning the same provider-shaped response the harness expects.
          </p>
          <p>
            This changes how I think about application-layer harnesses. A good harness is not only a deployment wrapper. It can become the place where rollouts are generated, rewards are assigned, failures are logged, and future post-training data is collected.
          </p>

          <pre><code>native application harness
  -> model API proxy
  -> token-level capture
  -> trajectory reconstruction
  -> evaluator reward
  -> RL or SFT trainer
  -> updated model
  -> same native harness</code></pre>

          <h3>Why This Is Relevant to Application-Layer Harnesses</h3>
          <p>
            If you build a legal assistant, a support agent, or a research agent, your harness already contains the real environment. It knows how documents are retrieved, how tools are called, how state changes, and what a successful task looks like. Throwing that away and building a separate toy RL environment can lose the very behavior you care about.
          </p>
          <p>
            The better direction is to make the production-style harness observable enough that it can also support training. The application harness remains product-native, but it emits the artifacts needed for learning: traces, tool calls, verifier outputs, rewards, and provenance.
          </p>

          <table>
            <thead>
              <tr>
                <th>Application harness concept</th>
                <th>RL environment equivalent</th>
                <th>What to record</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Task state</td>
                <td>Observation</td>
                <td>Prompt, retrieved context, memory, tool history, environment metadata.</td>
              </tr>
              <tr>
                <td>Tool gateway</td>
                <td>Action space</td>
                <td>Tool name, arguments, permission tier, result, error category.</td>
              </tr>
              <tr>
                <td>Application transition</td>
                <td>State transition</td>
                <td>New document state, ticket update, patch, browser state, database change.</td>
              </tr>
              <tr>
                <td>Verifier</td>
                <td>Reward function</td>
                <td>Pass/fail, rubric score, test result, policy violation, human approval.</td>
              </tr>
              <tr>
                <td>Trace store</td>
                <td>Replay buffer or training corpus</td>
                <td>Token IDs, logprobs, messages, loss masks, rewards, provenance.</td>
              </tr>
            </tbody>
          </table>

          <h3>How to Do Harness-Based RL Well</h3>
          <p>
            First, keep the harness native. The agent should train on the same action protocol it will use at evaluation or deployment time. If the model must learn a specific tool schema, patch-submission style, browser workflow, document-retrieval format, or memory policy, then the rollout should happen inside that real harness rather than a simplified imitation.
          </p>
          <p>
            Second, instrument the boundaries. At minimum, capture model calls, tool calls, verifier outputs, task IDs, session IDs, policy version, and runtime metadata. The model-call boundary matters because RL updates need to know which tokens were actually sampled by the behavior policy. A plain transcript is not enough.
          </p>
          <p>
            Third, preserve token fidelity. Polar emphasizes this because decoding and re-tokenizing a conversation can produce token IDs that do not match the original generation. For RL, that is not a small formatting bug. The gradient is attached to tokens. A training trace should know which tokens came from the sampled assistant response, which tokens were prompt/context tokens, and which tokens should be masked out.
          </p>

          <pre><code>{
  "session_id": "legal-agent-rollout-018",
  "task_id": "contract-risk-review-042",
  "prompt_ids": ["..."],
  "response_ids": ["..."],
  "loss_mask": [1, 1, 1, 0, 0],
  "response_logprobs": ["..."],
  "tool_calls": [
    {
      "name": "retrieve_clause",
      "arguments": {"clause_type": "indemnity"},
      "status": "ok"
    }
  ],
  "reward": 1.0,
  "reward_source": "grounded_clause_risk_verifier",
  "metadata": {
    "harness": "legal_review_harness",
    "policy_version": "v7",
    "builder": "prefix_merging"
  }
}</code></pre>

          <p>
            Fourth, separate rollout from training. Long agent runs are slow and uneven. Some tasks finish quickly. Others spend time installing dependencies, opening browsers, running tests, or waiting on tools. A scalable design treats rollout as a service: submit tasks, execute sessions asynchronously, reconstruct trajectories after the run, evaluate them, and let the trainer consume completed batches.
          </p>
          <p>
            Fifth, be careful with credit assignment. A whole-session reward is easy to compute. For example, did the final patch pass tests? Did the contract answer cite the right clauses? Did the support workflow resolve the ticket without policy violation? But assigning that reward to every tiny model call can be noisy. Polar reports that naive request-level outcome reward broadcasting can create reward-hacking behavior. The lesson is that harness-level rewards are powerful, but they need grouping, normalization, process rewards, or careful trajectory construction.
          </p>
          <p>
            Sixth, separate training evidence from evaluation evidence. If the harness learns from every failure in the evaluation set, the score stops meaning what you think it means. The clean setup is: training rollouts generate improvement data, development rollouts shape the harness and reward function, and held-out evaluation rollouts measure whether the agent actually generalized.
          </p>

          <h3>What Polar Shows</h3>
          <p>
            Polar trained the same Qwen3.5-4B base model with GRPO through several coding harnesses and reported improvements on SWE-Bench Verified. The biggest jump was under an unfamiliar harness protocol, where the base model scored 3.8% and the Polar-trained model reached 26.4%. Other harnesses improved more modestly, such as 29.8% to 34.6%, 34.6% to 35.2%, and 34.2% to 40.4%.
          </p>
          <p>
            The exact numbers are less important than the systems lesson: the model was optimized on the behavior it actually needed to perform inside the harness. It was not trained on a generic chat transcript and then expected to magically adapt to a tool protocol at test time. The harness was the environment.
          </p>
          <p>
            Polar also shows why trajectory construction matters. A per-request strategy keeps each model completion separate, which is conservative but can fragment a long session into many tiny traces. A prefix-merging strategy reconstructs longer append-only chains when the token prefixes prove that the conversation continued naturally, while separating compaction, subagents, and independent branches. That kind of detail matters if you want the training signal to match the actual agent behavior.
          </p>

          <h3>The Practical Takeaway</h3>
          <p>
            Even if you are not training a model today, design the harness as if you may want to learn from it later. Give every task a session ID. Log model calls. Log tool calls. Store verifier outputs. Keep clear train/dev/eval splits. Preserve enough provenance to know which model, prompt, tools, memory, and runtime produced the outcome.
          </p>
          <p>
            This is why harnessing belongs in the application layer. The application layer knows the real task. It knows the real tools. It knows what success means. If that layer is designed well, it becomes both the runtime for the agent and the data engine for improving the agent.
          </p>
        </section>

        <section id="building">
          <h2>How to Build a Good Agent Harness</h2>
          <p>
            A good harness starts from a narrow domain. Do not begin with "an agent that can do everything." Begin with a workflow that has real tasks, observable state, available tools, and measurable success.
          </p>

          <h3>Start with the task boundary</h3>
          <p>
            Define what the agent is responsible for and what it is not responsible for. A legal document assistant may explain clauses and flag risks, but not provide final legal advice. A support agent may draft actions, but require confirmation before refunds or account changes. A coding agent may modify a branch, but not deploy to production without review.
          </p>
          <p>
            The task boundary should be written like an operational contract. It should include allowed tasks, forbidden tasks, escalation triggers, and success criteria. Without this contract, the model has to infer the boundary from tone. That is how systems drift from "summarize this contract" to "decide whether the user should sign it" without anyone noticing.
          </p>

          <h3>Define the state model</h3>
          <p>
            Decide what the agent needs to observe. This may include user message, active document, user account, current ticket, environment status, prior memories, open tasks, and relevant policies. Represent this state explicitly. The state object is the agent's map.
          </p>
          <p>
            A weak harness throws all available context into the model and hopes the model sorts it out. A stronger harness separates state into typed fields. Some fields are user-visible. Some are internal. Some are retrieved. Some are trusted. Some are untrusted. That distinction matters because the agent should not treat a user-uploaded contract, a system policy, and a retrieved memory with the same authority.
          </p>

          <pre><code>{
  "task": {
    "id": "support_1182",
    "type": "refund_request",
    "risk": "medium",
    "status": "in_progress"
  },
  "authority": {
    "system_policy": ["refund_policy_v3"],
    "user_provided": ["message_1", "receipt_upload"],
    "retrieved_memory": ["previous_shipping_issue"]
  },
  "observations": {
    "account_verified": true,
    "order_status": "delivered",
    "refund_window_days_remaining": 4
  },
  "open_questions": [
    "whether item condition qualifies for immediate refund"
  ]
}</code></pre>

          <h3>Design the tool registry</h3>
          <p>
            List the tools the agent can use. For each tool, define schema, permissions, execution mode, output shape, failure modes, and audit fields. Make the tool registry part of the application, not a pile of ad hoc functions.
          </p>
          <p>
            The tool registry should be boring enough that a reviewer can inspect it. For each tool, ask: is it read-only or state-changing? Can it be retried? Does it expose private data? Does it require user confirmation? What is the maximum blast radius? What should the agent do if it fails? These are product questions as much as engineering questions.
          </p>

          <h3>Add verification before autonomy</h3>
          <p>
            The more autonomy you give the agent, the stronger verification must be. A harness that cannot detect failure should not grant high-impact actions. Start read-only, then add low-risk writes, then add approval-gated writes, then consider higher autonomy only after the eval stack is stable.
          </p>
          <p>
            In practice, this creates an autonomy ladder. At the bottom, the agent only drafts. Then it can retrieve. Then it can propose structured actions. Then it can execute low-risk actions with checks. Only later should it execute high-impact actions. Each level needs a stronger verifier than the level before it.
          </p>

          <h3>Persist progress and failures</h3>
          <p>
            Every meaningful run should leave artifacts. Store what the agent attempted, what tools it called, what checks passed, what failed, and what should happen next. These artifacts are not just logs. They are the memory of the system.
          </p>
          <p>
            This is especially important for long-running tasks. The agent should not only report the final answer. It should leave a trace of the path: retrieved sources, rejected options, verifier outputs, human approvals, and remaining uncertainties. That trace is what makes the system debuggable after the fact.
          </p>

          <pre><code>def run_agent_task(task):
    state = load_state(task)
    policy = route_task(task, state)
    context = build_context(task, state, policy)

    while not budget_exhausted(task):
        decision = agent_runtime.plan(context, policy)

        if decision.type == "final_answer":
            verdict = verify_answer(decision.output, state, policy)
            if verdict.passed:
                persist_result(task, decision.output, verdict)
                return decision.output
            context = add_feedback(context, verdict)
            continue

        tool_call = tool_gateway.validate(decision.tool_call, policy)
        observation = tool_gateway.execute(tool_call)
        record_trace(task, decision, observation)
        context = update_context(context, observation)

    escalate_to_human(task, context)</code></pre>

          <p>
            This pseudocode is intentionally plain. The important part is not the model provider. The important part is the structure: route, ground, act through a gateway, validate, record, and escalate when the harness does not have enough confidence.
          </p>
          <p>
            One useful implementation detail is to keep the model-facing context different from the full internal state. The model does not need every database field. It needs a compact, authority-aware view of the relevant state. The harness can keep the full state internally and expose only the slice needed for the next decision.
          </p>
        </section>

        <section id="common-failures">
          <h2>Common Failure Modes</h2>
          <p>
            Weak harnesses often fail in predictable ways.
          </p>
          <table>
            <thead>
              <tr>
                <th>Failure mode</th>
                <th>What it looks like</th>
                <th>Harness fix</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Invisible state</td>
                <td>The agent guesses instead of inspecting the real system.</td>
                <td>Add observable state, retrieval, logs, and tool traces.</td>
              </tr>
              <tr>
                <td>Raw tools</td>
                <td>The agent receives inconsistent outputs or too much power.</td>
                <td>Add schemas, permission tiers, result normalization, and audit logs.</td>
              </tr>
              <tr>
                <td>Premature success</td>
                <td>The agent declares completion after a shallow check.</td>
                <td>Add acceptance criteria and end-to-end validation.</td>
              </tr>
              <tr>
                <td>Context drift</td>
                <td>The agent forgets earlier decisions or repeats old work.</td>
                <td>Persist progress, plans, feature lists, and memory artifacts.</td>
              </tr>
              <tr>
                <td>Architecture drift</td>
                <td>Fast changes slowly violate design constraints.</td>
                <td>Use mechanical checks, lint rules, dependency rules, and review gates.</td>
              </tr>
              <tr>
                <td>Authority confusion</td>
                <td>The agent treats user text, memory, and policy as equally authoritative.</td>
                <td>Label context by source and authority level.</td>
              </tr>
              <tr>
                <td>Weak recovery</td>
                <td>The agent retries the same failed action without changing strategy.</td>
                <td>Use typed error categories and recovery policies.</td>
              </tr>
              <tr>
                <td>Overloaded context</td>
                <td>The agent receives too much information and misses the relevant part.</td>
                <td>Use retrieval, summarization, and step-specific context construction.</td>
              </tr>
            </tbody>
          </table>
          <p>
            The pattern underneath most of these failures is the same: the model is being asked to compensate for missing application structure. That is sometimes fine for a prototype. It is not fine for a system that is supposed to run repeatedly, handle real users, or take actions with consequences.
          </p>
        </section>

        <section id="maturity-ladder">
          <h2>A Maturity Ladder for Agent Harnesses</h2>
          <p>
            Not every project needs the full harness on day one. The better way to think about it is maturity. A prototype can begin with a simple tool loop, but a production workflow should climb toward stronger state, observability, validation, and recovery.
          </p>
          <table>
            <thead>
              <tr>
                <th>Level</th>
                <th>Harness capability</th>
                <th>What changes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0</td>
                <td>Prompted assistant</td>
                <td>The model answers directly. No durable state, weak validation.</td>
              </tr>
              <tr>
                <td>1</td>
                <td>Tool-using assistant</td>
                <td>The model can call read tools, but tool outputs are still lightly structured.</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Structured harness</td>
                <td>Tasks, tools, memory, and outputs have schemas. Actions are logged.</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Validated harness</td>
                <td>Verifier gates check grounding, policy, tests, and workflow completion.</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Recoverable harness</td>
                <td>The system can resume across sessions and turn failures into new constraints.</td>
              </tr>
              <tr>
                <td>5</td>
                <td>Learning harness</td>
                <td>Failure analysis continuously improves retrieval, tools, evals, and policies.</td>
              </tr>
            </tbody>
          </table>
          <p>
            Most serious applications should aim for at least level three. Below that, the agent may be useful, but it is difficult to trust. The system can produce plausible outputs, yet the application has no strong way to know whether the output was grounded, safe, or complete.
          </p>
        </section>

        <section id="application-layer">
          <h2>The Application Layer Mindset</h2>
          <p>
            The most important shift is to stop thinking of agent engineering as "which model should answer this prompt?" and start thinking of it as "what application layer lets an agent do this workflow safely and verifiably?"
          </p>
          <p>
            That application layer is where product knowledge lives. It is where documents are indexed, permissions are enforced, business rules are encoded, memory is retrieved, state is observed, tools are called, and outcomes are measured. The model is still central, but it is not alone.
          </p>
          <p>
            This mindset changes how you design AI products. You stop asking the model to be the entire product. Instead, you build a product around the model. The model becomes a reasoning component inside a larger system that has its own state, policies, tests, and responsibilities.
          </p>
          <p>
            This also makes the system more portable. If the harness is clean, you can change models, change tool implementations, or add evals without rewriting the entire agent. The harness becomes the durable engineering asset.
          </p>
          <p>
            In that sense, agent harnessing is not just a pattern for coding agents or any single provider's product. It is a general architecture for building AI applications that need to reason, act, recover, and improve over time.
          </p>
          <p>
            The best harnesses feel almost mundane when you inspect them: a clear task object, a small set of typed tools, a context builder, a verifier, a memory store, logs, and a failure loop. The sophistication comes from how these pieces interact. The model supplies flexible reasoning, but the harness supplies discipline.
          </p>
        </section>

        <section id="conclusion">
          <h2>Conclusion</h2>
          <p>
            Agent harnessing is the discipline of building the environment around an agent. A good harness gives the agent structured state, typed tools, durable memory, clear constraints, layered evaluation, and observable feedback.
          </p>
          <p>
            The core idea is that autonomy is not produced by a prompt alone. Autonomy is produced by a system that lets the agent perceive the right state, take bounded actions, learn from validation, and leave evidence for future work.
          </p>
          <p>
            This is why I find the harness framing more useful than simply talking about agents. "Agent" names the behavior we want. "Harness" names the engineering work required to make that behavior reliable. It gives us a place to put state, tools, tests, memory, policies, and observability.
          </p>
          <p>
            The future of agentic applications will not be only about larger models. It will be about better harnesses: application layers that make agents legible, useful, and safe enough to work on real tasks.
          </p>
        </section>

        <section id="references">
          <h2>References</h2>
          <div class="reference-list">
            <p>Anthropic. 2025. "Effective harnesses for long-running agents." Anthropic Engineering, 26 November. Available at: <a href="https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents">https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents</a>.</p>
            <p>OpenAI. 2026. "Harness engineering: leveraging Codex in an agent-first world." OpenAI, 11 February. Available at: <a href="https://openai.com/index/harness-engineering/">https://openai.com/index/harness-engineering/</a>.</p>
            <p>Lu, C. et al. 2026. "Towards end-to-end automation of AI research." Nature. Available at: <a href="https://www.nature.com/articles/s41586-026-10265-5">https://www.nature.com/articles/s41586-026-10265-5</a>.</p>
            <p>Meng, R. et al. 2026. "ScientistOne: Towards Human-Level Autonomous Research via Chain-of-Evidence." arXiv:2605.26340. Available at: <a href="https://arxiv.org/abs/2605.26340">https://arxiv.org/abs/2605.26340</a>.</p>
            <p>Kulikov, I. et al. 2026. "Autodata: An agentic data scientist to create high quality synthetic data." arXiv:2606.25996. Available at: <a href="https://arxiv.org/abs/2606.25996">https://arxiv.org/abs/2606.25996</a>.</p>
            <p>Hu, S., Lu, C. and Clune, J. 2025. "Automated Design of Agentic Systems." ICLR 2025. Available at: <a href="https://arxiv.org/abs/2408.08435">https://arxiv.org/abs/2408.08435</a>.</p>
            <p>Zhang, J. et al. 2025. "AFlow: Automating Agentic Workflow Generation." ICLR 2025. Available at: <a href="https://arxiv.org/abs/2410.10762">https://arxiv.org/abs/2410.10762</a>.</p>
            <p>Xu, B., Zhang, H., Zhang, S., Han, S., Liu, M., Hu, J., Diao, S., Jin, Z., Zou, Y., Demoret, M., Kautz, J. and Dong, Y. 2026. "Polar: Agentic RL on Any Harness at Scale." arXiv:2605.24220v1. Available at: <a href="https://arxiv.org/abs/2605.24220">https://arxiv.org/abs/2605.24220</a>.</p>
          </div>
        </section>
    </div>
        <aside class="toc" aria-label="Table of contents">
          <strong>Contents</strong>
          <a href="#what-is-agent-harnessing">What Is Agent Harnessing?</a>
          <a href="#why-prompting-is-not-enough">Why Prompting Is Not Enough</a>
          <a href="#what-the-source-posts-add">What the Source Posts Add</a>
          <a href="#control-loop">The Control Loop</a>
          <a href="#workflow-design">Workflow Design</a>
          <a href="#key-principles">Key Principles</a>
          <a href="#continuity">Continuity Artifacts</a>
          <a href="#tool-use">Tool Use</a>
          <a href="#architecture">Reference Architecture</a>
          <a href="#evaluation">Evaluation</a>
          <a href="#harness-in-rl">Harness in RL</a>
          <a href="#building">How to Build It</a>
          <a href="#common-failures">Failure Modes</a>
          <a href="#maturity-ladder">Maturity Ladder</a>
          <a href="#application-layer">Application Layer</a>
          <a href="#references">References</a>
        </aside>
  </div>
</div>
