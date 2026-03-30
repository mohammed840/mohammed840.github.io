---
title: "Training a Deep Q-Network to Master Uno: A Comprehensive Study in Reinforcement Learning for Imperfect Information Games"
date: 2026-01-01
authors: "Mohammed Alshehri"
year: 2026
pdf: "/main-4.pdf"
tldr: "We train a Deep Q-Network (DQN) agent for two-player Uno using a fixed-dimensional state encoding and masked action encoding, and evaluate it using large-scale simulations and head-to-head tournaments against API-served LLM opponents."
highlights:
  - "Formulates Uno as a value-based RL problem under imperfect information and stochastic transitions."
  - "Introduces a fixed-dimensional 420-feature state encoding and a 61-way masked action encoding to handle variable legality."
  - "Reports baseline statistics from 100,000 random-play simulations and comparative tournaments versus LLM opponents."
contributions:
  - "A fixed-dimensional state encoding aligned with Uno’s public/private information."
  - "Tournament-based experience collection and evaluation protocol for two-player Uno."
  - "Empirical comparison of the learned RL agent against random baselines and multiple LLM opponents (conditional on API configuration)."
abstract: "We study Deep Q-Network (DQN) learning for Uno, an imperfect-information card game with stochastic transitions and a variable legal action set. We introduce a fixed-dimensional state encoding and a masked discrete action encoding, and train the agent using tournament-based experience collection. Using 100,000 random-play simulations, we report baseline game statistics and evaluate the learned agent against API-served LLM opponents. Because LLM endpoints may change over time, these results are conditional on the specific model identifiers and access configuration."
---

{::nomarkdown}
{% include papers/issue-paper-1.html %}
{:/nomarkdown}
