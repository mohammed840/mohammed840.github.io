---
title: "Training a Deep Q-Network to Master Uno: A Comprehensive Study in Reinforcement Learning for Imperfect Information Games"
date: 2026-03-07
author: "Mohammed Alshehri"
description: "We train a DQN agent for two-player Uno using a fixed-dimensional state encoding and masked action encoding, and evaluate it against LLM opponents."
---

**Keywords:** reinforcement learning · DQN · imperfect information · card games · evaluation · large language models

---

## **Introduction and Motivation**

### **The challenge of imperfect information games**

Card games are a standard benchmark for decision-making under uncertainty. Unlike perfect-information games (e.g., Chess, Go), Uno introduces:

This work builds on deep reinforcement learning methods for control (Mnih et al. 2015) and subsequent improvements in stabilizing value-based learning (Hasselt et al. 2016).

- **Imperfect information**: opponents' hands are hidden.
- **Stochastic transitions**: shuffling and drawing induce randomness.
- **Variable action spaces**: legal actions change with the top discard card and the hand.
- **Delayed rewards**: local actions may have long-term consequences.

### **Research objectives**

We pursue four objectives:

- Statistical characterization of baseline play.
- Implementation and training of a DQN agent.
- Comparative evaluation against random baselines and frontier LLMs.
- Deployment of an interactive web interface for demonstration.

### **Contributions**

Our contributions include (i) a fixed-dimensional state encoding, (ii) tournament-based experience collection, (iii) empirical comparisons versus LLM-based opponents, and (iv) a deployable system design.

---

## **Problem Setting and Rules**

### **Two-player Uno variant**

We study a two-player version of Uno. The game is played with a standard Uno deck and proceeds in alternating turns until one player plays their final card. Special action cards modify turn order or force draws; wild cards allow the acting player to declare the next active color. For baseline rule definitions we follow the official Uno instructions (Mattel n.d.). *Implementation note:* Uno has rule variants (e.g., stacking draw cards); therefore, any empirical results in this paper should be interpreted with respect to the specific rules implemented in our codebase.

### **Learning problem formulation**

We model the environment as a partially observable sequential decision problem: the agent observes its private hand and public information (e.g., discard top card) but not the opponent's hand (Kaelbling et al. 1998). We train the agent using episodic win/loss feedback as the primary learning signal.

---

## **Related Work**

Deep reinforcement learning for control with value-based methods has been widely studied, including the original DQN formulation (Mnih et al. 2015) and Double DQN (Hasselt et al. 2016). Multiple stabilisation and performance extensions have been proposed, including dueling networks (Wang et al. 2016), prioritised experience replay (Schaul et al. 2016), and combined variants such as Rainbow (Hessel et al. 2018). For card-game research and benchmarking, RLCard provides a general-purpose toolkit (Zha et al. 2019).

A course report by Brown, Jasson and Swarnakar (Brown et al. 2020) also explores Uno with DQN and DeepSARSA in an RLCard-based environment, focusing on multi-player games (3–5 players) and tournament-style experience collection.

---

## **Game Statistics from Large-Scale Simulations**

### **Experimental setup**

We simulated 100,000 games under uniformly random legal play. For each episode we recorded total turns to termination, the starting player, and per-player counts of cards played and drawn.

### **Game length distribution**

![Turns-per-game distribution from 100,000 simulated Uno games under uniformly random legal play.](/assets/assets-/turns_distribution.png)

The pronounced right tail indicates that while many games finish quickly, a non-negligible fraction of episodes are substantially longer, which motivates reporting both central tendency and tail statistics.

**Summary statistics (random baseline):**

| Statistic | Value |
|:---|:---|
| Mean | 46.5 turns |
| Median | 37.0 turns |
| Mode | 13 turns |
| Standard deviation | 33.8 turns |
| Minimum | 7 turns |
| Maximum | 418 turns |

### **Percentile analysis**

![Turns-per-game percentiles from 100,000 random simulations.](/assets/assets-/percentile_analysis.png)

| Percentile | Turns | Interpretation |
|:---|---:|:---|
| 25th | 23 | 25% of games complete by this point |
| 50th (median) | 37 | Half of games complete |
| 75th | 60 | Three quarters of games complete |
| 90th | 90 | Only 10% exceed this length |
| 95th | 113 | Long games (5% tail) |
| 99th | 167 | Extreme tail (1%) |

### **Cumulative distribution function**

![Cumulative distribution function (CDF) of turns per game from 100,000 simulations.](/assets/assets-/turns_cdf.png)

### **First-player advantage**

![Game-length summary and first-player advantage analysis (random baseline).](/assets/assets-/game_statistics.png)

We observe a modest first-player advantage: first player wins 51.07% of games (51,068 / 100,000).

---

## **Deep Q-Network (DQN) Architecture**

### **Overview and design rationale**

Deep Q-Networks (DQN) learn a parametric approximation to the optimal action-value function and are well suited to environments with (i) large or continuous observation spaces and (ii) discrete actions (Mnih et al. 2015). In our setting, the observation is a fixed-length 420-dimensional feature vector, while the action set is a 61-way discrete encoding with dynamic legality constraints.

Two practical challenges are central in Uno: (a) *stochasticity and partial observability* (hidden opponent hand and random draws), and (b) *variable legal actions*. To address (b), we explicitly apply an *action mask* at decision time so that the policy never selects illegal actions.

### **Theoretical foundation**

DQN builds on the Bellman optimality equation for Markov decision processes. Given a transition tuple, the *one-step TD target* used by DQN relies on parameters of a slowly-updated *target network* that stabilises learning (Mnih et al. 2015).

We minimise the squared TD error over samples drawn from a replay buffer.

#### Double DQN target (reduced overestimation)

In standard DQN, the maximisation in the TD target can introduce positive bias ("overestimation"). We therefore use the Double DQN decomposition, selecting the greedy action under the online network but evaluating it with the target network (Hasselt et al. 2016).

### **Experience replay and target network**

DQN uses two key stabilisation mechanisms (Mnih et al. 2015):

- **Experience replay.** Transitions are stored in a replay buffer and mini-batches are sampled uniformly during training. This breaks short-term temporal correlations and improves sample efficiency.
- **Target network.** A separate network with parameters is updated periodically from the online network parameters, reducing non-stationarity of TD targets.

### **State representation**

We encode the game state as a 420-dimensional feature vector structured as 7 planes of 60 features each (4 colors × 15 card types). This representation is designed to be (i) fixed-dimensional, (ii) permutation-invariant with respect to hand order, and (iii) directly aligned with Uno's public and private information.

![Distribution of the 420 state features across information categories.](/assets/assets-/state_encoding_breakdown.png)

**Detailed encoding scheme:**

| Planes | Features | Description |
|:---|---:|:---|
| 0–2 | 180 | Own hand card-count buckets (0, 1, 2+ copies) |
| 3–5 | 180 | Estimated opponent card counts (0, 1, 2+) |
| 6 | 60 | Current discard pile top card (one-hot) |
| **Total** | **420** | **Complete state representation** |

### **Action space and legality masking**

![Breakdown of the 61-action space.](/assets/assets-/action_space_breakdown.png)

The action space consists of 61 discrete actions representing all possible moves; illegal actions are masked during action selection.

| Action range | Count | Description |
|:---|---:|:---|
| 0–39 | 40 | Number cards (0–9 × 4 colors) |
| 40–43 | 4 | Skip (4 colors) |
| 44–47 | 4 | Reverse (4 colors) |
| 48–51 | 4 | Draw Two (4 colors) |
| 52–55 | 4 | Wild (declare 4 colors) |
| 56–59 | 4 | Wild Draw Four (declare 4 colors) |
| 60 | 1 | Draw from deck |

### **Network architecture**

Our Q-network maps 420 input features to 61 Q-values using a fully-connected multilayer perceptron. This choice is appropriate because the observation is already a compact, hand-crafted vector rather than an image.

> **Architecture summary.** Input: 420 → Hidden: 512 (ReLU, Dropout 0.1) → Hidden: 512 (ReLU, Dropout 0.1) → Output: 61 (linear). Optimizer: Adam with learning rate 10⁻⁴.

### **Relation to common DQN extensions**

Several extensions to DQN can further improve stability and performance, including dueling networks (Wang et al. 2016), prioritised experience replay (Schaul et al. 2016), and combined "Rainbow" variants (Hessel et al. 2018). We retain a relatively simple architecture to keep the Uno pipeline reproducible, and focus our improvements on state encoding, action masking, and tournament-style experience collection.

---

## **Training Methodology**

### **Tournament-based experience collection**

Each training iteration aggregates experience over a tournament of N complete games, improving stability and diversifying trajectories.

---

## **Experiments and Reproducibility**

### **Experimental protocol**

All experimental results are conditional on the ruleset and experimental protocol implemented in the accompanying codebase. In our implementation, training uses fixed random-policy opponents in a two-player setting (the learning agent is always player 0), and the reward is terminal only (+1 for win, −1 for loss, 0 otherwise).

### **Metrics and reporting**

We report (i) win rate and average reward for tournament-style evaluation, and (ii) summary statistics of game length (turns per game) under random play.

### **Reproducibility checklist**

- **Random seeds.** Training and evaluation set seeds for NumPy and PyTorch; the environment is also initialised with a seed parameter.
- **Artifacts.** Each run stores `config.json`, per-iteration tournament logs, and plots.
- **LLM evaluation.** OpenRouter opponents are specified by model slugs (e.g., `google/gemini-3-flash-preview`, `openai/gpt-5.2`, `anthropic/claude-opus-4.5`) and queried with `max_tokens=50` and `temperature=0.1`.

### **Hyperparameter configuration**

![Exploration rate decay and temporal-difference learning components.](/assets/assets-/training_hyperparameters.png)

| Hyperparameter | Value | Rationale |
|:---|---:|:---|
| Learning rate (α) | 10⁻⁴ | Stable learning without oscillation |
| Discount factor (γ) | 0.95 | Appropriate for ~40-turn games |
| Initial epsilon (ε₀) | 0.95 | High initial exploration |
| Epsilon decay (κ) | 0.995 | Gradual transition to exploitation |
| Minimum epsilon (ε_min) | 0.01 | Maintain exploration |
| Batch size | 256 | Efficient GPU utilization |
| Replay buffer size | 100,000 | Experience diversity |
| Target update frequency | 100 | Stabilize TD targets |
| Games per iteration | 100 | Tournament size |

### **Training dynamics**

![Average reward over training iterations.](/assets/assets-/fig2_dqn_avg_reward_over_iters.png)

The training progression exhibits three phases: (i) rapid learning in early iterations (1–50), (ii) strategy refinement (50–200), and (iii) convergence after approximately 200 iterations.

---

## **Evaluation: RL Agent vs. Large Language Models**

### **Experimental design**

We evaluate the trained agent in head-to-head tournaments against multiple LLM opponents accessed via an API, focusing on win-rate as the primary metric.

#### Protocol

For each opponent configuration, we run 100 games. The learning agent is player 0 and the starting player is determined by the environment reset. The LLM opponents are accessed through OpenRouter using model identifiers `google/gemini-3-flash-preview`, `openai/gpt-5.2`, and `anthropic/claude-opus-4.5`, queried with `temperature=0.1` and `max_tokens=50`.

### **Tournament results**

![Tournament win rates between the trained DQN agent and selected LLM opponents.](/assets/assets-/rl_vs_llm_tournament.png)

| Opponent | RL wins | LLM wins | RL win rate |
|:---|:---:|:---:|:---:|
| Gemini 3 Flash | 80 | 20 | 80% |
| GPT 5.2 | 80 | 20 | 80% |
| Opus 4.5 | 20 | 80 | 20% |

### **Qualitative analysis of LLM behavior**

Careful observation of gameplay revealed systematic differences in decision-making.

#### Gemini 3 Flash and GPT 5.2

In qualitative inspection of gameplay, these models often selected immediately playable cards without clear evidence of longer-horizon hand management. This observation is anecdotal and may be sensitive to the prompt template and sampling configuration.

#### Opus 4.5

In contrast, Opus 4.5 displayed behaviors consistent with longer-horizon tactics, including deliberate hand management (preserving wild cards for flexibility), proactive color control (shifting to colors held in greater quantity), occasional defensive play (drawing instead of playing the last matching card), and actions consistent with anticipating inferred opponent constraints.

### **Interpretation: hypothesis on longer-horizon decision making**

We hypothesize that the observed advantage of Opus 4.5 in our setting may reflect differences in longer-horizon decision making (e.g., preserving flexibility, controlling colors, or implicitly tracking opponent constraints). This interpretation is qualitative and requires further controlled study.

---

## **Discussion and Future Work**

### **Summary of findings**

Overall, we find that DQN is viable for Uno in the sense that the agent learns competitive strategies without hand-crafted rules. We also find that performance varies substantially across LLM-based opponents under our evaluation protocol, so opponent choice strongly affects observed win rates.

### **Limitations**

LLM evaluations are API-dependent and therefore difficult to reproduce at scale. In addition, we restrict attention to a two-player variant (excluding multi-player dynamics), and self-play training may reduce robustness to diverse opponent policies.

### **Future work**

Promising directions include integrating explicit planning (e.g., Monte Carlo tree search) with learned value functions, population-based training against diverse opponents, extension to multi-agent (3–4 player) settings, and improved opponent modeling.

---

## **Conclusion**

We presented a complete pipeline for training, evaluating, and deploying a DQN agent for Uno. Our systematic approach—from 100,000-game statistical analysis through tournament-based training to LLM tournament evaluation—yields practical artifacts and insights.

We observe large differences in win rates across the evaluated LLM opponents under our protocol. Because LLM evaluation is API-dependent and model endpoints may change over time, these results should be interpreted as conditional on the exact access configuration, and they motivate further controlled experiments and hybrid approaches that combine reinforcement learning with planning.

---

## **Reproducibility**

### **Environment setup**

Source code and instructions are available in the [accompanying repository](https://github.com/mohammed840/policy-uno).

```bash
# Clone repository
git clone https://github.com/mohammed840/policy-uno.git
cd policy-uno

# Install dependencies
pip install -e .

# Set API key for LLM evaluation (optional)
export OPENROUTER_API_KEY=your_key_here
```

### **Training and evaluation commands**

```bash
# Run game statistics simulation (random baseline)
python -m rl.game_statistics --games 100000 --seed 42

# Train DQN
python -m rl.dqn_train --iters 1000 --games_per_iter 100 --seed 42

# Evaluate a saved run
python -m rl.eval --run_id <run_id> --games 1000 --seed 42

# Generate plots for a run
python -m rl.plots --run_id <run_id>
```

### **Web server**

```bash
# Start the web application
python3 web/server.py

# Access at http://localhost:5000
```

---

**References**

- Brown, Olivia, Diego Jasson, and Ankush Swarnakar. 2020. *Winning Uno with Reinforcement Learning*. Course report, Stanford University.
- Hasselt, Hado van, Arthur Guez, and David Silver. 2016. "Deep Reinforcement Learning with Double Q-Learning." *AAAI*.
- Hessel, Matteo et al. 2018. "Rainbow: Combining Improvements in Deep Reinforcement Learning." *AAAI*.
- Kaelbling, Leslie Pack, Michael L Littman, and Anthony R Cassandra. 1998. "Planning and Acting in Partially Observable Stochastic Domains." *Artificial Intelligence*.
- Mnih, Volodymyr et al. 2015. "Human-Level Control Through Deep Reinforcement Learning." *Nature*.
- Schaul, Tom et al. 2016. "Prioritized Experience Replay." *arXiv*.
- Schulman, John et al. 2017. "Proximal Policy Optimization Algorithms." *arXiv*.
- Silver, David et al. 2017. "Mastering the Game of Go Without Human Knowledge." *Nature*.
- Wang, Ziyu et al. 2016. "Dueling Network Architectures for Deep Reinforcement Learning." *arXiv*.
- Zha, Daochen et al. 2019. "RLCard: A Toolkit for Reinforcement Learning in Card Games." *arXiv*.
