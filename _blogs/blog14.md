---
title: "Context Engineering Guide"
date: 2025-11-01
description: "A concrete step-by-step guide to context engineering in practice — from system prompts and structured outputs to RAG, memory, and tool calling in AI agent workflows."
layout: blog
---

# What is Context Engineering?

A few years ago, many — even top AI researchers — claimed that prompt engineering would be dead by now.

Obviously, they were very wrong. In fact, prompt engineering is now more important than ever. It's so important that it's being rebranded as **context engineering**.

Yes, another fancy term to describe the important process of tuning the instructions and relevant context that an LLM needs to perform its tasks effectively.

Much has been written already about context engineering (Ankur Goyal, Walden Yan, Tobi Lutke, and Andrej Karpathy), but I wanted to write about my thoughts on the topic and show you a concrete step-by-step guide putting context engineering into action in developing an AI agent workflow.

![Context Engineering Overview](https://static.wixstatic.com/media/ffcc74_19ed9157053a44d8a158097b66bbfe34~mv2.png/v1/fill/w_839,h_542,al_c,lg_1,q_90,enc_auto/ffcc74_19ed9157053a44d8a158097b66bbfe34~mv2.png)

I like the term context engineering as it feels broader and better explains most of the work that goes into prompt engineering, including other related tasks.

Context engineering is the next phase, where you architect the **full context** — which in many cases requires going beyond simple prompting and into more rigorous methods to obtain, enhance, and optimize knowledge for the system.

From a developer's point of view, context engineering involves an iterative process to optimize instructions and the context you provide an LLM to achieve a desired result. This includes having formal processes (e.g., eval pipelines) to measure whether your tactics are working.

A broader definition: **the process of designing and optimizing instructions and relevant context for LLMs and advanced AI models to perform their tasks effectively.** This encompasses:

Designing and managing prompt chains — Tuning instructions/system prompts — Managing dynamic elements of the prompt (e.g., user inputs, date/time) — Searching and preparing relevant knowledge (RAG) — Query augmentation — Tool definitions and instructions — Preparing and optimizing few-shot demonstrations — Structuring inputs and outputs (e.g., delimiters, JSON schema) — Short-term and long-term memory management.

In other words, what you are trying to achieve in context engineering is **optimizing the information you are providing in the context window of the LLM** — including filtering out noisy information.

---

# Context Engineering in Action

Let's look at a concrete example of context engineering work I did for a multi-agent deep research application I built for personal use. I built the agentic workflow inside of n8n. The complete agent architecture looks like the following:

![Multi-agent deep research architecture](https://static.wixstatic.com/media/ffcc74_2ae3d7f464f64523bfbe51857a44d481~mv2.png/v1/fill/w_1042,h_356,al_c,lg_1,q_90,enc_auto/ffcc74_2ae3d7f464f64523bfbe51857a44d481~mv2.png)

The **Search Planner** agent is in charge of generating a search plan based on the user query.

---

# System Prompt

Below is the system prompt I put together for this subagent:

```
You are an expert research planner. Your task is to break down a complex
research query (delimited by <user_query></user_query>) into specific search
subtasks, each focusing on a different aspect or source type.

The current date and time is: {{ $now.toISO() }}

For each subtask, provide:
1. A unique string ID for the subtask (e.g., 'subtask_1', 'news_update')
2. A specific search query that focuses on one aspect of the main query
3. The source type to search (web, news, academic, specialized)
4. Time period relevance (today, last week, recent, past_year, all_time)
5. Domain focus if applicable (technology, science, health, etc.)
6. Priority level (1-highest to 5-lowest)

All fields (id, query, source_type, time_period, domain_focus, priority) are
required for each subtask, except time_period and domain_focus which can be
null if not applicable.

Create 2 subtasks that together will provide comprehensive coverage of the
topic. Focus on different aspects, perspectives, or sources of information.

Each subtask will include the following information:

  id: str
  query: str
  source_type: str  # e.g., "web", "news", "academic", "specialized"
  time_period: Optional[str] = None  # e.g., "today", "last week", "recent"
  domain_focus: Optional[str] = None  # e.g., "technology", "science"
  priority: int  # 1 (highest) to 5 (lowest)

After obtaining the above subtasks information, you will add two extra fields:
start_date and end_date. Infer this from the current date and the time_period.
Use the format:

  "start_date": "2024-06-03T06:00:00.000Z",
  "end_date":   "2024-06-11T05:59:59.999Z"
```

There are many parts to this prompt that require careful consideration. As you can see, it's not just about designing a simple prompt — this process requires experimentation and providing important context for the model to perform the task optimally.

Let's break this down into its core components.

---

# Instructions

The instruction is the high-level directive provided to the system:

```
You are an expert research planner. Your task is to break down a complex
research query (delimited by <user_query></user_query>) into specific search
subtasks, each focusing on a different aspect or source type.
```

Many beginners — and even experienced AI developers — would stop here. But given the full prompt above, you can appreciate how much more context we need to give the system for it to work as intended. That's what context engineering is all about.

---

# User Input

The user input wasn't shown in the system prompt, but here's an example of how it looks:

```xml
<user_query>
  What's the latest dev news from OpenAI?
</user_query>
```

Notice the use of **delimiters** — this structures the prompt to avoid confusion and adds clarity about what the user input is and what the system should generate.

---

# Structured Inputs and Outputs

In addition to the high-level instruction and user input, I spent considerable effort on the details of what the planning agent needs to produce:

```
For each subtask, provide:
1. A unique string ID (e.g., 'subtask_1', 'news_update')
2. A specific search query focusing on one aspect
3. The source type (web, news, academic, specialized)
4. Time period relevance (today, last week, recent, past_year, all_time)
5. Domain focus if applicable (technology, science, health, etc.)
6. Priority level (1-highest to 5-lowest)

All fields are required except time_period and domain_focus (can be null).
Create 2 subtasks for comprehensive coverage.
```

I also provide structured output format hints:

```python
# Expected subtask schema:
id: str
query: str
source_type: str       # e.g., "web", "news", "academic", "specialized"
time_period: Optional[str] = None
domain_focus: Optional[str] = None
priority: int          # 1 (highest) to 5 (lowest)
```

And a full JSON example to steer the output parser:

```json
{
  "subtasks": [
    {
      "id": "openai_latest_news",
      "query": "latest OpenAI announcements and news",
      "source_type": "news",
      "time_period": "recent",
      "domain_focus": "technology",
      "priority": 1,
      "start_date": "2025-06-03T06:00:00.000Z",
      "end_date": "2025-06-11T05:59:59.999Z"
    },
    {
      "id": "openai_official_blog",
      "query": "OpenAI official blog recent posts",
      "source_type": "web",
      "time_period": "recent",
      "domain_focus": "technology",
      "priority": 2,
      "start_date": "2025-06-03T06:00:00.000Z",
      "end_date": "2025-06-11T05:59:59.999Z"
    }
  ]
}
```

The tool will automatically generate the schema from these examples, allowing the system to parse and produce consistent structured outputs:

```json
[
  {
    "action": "parse",
    "response": {
      "output": {
        "subtasks": [
          {
            "id": "subtask_1",
            "query": "OpenAI recent announcements OR news OR updates",
            "source_type": "news",
            "time_period": "recent",
            "domain_focus": "technology",
            "priority": 1,
            "start_date": "2025-06-24T16:35:26.901Z",
            "end_date": "2025-07-01T16:35:26.901Z"
          },
          {
            "id": "subtask_2",
            "query": "OpenAI official blog OR press releases",
            "source_type": "web",
            "time_period": "recent",
            "domain_focus": "technology",
            "priority": 2,
            "start_date": "2025-06-24T16:35:26.901Z",
            "end_date": "2025-07-01T16:35:26.901Z"
          }
        ]
      }
    }
  }
]
```

This is a really powerful approach, especially when your agent is getting inconsistent outputs that need to be passed in a specific format to the next component in the workflow.

---

# Tool Calling

We're using n8n to build our agent, so passing in the current date and time is straightforward:

```
The current date and time is: {{ $now.toISO() }}
```

This is a simple function call in n8n, though it's also typical to build it as a dedicated tool that fetches the date only when the query requires it. Context engineering forces you to make concrete decisions about **what context to pass and when** — eliminating assumptions and inaccuracies from your application.

The date and time are critical context. Without them, when asked to "find last week's news from OpenAI," the system would just guess the date range, leading to suboptimal queries and inaccurate web searches. With the correct date, the agent can generate proper date ranges:

```
After obtaining the subtasks, add two extra fields: start_date and end_date.
Infer from the current date and the time_period selected.

"start_date": "2024-06-03T06:00:00.000Z",
"end_date":   "2024-06-11T05:59:59.999Z"
```

---

# RAG & Memory

The first version of this deep research application doesn't require short-term memory, but a natural extension is **caching subqueries** for different user queries.

If a similar query was already used before, you can store those results in a vector store and search over them — avoiding the need to create a new set of subqueries every time. Every LLM API call increases latency and cost.

This is clever context engineering: making your application more dynamic, cheaper, and efficient. Context engineering is not just about optimizing your prompt — it's about **choosing the right context for the goals you are targeting**. Creative and novel context engineering is the real moat.

---

# State & Historical Context

An important part of this project was optimizing the results for the final report. In many cases, the agentic system might need to revise queries, subtasks, and the data it's pulling from the web search APIs. This means the system takes **multiple shots at the problem** and needs access to previous states and the historical context of the entire workflow.

In our use case, this means giving the agent access to: the state of the subtasks, any revisions, past results from each agent in the workflow, and whatever other context is necessary for the revision phase.

Context engineering isn't always straightforward — lots of decision-making happens here. And this is why I continue to emphasize **evaluation**: if you are not measuring all these things, how do you know whether your context engineering efforts are working?

---

# Advanced Context Engineering

There are many other aspects of context engineering not covered here: context compression, context management techniques, context safety, and evaluating context effectiveness (measuring how effective that context is over time).

Context can **dilute or become inefficient** — filled with stale and irrelevant information — which requires special evaluation workflows to capture these issues.

I expect context engineering to continue to evolve as an important skill for AI developers. Beyond manual context engineering, there are also opportunities to build methods that **automate** the process of effective context engineering.

---

# Resources

[Prompting Guide](https://www.promptingguide.ai/)

[Context Engineering — Lance Martin](https://rlancemartin.github.io/2025/06/23/context_engineering/)

[Andrej Karpathy on Context Engineering](https://x.com/karpathy/status/1937902205765607626)

[Phil Schmid — Context Engineering](https://www.philschmid.de/context-engineering)

[The Skill Replacing Prompt Engineering — Simple AI](https://simple.ai/p/the-skill-thats-replacing-prompt-engineering?)

[12-Factor Agents — HumanLayer](https://github.com/humanlayer/12-factor-agents)

[The Rise of Context Engineering — LangChain](https://blog.langchain.com/the-rise-of-context-engineering/)
