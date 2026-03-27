---
title: "Let's Talk AI Agents"
date: 2025-06-16
layout: blog
---

## Let's Talk AI Agents

The year 2024 marked a turning point for AI, dominated by Retrieval-Augmented Generation (RAG). With groundbreaking models like GPT-4o, Claude-3.5-Sonnet, and Llama 3.1 widely available for adoption, the industry raced to harness ever-larger language models for enterprise use cases. Yet a critical question lingered:

### How do we transform these models into adaptable tools that deliver real-world business value?

At Taqriry, we've grappled with the same challenge: how to move beyond static AI summaries and build systems that truly support dynamic, real-world business needs. Early on, we explored sophisticated retrieval-augmented generation (RAG) pipelines to ground generative AI outputs in customer-specific data. These systems helped:

- Streamline meeting workflows
- Automate documentation
- Surface valuable insights

But as powerful as they were, they remained constrained — limited to predefined tasks and unable to adapt to the evolving context of real business conversations.

By late 2024, a new paradigm took shape: **agentic AI**. Industry leaders like Andrew Ng began championing this shift, and it was spotlighted in Deloitte's 2024 State of Generative AI Report. At Taqriry, we embraced this evolution — reimagining our AI not just as a summarizer, but as an autonomous assistant capable of:

- Reasoning independently across complex workflows
- Acting on multi-turn conversational logic
- Collaborating fluidly across unscripted meeting dynamics

For enterprise users, this shift represents a leap — from static outputs to intelligent, action-ready collaboration.

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;">
  <iframe src="https://www.youtube.com/embed/KrRD7r7y7NY" frameborder="0" allowfullscreen
    style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
</div>

In this article, we'll dissect the architecture of modern AI agents, exploring:

- **Core principles** separating agents from traditional RAG systems
- **Emerging design patterns** reshaping enterprise AI strategies
- **Real-world applications** of agents across industries
- **Critical considerations** for building robust, ethical agentic workflows

---

## What is an LLM Agent? An AI Industry Perspective

While definitions vary, AI agents share a core trait: **autonomy**. Unlike traditional AI systems that follow rigid workflows, agents dynamically perceive, reason, plan, and act to achieve goals with minimal human intervention. Let's dissect this through the lens of key players in foundation models and LLM orchestration:

- **OpenAI:** Defines agentic AI systems as the ability to take actions towards a specified goal autonomously without having to be explicitly programmed. They liken agents to Samantha from *Her* and HAL 9000 from *2001: A Space Odyssey* — coining the term **Agenticness** as their metric for an AI's ability to self-direct without explicit instructions.

- **Google:** Emphasizes tool-wielding problem-solvers — agents that observe environments (data streams, APIs) and act using available resources.

- **Anthropic:** Views agents as systems that are either architected as **workflows** (where LLMs and tools are integrated through predefined logic) or as **dynamic systems** in which LLMs make their own decisions with a certain degree of autonomy.

- **LangChain:** Views agents in a more technical light, as a system that uses an LLM to decide how an application should flow. LangChain's perspective argues that agent capabilities can be viewed as a spectrum — from a simple **State Machine** to a full-fledged **Autonomous System**.

- **LlamaIndex:** Describes agents as an "automated reasoning and decision engine" that make internal decisions to solve tasks.

- **CrewAI:** Defines agents as pieces of software that autonomously take decisions towards accomplishing a goal.

> **The Big Picture:** Definitions stretch from sci-fi aspirations (OpenAI's Samantha) to pragmatic tooling (LangChain). What unites them? A shared focus on shifting AI from rigid "do what I say" executors to adaptive "figure it out" collaborators.

### Key Takeaway: Agents = LLMs + Tools + Decision-Making Loops.

Although we've observed a paradigm shift from RAG to AI agents, it's important to recognize that these applications of LLMs are not mutually exclusive. In fact, **Agentic RAG** serves as a prime example of integrating agents within the RAG framework.

![Agentic RAG diagram — how autonomous decision-making layers on top of traditional one-shot retrieval for richer, iterative retrieval strategies](https://static.wixstatic.com/media/ffcc74_f5c5a7f43f7947659bffd333822bfb15~mv2.webp/v1/fill/w_586,h_293,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/ffcc74_f5c5a7f43f7947659bffd333822bfb15~mv2.webp)

Unlike traditional RAG, which follows a one-shot retrieval and response process, Agentic RAG introduces **reasoning** and **autonomous decision-making**, enabling more adaptive and iterative retrieval strategies for improved outcomes.

---

## Common Agentic Design Patterns

When developing software, it is essential to understand widely adopted design patterns that enhance scalability, maintainability, and efficiency. Similarly, in AI, building new models requires a solid grasp of common architectural designs, core components, and optimization techniques.

The same principles apply to agent-based systems. To create effective and interpretable agentic AI workflows, it is crucial to explore various agent design patterns. These patterns act as building blocks, enabling systems that are:

| Principle | How Patterns Enable It | Example |
|---|---|---|
| **Modularity** | Patterns represent reusable modules (e.g., a "reflection" module for self-correction). | Swap a symptom-classifier agent in a medical system without disrupting the diagnosis workflow. |
| **Scalability** | Patterns compose hierarchically (e.g., planning agents orchestrating sub-agents). | Scale a customer service system from handling 10 to 10,000 queries by adding parallel agents. |
| **Interpretability** | Clear patterns map to human-understandable processes. | Audit why a financial agent rejected a loan by tracing its decision process. |
| **Flexibility** | Mix and match models/tools (e.g., GPT-4 for creativity, Claude for safety checks). | Deploy a coding agent with Claude-3.5-Sonnet for syntax and OpenAI's o1 for high-level design. |

> ⚠️ The following design patterns discussed are not meant to be exhaustive but rather serve as a starting point for understanding the diverse landscape of agentic AI systems.

---

## Reflection

When we think of reflection, we often associate it with introspection or self-awareness. Similarly, in AI agents, reflection refers to the ability to analyze actions, decisions, and outcomes to improve future performance.

> **Reflection:** Enhances an agent's reasoning through iterative self-analysis and self-correction.

This process is critical in scenarios requiring alignment with rules or learning from mistakes. For example, a content generation agent might:

- Draft text
- Analyze it against marketing guidelines (e.g., compliance with regulations)
- Detect mismatches
- Iteratively revise until alignment is achieved

Unlike static systems, reflection agents adapt dynamically, turning past errors into opportunities for refinement.

### Basic Reflection

![Basic Reflection feedback loop — the agent generates an output, analyzes it against objectives, and iteratively refines until the target criteria are met](https://static.wixstatic.com/media/ffcc74_4b17643523cc4fa7b10cfd4696048c49~mv2.png/v1/fill/w_586,h_300,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_4b17643523cc4fa7b10cfd4696048c49~mv2.png)

The basic design pattern for reflection involves a feedback loop: the agent analyzes its actions and outcomes to refine future decisions. The reflection process can range from simple to complex:

- **Simple:** A customer service agent compares generated text against a set of rules (e.g., avoiding offensive language) encoded in the original query and revises its response.
- **Complex:** A financial trading agent analyzes market trends, historical trades, and news sentiment to identify patterns and adjust its strategy.

While implementations vary, the core idea is to **iterate until the desired outcome is achieved**. Each cycle allows the agent to incorporate new insights, reducing errors and improving alignment with goals.

> We'll explore advanced implementations of this concept (like Reflexion, which integrates tool usage) in the next pattern.

### Reflexion

![Reflexion pattern — extends basic reflection by introducing external tool validation into the feedback loop, grounding decisions in objective data sources to reduce bias and improve accuracy](https://static.wixstatic.com/media/ffcc74_cd8a11f2c73b4ea3b219ba9f345a177b~mv2.png/v1/fill/w_586,h_526,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_cd8a11f2c73b4ea3b219ba9f345a177b~mv2.png)

Reflexion enhances basic reflection by integrating external tools into the feedback loop. These tools act as objective validators, providing additional context (e.g., data, rules, domain-specific knowledge) to critique and verify the agent's decisions. Think of it as consulting a trusted advisor or reference material for a second opinion.

> **Core Idea:** Reflexion agents explicitly critique their own decisions and ground responses in external validations or data, ensuring objectivity and reducing bias.

> ℹ️ As I may be providing an oversimplified explanation of the pattern, please refer to the original paper for deeper insights.

**Example Workflow:**

- A medical diagnosis agent generates a list of potential conditions based on symptoms.
- It consults a clinical database to cross-validate recommended treatments against the patient's medical history.
- If conflicts arise (e.g., a drug allergy), the agent revises its recommendations iteratively until alignment is achieved.

Basic reflection and reflexion patterns form the foundation for agents to self-correct and improve over time. Other advanced design paradigms — rooted in the same principles of iterative analysis — address even more complex challenges:

- **Language Agent Tree Search (LATS):** Combines reflection with tree-search algorithms (like those used in game-playing AI) to simulate and evaluate multiple reasoning paths before committing to a final decision.
- **Multi-Agent Debate:** Enables multiple AI agents to critique each other's outputs iteratively, refining solutions through structured "discussion."

To dive deeper into these patterns, I recommend watching this insightful video on "Reflection Agents" by LangChain:

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;">
  <iframe src="https://www.youtube.com/embed/v5ymBTXNqtk" frameborder="0" allowfullscreen
    style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
</div>

---

## Tool Use

![Tool use architecture — shows how agents connect LLMs to external APIs, databases, and validators, transforming static knowledge repositories into dynamic, context-aware problem-solvers](https://static.wixstatic.com/media/ffcc74_72155f0e3f0f41b8bb8eae36beab801e~mv2.png/v1/fill/w_586,h_297,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_72155f0e3f0f41b8bb8eae36beab801e~mv2.png)

While modern LLMs demonstrate impressive reasoning capabilities, their true power in real-world applications often lies in integrating external tools to overcome inherent limitations.

### Why Tools Matter:

- **Access to Proprietary/Private Data:** LLMs lack knowledge of internal company data (e.g., CRM records, proprietary research). Tools like database connectors or APIs let agents retrieve this information dynamically.
- **Real-Time Updates:** LLMs are frozen in time post-training. Tools like web search APIs or live data feeds enable agents to incorporate current events, stock prices, or weather forecasts.
- **Domain-Specific Validation:** Tools like code compilers, fact-checking databases, or compliance validators ensure outputs meet technical or regulatory standards.

**Example Workflows:**

- **Customer Service Agent:**
  - *Problem:* An LLM might misstate a user's order history if trained on generic data.
  - *Solution:* Integrate a tool to query the company's internal database, enabling personalized, accurate responses.

- **Financial Analyst Agent:**
  - *Problem:* An LLM can't natively track real-time market shifts.
  - *Solution:* Use a stock market API to fetch live data, then analyze trends to recommend portfolio adjustments.

> **Tool use transforms LLMs from static knowledge repositories into dynamic problem-solvers capable of context-aware, up-to-date reasoning.**

While tool integration isn't new (e.g., RAG uses databases to fetch context for responses), agents take tool usage a step further:

| | RAG | Agents |
|---|---|---|
| **Role of Tools** | Tools retrieve information to inform a response. | Tools drive decision-making during reasoning (e.g., validating hypotheses, running calculations, triggering actions). |
| **Usage Style** | Static: Tools are used once to gather context. | Dynamic: Tools are invoked iteratively as part of the reasoning process. |
| **Example** | Querying a knowledge base to answer "What's the capital of France?" | Using a calculator to optimize a budget, calling an API to book a flight, or validating code syntax before execution. |

---

## Planning

When we think of planning, we often associate it with project management or strategic decision-making. In AI agents, planning refers to the ability to **decompose complex tasks into actionable steps**, sequence them logically, and adaptively execute them — even in uncertain environments.

> **Planning:** The systematic process of breaking down objectives into smaller tasks, orchestrating their execution, and dynamically adjusting based on feedback.

Planning is crucial for agents tackling multi-step problems where a single response is insufficient. It helps agents:

- Avoid infinite loops that could prevent them from achieving the desired outcome
- Consider all critical steps (e.g., assisting in medical diagnosis while also verifying drug interactions when recommending treatment plans)

### Plan-and-Execute

![Plan-and-Execute pattern — inspired by BabyAGI, the agent generates an initial plan, executes steps sequentially, and dynamically re-plans when intermediate results deviate from expectations due to errors or new constraints](https://static.wixstatic.com/media/ffcc74_61e6f9024b1247aa8db0b6a5bad3f675~mv2.png/v1/fill/w_586,h_308,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_61e6f9024b1247aa8db0b6a5bad3f675~mv2.png)

Inspired by BabyAGI, the plan-and-execute pattern emphasizes multi-step planning followed by sequential execution, with re-planning triggered by feedback from completed tasks.

First, the system generates an initial plan (e.g., breaking a goal into subtasks like "Research → Analyze → Summarize"). It then executes these tasks one by one, dynamically adjusting the plan if intermediate results deviate from expectations — such as incomplete data, errors, or new constraints.

This mirrors the process of following a recipe: a chef first outlines steps (chopping, sautéing, baking) but adapts if ingredients burn or substitutions are needed.

Further examples:

| Scenario | Plan-and-Execute Workflow |
|---|---|
| **Content Creation** | Plan: Outline blog sections → Execute: Write each section → Re-plan: If topic shifts. |
| **Project Management** | Plan: Define milestones → Execute: Assign tasks → Re-plan: If deadlines slip. |
| **Software Development** | Plan: Architecture design → Execute: Code modules → Re-plan: If bugs block progress. |

### LLM Compiler

![LLM Compiler architecture — a Directed Acyclic Graph (DAG) where independent tasks run in parallel, eagerly streamed as soon as their dependencies resolve. The Joiner component reconciles outputs and triggers re-planning if inconsistencies are found](https://static.wixstatic.com/media/ffcc74_9549931263204857bbbdf3266279255b~mv2.png/v1/fill/w_586,h_443,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_9549931263204857bbbdf3266279255b~mv2.png)

Building on the plan-and-execute pattern, LLMCompiler introduces **parallel task execution** through a dynamically generated Directed Acyclic Graph (DAG). Instead of processing tasks sequentially, the pattern identifies independent tasks and eagerly streams them for concurrent execution, significantly accelerating workflows.

**How It Works:**

- **DAG Construction:** Breaks down objectives into tasks with explicit dependencies (e.g., "Task B depends on the output from Task A").
- **Parallel Execution:** Executes tasks as soon as their dependencies are resolved (e.g., Tasks C and D can run simultaneously if neither depends on the other).
- **Joiner Component:** Aggregates and validates outputs from parallel tasks, flagging inconsistencies (e.g., conflicting data from two research agents).
- **Re-planning Loop:** If errors or mismatches occur, the system re-enters planning mode to adjust the DAG (e.g., adding a new "data reconciliation" task).

While plan-and-execute follows a sequential, step-by-step process (like a single chef preparing a dish), LLMCompiler is more like a kitchen crew working in parallel simultaneously, accelerating the process and improving efficiency.

---

## Multi-Agent

In the real world, solving complex problems — like launching a rocket or developing a vaccine — requires experts with diverse skills to collaborate. Similarly, multi-agent collaboration in AI orchestrates specialized agents, each with distinct roles and expertise, to tackle challenges collectively.

**Why use multiple agents instead of a single agent?**

- **Scalability:** With multiple agents, we can divide complex tasks into smaller, manageable sub-tasks, enabling parallel processing and faster problem-solving.
- **Specialization:** Each agent can focus on a specific aspect of the problem, leveraging its unique capabilities to contribute to the overall solution.
- **Robustness:** If one agent fails or makes an error, other agents can compensate, ensuring the system continues to function effectively.

> **Multi-Agent Systems:** Collaborative networks of agents pooling resources, tools, and expertise to solve complex problems through division of labor and shared reasoning.

**Example: Medical Diagnosis Team**

- **Symptom Classifier:** Identifies patterns in patient-reported symptoms.
- **Drug Interaction Checker:** Cross-references medications for contraindications.
- **Treatment Recommender:** Proposes therapies aligned with clinical guidelines.
- **Coordinator Agent:** Synthesizes inputs, resolves conflicts (e.g., via debate), and finalizes the care plan.

This collaboration mimics a hospital team rounding on a patient — each specialist contributes insights, while a lead physician integrates findings. Multi-agent collaboration synergises with previously discussed agentic patterns:

- **Reflection:** Agents critique each other's outputs, refining solutions.
- **Tool Use:** Agents leverage shared tools (e.g., medical databases, drug interaction checkers).
- **Planning:** Tasks are divided and sequenced (e.g., "First diagnose, then check interactions, then recommend treatments").

### Collaboration

![Multi-agent collaboration pattern — a flat peer-to-peer structure where specialized agents (e.g., a code-writer and a bug-fixer) hand off work sequentially to produce a final, validated output](https://static.wixstatic.com/media/ffcc74_4cf9b616c5ad42ada8839c3db12f6901~mv2.png/v1/fill/w_586,h_543,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_4cf9b616c5ad42ada8839c3db12f6901~mv2.png)

Building on the collaboration pattern, we can explore more specialized multi-agent architectures that require a nuanced division of labor. For example, when generating a new script for data processing, the collaboration pattern can break the process into:

- **Code-writer Agent:** Analyse requirements and generate code snippets/script.
- **Bug-fixer Agent:** Validate code, identify and fix errors.

Each agent specializes in a distinct task, working in tandem to produce the final code snippet/script efficiently.

While the collaboration pattern provides structure and coordination, it can often be perceived as more "rigid" compared to the autonomous multi-agent pattern, which offers greater flexibility and independence among agents.

### Supervisor

![Supervisor pattern — a hierarchical structure where a lead supervisor agent routes tasks to specialized sub-agents based on their expertise, centralizing workflow management while granting execution autonomy to sub-agents](https://static.wixstatic.com/media/ffcc74_44abdc75bbe64d61876174dd03e27eb0~mv2.png/v1/fill/w_586,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_44abdc75bbe64d61876174dd03e27eb0~mv2.png)

The supervisor pattern introduces a hierarchical structure to multi-agent collaboration, where a lead agent (supervisor) oversees and coordinates the activities of sub-agents. This pattern is particularly effective in scenarios that require centralized task management, ensuring efficient delegation and coordination among specialized agents.

By transitioning from a flat collaborative model to a hierarchical structure, the supervisor pattern enhances the organization and management of multi-agent systems.

| Aspect | Collaboration Pattern | Supervisor Pattern |
|---|---|---|
| **Structure** | Flat, peer-to-peer interaction | Hierarchical (supervisor → sub-agents) |
| **Task Delegation** | Sequentially, often based on task workflow | Supervisor assigns (routes) tasks based on sub-agent expertise |
| **Autonomy** | Tasks are shared sequentially based on workflow | Sub-agents focus on execution; supervisor manages workflow |

### Hierarchical

![Hierarchical multi-agent pattern — extends the supervisor model with multiple layers. Supervisor agents oversee sub-supervisors, who manage their own specialists, enabling the handling of very complex, large-scale tasks with deep specialization at every level](https://static.wixstatic.com/media/ffcc74_f00d11a8881e41008d1aea71a2102a45~mv2.png/v1/fill/w_586,h_555,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_f00d11a8881e41008d1aea71a2102a45~mv2.png)

While multi-agent collaboration offers a significant shift from single-agent systems, challenges can still arise when individual agents struggle with sub-problems that may remain too intricate to resolve independently.

In such cases, a deeper hierarchical structure can be introduced. Here, a lead agent (supervisor) oversees sub-supervisor agents, who in turn manage their respective sub-agents.

Imagine an organization working on a major proposal. The organization may be divided into pillars, with each pillar further broken down into teams:

- The **research team** might divide their work into multiple sub-topics, each requiring specialized knowledge and further delegation.
- Once research is complete, the **proposal writing team** may split the document into various sections, with different members focusing on specific parts.
- Similarly, **other teams** involved in the project will follow their own structured breakdown to ensure a comprehensive and efficient approach.

> **Hierarchical pattern** enhances coordination and ensures that complex tasks are handled effectively, leveraging specialized expertise at multiple levels.

### Human-in-the-Loop

![Human-in-the-Loop (HITL) pattern — shows three intervention points where humans can review, correct, or override agent decisions: Tool Calls, Agent Outputs, and Context](https://static.wixstatic.com/media/ffcc74_9ed47cce00954f01974299244c442b96~mv2.png/v1/fill/w_586,h_517,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_9ed47cce00954f01974299244c442b96~mv2.png)

In an ideal agentic AI system, we aim to grant full autonomy to agents to handle tasks of varying complexity. However, through experimentation, we often discover occasional inaccuracies that can impact performance.

In business-critical operations — such as compliance and key decision-making processes — where AI may be introduced to enhance capabilities, it becomes crucial to maintain accuracy and reliability. The human-in-the-loop (HITL) pattern allows human intervention to review, correct, and override certain agent decisions when necessary.

In an agentic AI system, human intervention can occur in the following areas:

- **Tool Calls:** Validate, edit, and approve the usage of tools by agents.
- **Agent Outputs:** Validate, edit, and approve outputs generated by agents at various stages of the process.
- **Context:** Provide additional information to agents, enhancing their ability to support subsequent stages of decision-making or task completion.

> **By incorporating human oversight**, organizations can strike a balance between AI-driven efficiency and the assurance of human judgment, ensuring that critical processes remain accurate, transparent, and aligned with business objectives.

An example of when to use the human-in-the-loop pattern:

| Scenario | HITL Recommended? | Rationale |
|---|---|---|
| Legal contract drafting | ✅ | Avoid liability risks from AI missing nuanced clauses |
| Inventory management | ❌ | Fully autonomous agents optimize restocking efficiently |
| Patient diagnosis support | ✅ | Ensure alignment with evolving medical best practices |

---

## Real-World Applications of Agents

While we have explored a high-level overview of various agentic design patterns, grounding these concepts with real-world applications can help solidify our understanding of agent-based systems.

I will present case studies on agent implementations, drawing insights from practical examples found in blogs from LangChain, LlamaIndex, and CrewAI. These case studies showcase how different patterns are applied in real-world scenarios.

### Captide – Financial Analysis

- **Core Business:** Automating the extraction, integration, and analysis of data from investor relations documents.
- **Key Tasks:**
  - Extracting financial metrics
  - Creating customized datasets
  - Generating contextual insights
- **Objective:** To orchestrate a data retrieval and processing pipeline for a large corpus of financial documents.
- **Patterns Applied:**
  - **Tool Use:** Agents require access to a ticker-specific vector store to retrieve relevant financial data efficiently.
  - **Plan-and-Execute:** Given the extensive volume of regulatory filings, parallelization is crucial. The LLMCompiler pattern enables minimal latency while executing agent tasks concurrently.
  - **Reflection:** Integrating the reflection pattern with tool use allows an iterative approach to refining contextual insights from financial data.
  - **Multi-Agent:** Specialized agents enhance performance across key areas such as data extraction, data processing, and insights generation.

Considering potential regulatory compliance requirements, integrating a **human-in-the-loop** approach can provide an additional layer of oversight, ensuring all outputs align with legal and regulatory frameworks.

### Minimal – Customer Support

- **Core Business:** Enhancing customer satisfaction by automating repetitive customer service workflows.
- **Key Tasks:**
  - Providing context-rich responses to customer inquiries
  - Integrating with e-commerce platforms to perform actions (e.g., updating shipping addresses)
- **Objective:** To assist the support team in resolving complex Tier 2 and Tier 3 tickets — either as a copilot or in a fully autonomous capacity.
- **Patterns Applied:**
  - **Planning:** Decomposes customer inquiries into sub-tasks, enabling specialized agents to retrieve task-specific information and follow appropriate protocols.
  - **Tool Use:** Leverages internal knowledge bases to retrieve relevant guidelines and information, enhancing the planning and accuracy of responses.
  - **Multi-Agent:** Integrates agents within a multi-agent system to facilitate final decisions, which may involve complex actions such as refunds or simpler tasks like providing responses.

Minimal adopted a multi-agent system approach after discovering that relying on a single large prompt for the LLM often conflated multiple tasks, leading to higher costs and increased errors.

### Waynabox – Travel Planner

- **Core Business:** Providing travel planning services with a focus on spontaneity and personalization.
- **Key Tasks:**
  - Crafting hyper-personalized itineraries tailored to individual preferences
  - Adjusting plans dynamically based on real-time weather conditions and local updates
- **Objective:** To deliver a unique travel experience for each customer through hyper-personalization.
- **Patterns Applied:**
  - **Planning:** Decomposes itinerary planning into sub-tasks based on customer preferences, travel dates, weather forecasts, and logistical considerations.
  - **Tool Use:** Utilizes real-time weather updates to dynamically adjust plans and proactively inform users via messaging applications like WhatsApp.
  - **Multi-Agent:** Agents collaborate to analyze customer preferences and determine ideal travel destinations, continuously re-planning based on real-time location updates.

### GymNation – Member Experience

- **Core Business:** Traditional gym operator and fitness community builder.
- **Key Tasks:**
  - Handling member inquiries
  - Appointment booking
  - Sales and prospecting outreach
  - Marketing and promotion
- **Objective:** To enhance the full lifecycle of a member's experience through AI.
- **Patterns Applied:**

![GymNation multi-agent architecture — the supervisor routes incoming member requests to specialized agents for booking, sales, and support, with hierarchical sub-agents managing more complex workflows](https://static.wixstatic.com/media/ffcc74_c79eae452ade4f69a40569ad3bae7fa1~mv2.png/v1/fill/w_514,h_444,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_c79eae452ade4f69a40569ad3bae7fa1~mv2.png)

  - **Tool Use:** Agents use tools to take decisive actions, such as booking appointments or retrieving information from sales sheets, to facilitate specialized workflows.
  - **Multi-Agent (Supervisor):** The supervisor pattern is leveraged to route natural inputs, activating the agentic workflow and directing tasks to the most suitable agents.
  - **Multi-Agent (Hierarchical):** Given the extensive scope of a member's lifecycle, the hierarchical pattern is also applied to further break down tasks, enabling more control and complexity for agents managing more involved processes.

> ℹ️ While we've primarily explored case studies from leading LLM orchestration and agent frameworks, it is also valuable to examine more generalized agent case studies. These broader insights can provide a high-level perspective on key implementation decisions and patterns, helping to identify best practices and common challenges across different domains.

---

## Building Your Own Agent: Lessons from Use-Cases

Having explored how existing businesses are leveraging agentic AI systems, it is crucial to distill key insights and best practices to guide the development of our own AI agents.

### Tool Design

Developing effective agentic AI systems requires prioritizing tools that align with the use case and operational needs. Key considerations include:

- **Relevance and Functionality:**
  - If agent workflows require real-time data, tools must be designed to efficiently access APIs or databases for up-to-date information.
  - Similar to RAG, if agents need to ground their responses in predefined business protocols or guidelines, tools that provide access to relevant databases are critical to minimize hallucinations.

- **Security Measures:**
  - While tool usage is a fundamental pattern in agent design, robust security measures must be implemented to prevent unintended consequences.
  - For example, in a report generation workflow where agents create charts using code, it's essential to sandbox such tools (e.g., enforcing read-only access) to prevent unauthorized modifications.

- **Autonomy Levels:**
  - Designing agentic AI systems requires careful consideration of the level of autonomy granted to the agents.

![Autonomy spectrum — maps the range from Low Autonomy to Full Autonomy, helping teams calibrate the right level of agent independence for their use case](https://static.wixstatic.com/media/ffcc74_48ac8b0e62a944939caed19b54fcf5fa~mv2.png/v1/fill/w_514,h_244,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_48ac8b0e62a944939caed19b54fcf5fa~mv2.png)

  - **Low Autonomy:** Agents follow predefined workflows with fixed steps (e.g., structured data retrieval tasks managed via a router).
  - **Full Autonomy:** Agents engage in open-ended problem-solving, with built-in fallbacks such as retry mechanisms and human escalation for critical decision points.

### Evaluation

Building and deploying agentic AI workflows follow an iterative development process similar to traditional machine learning projects. Effective evaluation involves:

- **Robust Testing:**
  - Agents should be tested with adversarial prompts to evaluate their behavior under potential misuse or rogue actors.
  - Ensuring agents do not introduce risks, biases, or inaccuracies that could harm end-users is a critical component of the evaluation phase.

- **Crawl-Walk-Run Approach:**
  - As highlighted in *AI Engineering: Building Applications with Foundation Models*, one way to evaluate AI applications (including agents) could follow a phased approach:
    - **Crawl:** Initially, ensure mandatory human involvement in the AI workflow.
    - **Walk:** Deploy the workflow internally for employee testing and validation.
    - **Run:** Gradually increase automation and trust, allowing direct interaction with external users.

- **Demonstrating Business Value:**
  - While generative AI demonstrations and proof-of-concepts may appear impressive, the ultimate goal is to deliver tangible business value.
  - Agents should contribute to measurable improvements, such as increased efficiency, cost savings, or enhanced customer satisfaction.

---

## Closing Remarks

In this article, we've covered a range of topics — from defining agents to exploring key agentic design patterns and examining how enterprises are successfully leveraging agents in production environments.

However, it's important to acknowledge that agents still face inherent challenges:

- **Hallucinations** — generating plausible but incorrect information
- **Scalability issues** — managing complexity as systems grow
- **Ethical concerns** — such as unchecked autonomy and lack of transparency

While agents represent a significant step forward in integrating AI into the workforce and daily life, they still share many challenges with other AI applications we've encountered thus far.

Personally, I am excited about the future developments in the field of agentic AI, particularly:

- The emergence of **smaller, specialized agents** powered by distilled LLMs derived from larger, more capable models.
- **Enhanced reasoning capabilities** in advanced LLMs, such as OpenAI's o1 and DeepSeek's R1, which are promising to improve agent decision-making.

Lastly, it's inspiring to see the shift from traditional chatbots to intelligent problem-solving partners. As we move into the coming year, I look forward to spending more time understanding and designing thoughtful agent applications — and I hope you do too!

---

## Further Learnings

- https://llmagents-learning.org/f24
- https://langchain-ai.github.io/langgraph/concepts/
- https://vitalflux.com/agentic-reasoning-design-patterns-in-ai-examples/

---

## Footnotes

1. https://openai.com/index/hello-gpt-4o/ ↩
2. https://www.anthropic.com/news/claude-3-5-sonnet ↩
3. https://ai.meta.com/blog/meta-llama-3-1/ ↩
4. https://www.deeplearning.ai/the-batch/issue-241/ ↩
5. https://www2.deloitte.com/content/dam/Deloitte/us/Documents/consulting/us-state-of-gen-ai-q4.pdf ↩
6. https://2001.fandom.com/wiki/HAL_9000 ↩
7. https://movies.fandom.com/wiki/Samantha ↩
8. https://www.kaggle.com/whitepaper-agents ↩
9. https://www.anthropic.com/research/building-effective-agents ↩
10. https://blog.langchain.dev/what-is-an-agent/ ↩
11. https://docs.llamaindex.ai/en/stable/use_cases/agents/ ↩
12. https://www.youtube.com/watch?v=rPs7g2BM0f8&t=1118s ↩
13. https://weaviate.io/blog/what-is-agentic-rag ↩
14. https://arxiv.org/abs/2303.11366 ↩
15. https://arxiv.org/abs/2310.04406 ↩
16. https://blog.langchain.dev/ ↩
17. https://www.llamaindex.ai/blog ↩
18. https://blog.crewai.com/ ↩
19. https://blog.langchain.dev/how-captide-is-redefining-equity-research-with-agentic-workflows-built-on-langgraph-and-langsmith/ ↩
20. https://blog.langchain.dev/how-minimal-built-a-multi-agent-customer-support-system-with-langgraph-langsmith/ ↩
21. https://blog.crewai.com/how-waynabox-is-changing-travel-planning-with-crewai/ ↩
22. https://www.llamaindex.ai/blog/case-study-gymnation-revolutionizes-fitness-with-ai-agents-powering-member-experiences ↩
23. https://medium.com/@karl.foster/the-development-of-ai-agents-how-we-deployed-an-army-in-our-business-6c67f51e3d1d ↩
24. https://www.amazon.sg/dp/1098166302?ref_=mr_referred_us_sg_sg ↩
