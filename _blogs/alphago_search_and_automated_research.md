---
title: "AlphaGo, Search, and Automated AI Research"
date: 2026-05-17
layout: blog
description: "My notes from Dwarkesh Patel and Eric Jang on rebuilding AlphaGo, MCTS labeling, Tree of Thoughts, RL, off policy learning, test time scaling, and automated AI research."
---

# AlphaGo, Search, and Automated AI Research

![Go board dissolving into search and neural networks](/assets/alphago_search_blog/hero_mcts_alpha_go.png)

I watched the Dwarkesh Patel conversation with Eric Jang about rebuilding AlphaGo from scratch, and the thing that stayed with me was not only that AlphaGo is still beautiful. It was that AlphaGo gives a very concrete mental model for many questions that now feel central to language models, agents, robotics, and automated AI research.

The episode starts as a tutorial on Go and Monte Carlo Tree Search, but it slowly turns into something broader. It becomes a discussion about how to get better labels, why search can act like a teacher, why reinforcement learning can be brutally sample inefficient, why initialization matters, why off policy data is both useful and dangerous, and why current AI research agents can grind experiments but still struggle to step back and reason from first principles.

The video is here: [Dwarkesh Patel with Eric Jang](https://youtu.be/X_ZVSPcZhtw?si=IHLExWT0SNjAO_Uv).

I also reread the NeurIPS 2023 paper [Tree of Thoughts: Deliberate Problem Solving with Large Language Models](/assets/alphago_search_blog/tree_of_thoughts_paper.pdf), because Eric mentions that Google had research around tree structures for reasoning in 2023 or 2024. Tree of Thoughts is not AlphaGo for language, but it is one of the clearest attempts to ask the same question in a language setting: can a model explore multiple possible intermediate states, evaluate them, prune bad paths, and backtrack instead of committing to one left to right sample?

This post is my attempt to connect those pieces.

## 1. The core AlphaGo idea is not just RL

When people say AlphaGo is a reinforcement learning system, that is true, but it can hide the most important part. The elegant part is that AlphaGo converts search into supervised learning targets.

In a naive policy gradient setup, an agent plays a full game, receives a win or loss at the end, and then tries to increase the probability of the actions that happened in winning trajectories. That is a very weak signal. A game can have hundreds of moves, and maybe only one of those moves was the reason the game was won. If the algorithm upweights the whole trajectory, most of the update is noise.

MCTS does something different. For every state the agent actually reaches, it asks a stronger local question:

Given this state, if I search forward using my current policy and value function, what distribution over actions looks better than my first guess?

That gives a target for every visited state. Not just the final winner. Not just the whole trajectory. Every move gets relabeled with an improved action distribution.

This is why Eric frames AlphaGo as much closer to stable supervised learning than people sometimes realize. The network is trained to predict:

$$
\pi_{\theta}(a \mid s) \approx \pi_{\text{MCTS}}(a \mid s)
$$

and

$$
v_{\theta}(s) \approx z
$$

where \(z\) is the final game outcome from that state perspective.

The policy target is not just the single move that MCTS selected. It is the visit count distribution produced by search. That matters because a distribution carries more information than a one hot label. In information terms, a soft target can have much higher entropy:

$$
H(p)=\sum_i p_i \log \frac{1}{p_i}
$$

That is one of the underrated lessons. AlphaGo is not merely learning from wins. It is distilling a search procedure into a neural network. The search improves the label. The network amortizes the search. Then the next search starts from a better network.

![MCTS labeling loop with Go boards, search, and neural network](/assets/alphago_search_blog/mcts_labeling_loop.png)

The loop is:

1. Start with a policy and value network.

2. Use MCTS to improve the policy at a state.

3. Play using the improved search policy.

4. Store the state, the search distribution, and the eventual outcome.

5. Train the network to predict those improved labels.

6. Repeat.

That loop is why MCTS labeling feels like an alternative to naive RL. It turns an outcome signal into dense local targets.

## 2. How MCTS labeling works

The most useful way to think about MCTS labeling is as a local improvement operator.

Suppose the policy network sees a Go board and assigns a probability distribution over legal moves. On a 19 by 19 board, that can be up to 361 moves. The raw network might already be strong, especially if it was initialized from expert games, but it is still a fast intuition. MCTS takes that intuition and asks: if I spend compute searching from here, does the distribution become sharper and better?

At the end of the search, the visit counts become the new label:

$$
\pi_{\text{MCTS}}(a \mid s)=\frac{N(s,a)^{1/\tau}}{\sum_b N(s,b)^{1/\tau}}
$$

Here \(N(s,a)\) is the number of times search selected action \(a\) from state \(s\), and \(\tau\) controls how sharp the distribution becomes.

This is not simply choosing the argmax move. The full distribution says something like: this move is best, these two are plausible, those twenty are bad, and the rest are almost never worth visiting. That is a richer label than a single answer.

Eric connects this to DAGGER style imitation learning. In DAGGER, a learner visits states under its own policy, then an expert corrects the action at those states. The important thing is that the expert labels the states the learner actually visits, not only ideal states from a perfect demonstration distribution.

MCTS plays the expert role. Even if the game trajectory eventually loses, search can still say, at this state, a better local action would have been this distribution. That is powerful because the learner gets correction signal even in imperfect trajectories.

The guarantee is not absolute. If the value function is wrong, search can become wrong. If the number of simulations is too low, search can have high variance. If late game value estimates are bad, bad values can back up through the tree. But when the value function is grounded, search is usually a better teacher than the raw policy.

That is the deep reason initialization matters. You do not want to spend expensive search compute on garbage values. Eric’s practical advice is very sane: start from something that works. Use expert games. Use a strong open source Go bot. Use small boards. Get the rules and value head working before trying to learn everything from nothing.

In his phrasing, initialization is everything. Always start from something close to success, then make it better, rather than starting from a system that does not work and hoping learning will rescue it.

## 3. UCB and PUCT are ways of spending attention

The search problem in Go has two sides: breadth and depth.

Breadth is the number of possible actions. Depth is how far into the future you need to reason before the value of an action becomes clear. AlphaGo shrinks both. The policy network shrinks breadth by proposing promising actions. The value network shrinks depth by estimating who is likely to win without playing the whole game to the end.

Before AlphaGo, Monte Carlo search already needed a rule for deciding which branch to explore. The classic intuition comes from UCB, or upper confidence bound methods. A simple version looks like:

$$
\operatorname{UCB}(a)=Q(a)+c\sqrt{\frac{\ln N}{1+N(a)}}
$$

The first term is exploitation. It says: choose actions with high estimated value.

The second term is exploration. It says: if an action has not been tried much, give it a bonus.

PUCT modifies this idea by using the policy network prior:

$$
\operatorname{PUCT}(s,a)=Q(s,a)+c_{\text{puct}}P(s,a)\frac{\sqrt{N(s)}}{1+N(s,a)}
$$

That \(P(s,a)\) term is important. It is the neural network saying, before search, this action looks plausible. So PUCT does not explore uniformly. It explores in a policy guided way. The neural network tells search where to look first, and search corrects the neural network when deeper evaluation disagrees.

![Sparse PUCT search tree over a Go board](/assets/alphago_search_blog/puct_search_tree.png)

This is also where the notion of probability enters a deterministic game.

Go itself is deterministic. If we had infinite compute, there would be no need to talk about probabilities. From a given state, perfect play has a definite answer. But we do not search the whole tree. We sample a tiny part of it. The probabilities come from the search process and the policy prior. They describe uncertainty over which parts of the tree we will explore and which actions are promising under limited compute.

So probability in AlphaGo is not randomness in the game. It is randomness and uncertainty in the computation we can afford.

## 4. The four step MCTS process

Eric breaks MCTS into four steps:

1. Selection.

2. Expansion.

3. Evaluation.

4. Backup.

Selection walks down the current tree using PUCT. It chooses the child that looks best under the sum of value and exploration bonus.

Expansion happens when search reaches a state that is not yet in the tree. The system adds children for legal actions, often initialized with policy priors from the network.

Evaluation uses the value network to estimate the state. In original AlphaGo Lee, this could be mixed with a rollout to the end of the game. Later systems usually relied more directly on the value network.

Backup propagates the evaluated value back up the path. Each visited edge updates its count and mean value.

Mathematically, if a simulation returns value \(v\), the running action value can be updated as:

$$
Q_{\text{new}}(s,a)=\frac{N(s,a)Q(s,a)+v}{N(s,a)+1}
$$

After enough simulations, the visit counts become the search policy. That is the label the neural network learns to imitate.

The important conceptual point is that the tree is built while it is searched. Go is too large for an exhaustive tree. MCTS only expands the parts that look worth expanding.

## 5. Neural networks make search tractable

The neural network has two heads.

The policy head predicts a distribution over moves:

$$
\pi_{\theta}(a \mid s)
$$

The value head predicts the probability of winning:

$$
v_{\theta}(s)
$$

The policy head answers: where should I look?

The value head answers: how good is this state?

Together, they compress an enormous amount of possible future simulation into a fast forward pass. This is the part Eric finds profound. A relatively small neural network can amortize a search problem that looks intractable if you insist on exact enumeration.

That does not mean the network solves Go in the formal worst case sense. It means real Go positions have structure. The network learns macroscopic patterns that correlate with victory. It does not need to predict the exact future board hundreds of moves later. It needs to predict a coarser quantity: who is likely to win.

This connects to a bigger theme in AI. Many hard problems are hard in the worst case, but real distributions contain structure. Protein folding, board games, robotics, and language all contain patterns that networks can exploit. AlphaGo was one of the first systems that made that feel concrete.

## 6. Test time scaling and reasoning

One of the most interesting parts of the conversation is the connection between MCTS and test time scaling.

If you run more simulations per move, the Go bot usually gets stronger. That is test time compute. But if you train the neural network to imitate the result of search, some of that test time compute gets packed into the model. The next time you run search, it starts from a stronger prior.

That creates a tradeoff between training compute and inference compute. You can spend more compute during search, or you can train the network so that less search is needed.

This is directly relevant to language models. Modern reasoning models also spend more compute at inference time. They generate longer thoughts, check intermediate work, sample alternatives, or use tools. The open question is how much of that explicit reasoning can be distilled back into the base model.

AlphaGo gives one clean answer in a clean domain: search can produce better labels, and the network can absorb those labels.

For LLMs, the domain is much messier. Language actions are too broad, values are harder to define, and the same child is rarely sampled twice. Still, the shape of the idea is deeply relevant.

## 7. Why LLM RL often treats a whole answer as one action

Eric makes a useful point about why current LLM RL often treats an entire sampled completion as one action rather than a long multi step action sequence.

A completion is made of tokens, but the reward is often given only at the end. The code passed tests or it did not. The math answer was correct or it was not. The user preferred one response or another.

If you try to assign credit token by token, variance can explode. Which token mattered? Which intermediate sentence was responsible for success? Which part was neutral? Which part was harmful?

For an autoregressive model:

$$
\log p_{\theta}(y \mid x)=\sum_t \log p_{\theta}(y_t \mid x,y_{1:t})
$$

But the reward may apply to the whole sequence:

$$
R(y)
$$

The basic policy gradient signal has to multiply the sequence log probability by that sequence reward. If the sequence is long and most tokens are irrelevant to success, the learning signal becomes noisy.

That is why advantage estimation matters. In RL, the goal is not merely to reward winning actions. It is to reward actions that did better than expected from that state. You need a baseline, a value estimate, or a critic. Without that, you do not know whether a winning trajectory won because of a specific action or despite it.

This is where Dwarkesh’s comparison between supervised learning and RL is sharp. With supervised learning, if the correct next token is blue and your model assigns it tiny probability, the cross entropy label tells you exactly how far off you are. You get dense information immediately:

$$
\text{bits from label}=\log_2 \frac{1}{p(\text{correct})}
$$

With RL, if the model guesses wrong, it mostly learns that this sampled attempt failed. If the action space is huge, most samples are failures. You can spend a long time getting almost no useful signal.

That is why initialization matters again. If your pass rate is zero, RL may never find the first success. AlphaGo avoids much of this because MCTS can improve the local policy before the agent has to solve the entire game by luck.

## 8. Why language trees are harder than Go trees

Eric’s example of where LLMs break down is simple and important.

In Go, PUCT can revisit the same child many times. A legal move is a stable discrete object. Search can say: I have visited this move 50 times and that move 2 times.

In language, the action space is enormous. If a thought is a paragraph, the odds of sampling the exact same child twice are tiny. Even if thoughts are token sequences, the meaningful unit is not always a token. It might be a plan, a theorem step, a tool call, or a subgoal.

That means the PUCT style count bonus is not obviously the right heuristic. The expression

$$
\frac{\sqrt{N(s)}}{1+N(s,a)}
$$

assumes repeated visits to the same child are meaningful. In language, two children can be semantically similar but syntactically different. Counting exact children can miss the real structure.

This is why applying tree search to LLM reasoning is difficult. The breadth is too large, the value function is weaker, and the units of action are not naturally defined.

Still, the Tree of Thoughts paper is valuable because it tries to move the unit of search from tokens to thoughts.

![Tree of Thoughts search diagram](/assets/alphago_search_blog/tree_of_thoughts_reasoning.png)

Tree of Thoughts frames problem solving as a search over coherent language states:

$$
s=[x,z_{1:i}]
$$

Here \(x\) is the original problem, and \(z_{1:i}\) are the thoughts so far.

The method asks four questions:

1. What counts as a thought?

2. How do we generate candidate thoughts?

3. How do we evaluate partial states?

4. What search algorithm do we use?

The paper uses breadth first search for Game of 24 and creative writing, and depth first search with backtracking for crosswords. The reported Game of 24 result is striking: GPT 4 with chain of thought solved 4 percent, while Tree of Thoughts reached 74 percent.

That does not mean ToT solves reasoning. It means there are tasks where explicitly maintaining alternatives, evaluating partial progress, and backtracking can unlock capabilities that single path chain of thought misses.

The relationship to AlphaGo is not identity. AlphaGo has a clean simulator and a grounded value function. ToT has language based self evaluation. But the philosophical connection is real: reasoning improves when the model can explore a tree rather than commit to one sample.

## 9. NFSP, best response policies, AlphaStar, and OpenAI Dota

The conversation then moves to cases where you cannot easily do MCTS.

Go is perfect information and deterministic. StarCraft, Dota, robotics, and many real environments are not like that. The state is partially observed. The action space can be continuous or huge. The simulator may not be available as a clean searchable tree.

So how do you get better labels when search is not easy?

Eric points to neural fictitious self play and best response training. The idea is to fix an opponent policy, then train a best response policy against it using model free RL. If that best response becomes strong, it can provide labels for how to act against that opponent. Across many opponents, you can distill a mixed strategy.

This is related to systems like AlphaStar and OpenAI Five for Dota. They could not simply run AlphaGo style tree search over the full game. Instead, they trained policies through large scale self play, league training, best responses, and model free RL methods.

The common theme is still relabeling behavior with something better. In AlphaGo, the better teacher is MCTS. In NFSP style systems, the better teacher can be a best response policy trained against a fixed opponent.

The details differ, but the direction is similar:

1. Generate behavior.

2. Find a stronger behavior signal.

3. Distill that signal into a policy.

4. Repeat against a changing population.

This is one of the main bridges between board game search and modern agent training.

## 10. Why Q learning was huge

Q learning matters because it gives a way to propagate future value backward when direct search is not available.

The Bellman style target is:

$$
Q_{\text{target}}(s,a)=r+\gamma \max_{a'}Q(s',a')
$$

The intuition is simple. The value of taking action \(a\) in state \(s\) equals the immediate reward plus the best value you can get from the next state.

This was huge historically because many problems did not allow explicit forward search. Robotics is a good example. If you cannot search a clean game tree, you can collect trajectories, store transitions, and train a value function to satisfy consistency across time.

MCTS and Q learning both move value information backward, but they do it differently.

MCTS plans forward through simulated futures, then backs up values through the search tree.

Q learning learns from experienced transitions, then backs up value through a learned recurrence.

One plans over futures the agent has not necessarily experienced. The other learns from futures the agent has visited. That distinction is key.

## 11. Off policy data can help, but it can also poison training

The off policy discussion was one of the most practically useful parts of the episode.

Off policy data means data generated by older policies or different policies. In AlphaGo, this can happen when the replay buffer contains states from earlier versions of the model. In robotics, it can be a dataset of trajectories collected by many controllers or humans.

The danger is distribution mismatch. If your new policy would never visit a state, training heavily on that state can waste capacity or even distort behavior. You are learning what to do in parts of the world your current agent will not reach.

But off policy data can also be exactly what you want. If your policy drifts slightly away from the optimal trajectory, you need correction data. A self driving car needs to know how to recover when it veers toward the edge of the lane. A robot arm needs to know how to recover when an object slips. A Go policy needs to respond when the opponent forces a weird position.

That is why the useful off policy distribution is not arbitrary old data. It is a tube around the states your policy might reach.

![Off policy replay and relabeling diagram](/assets/alphago_search_blog/off_policy_replay.png)

Eric describes a robotics like setup:

1. Push old transition tuples into a replay buffer.

2. Use a Bellman updater or planner to compute improved targets.

3. Train the network to match those targets.

4. Use off policy estimates to reduce variance rather than blindly rewrite the objective.

His summary is that much of RL has moved toward more on policy setups because they are more stable. Off policy data is often used to shape advantages or reduce variance, not always to directly define the policy objective.

That feels very relevant for language agents. We have huge offline data, but the question is not merely whether a trajectory exists. The question is whether it lies near the behavior distribution we want the agent to learn.

## 12. Forward search as an alternative to RL

One of my strongest takeaways is that search can be an alternative route to improvement.

Naive RL says: sample trajectories, score them, reinforce the successful ones.

Search says: from a state, look ahead, evaluate futures, and improve the local action distribution before committing.

In Go, this works beautifully because the environment is deterministic, the action space is finite, and the value function is grounded. In language, it is harder. But not impossible in every domain.

Mathematics, code, theorem proving, planning, and some tool use tasks have more structure than free form conversation. They often have partial verification. A proof step can be checked. A unit test can run. A plan can be simulated. A tool call can return a state.

This is why I expect forward search to keep coming back. Maybe not as literal PUCT over tokens. Maybe as search over programs, plans, subgoals, tool traces, or thought states.

Tree of Thoughts is one early version. It uses the LLM itself to generate thoughts and evaluate states. The paper explicitly leaves more advanced search algorithms such as MCTS for future work. That is exactly the open space.

The hard part is not saying “use a tree.” The hard part is defining the node, the child, the value function, and the pruning rule in a way that does not collapse into expensive prompt sampling.

## 13. Automated AI research is good at grinding, weaker at taste

The automated research section is the part that connects most directly to what I care about.

Eric says current models are very good at hyperparameter optimization and experiment execution. In the past, researchers would define a search space over learning rate, weight decay, network depth, and so on. Then they would run grid search or Bayesian optimization.

Coding agents can search a more open space. They can inspect gradients, rewrite a data loader, add an augmentation, change a loss term, run plots, and write a report. That is much more like a junior research assistant grinding a metric.

But Eric also says the current models are weaker at choosing the next experiment within a track, and weaker at stepping back when the whole track is wrong. They can answer a well posed question, but they often do not notice that the question itself should change.

That is the first principles gap.

LLMs can be very strong locally. They can implement, debug, plot, and optimize. But research taste often requires lateral movement. It requires asking: why are we doing this experiment at all? What is the bottleneck? Is the metric lying? Is this failure an infrastructure bug or a false hypothesis? Should we abandon this direction?

![Automated research loop diagram](/assets/alphago_search_blog/automated_ai_research_loop.png)

This is why Go is an interesting research environment. It has a fast outer loop. You can test whether the bot is stronger. You can measure win rate. You can verify rules. You can run small controlled experiments. It is not the same as automating all AI research, but it creates a training ground for research skills.

The big question is whether skills learned in fast verifiable domains transfer to messier domains like robotics, drug discovery, or AI training itself.

I think the answer is probably yes, but only partially. Games teach useful habits: experiment discipline, scaling intuition, debugging, search, value estimation, infrastructure. But they can also create the wrong biases. The lesson is not that games solve research. The lesson is that automated researchers need environments where feedback is fast enough to train taste.

## 14. Local improvements do not always stack

Another important point is that local improvements may not compose.

In real training systems, one researcher can find a trick that improves a metric, another can find a different trick, and the two tricks together can make things worse. Compute multipliers can be correlated. A method that helps at one scale may stop mattering at another scale.

Eric connects this to the bitter lesson. In the long run, compute and scale dominate. In the present, we still need heuristics because compute is finite and initialization is imperfect.

So research taste is partly about knowing which heuristics are worth using now, and which are temporary scaffolds that will disappear when the scale changes.

That is also why automated research is not just parallel search over ideas. Parallel agents can try many things, but someone or something still needs a top down model of what should stack, what should be isolated, and what should be abandoned.

## 15. My main takeaways

The first takeaway is that AlphaGo is an argument for better labels.

The central trick is not only self play. It is that search produces improved local targets. The system does not have to wait for a sparse final reward to explain everything.

The second takeaway is that initialization is not optional.

Starting from expert data or a working smaller setup is not cheating. It is how research becomes tractable. A system with zero pass rate may never learn. A system with a weak but real signal can hill climb.

The third takeaway is that value functions are the compression point.

A value function lets you stop searching. It turns a huge future into a scalar estimate. That is why Go becomes tractable, and why LLM reasoning remains hard. If the value function for partial thoughts is weak, search becomes expensive or misleading.

The fourth takeaway is that language search needs better units.

Tokens are usually too small. Whole answers are too large. Tree of Thoughts proposes thoughts as the unit. Tool traces, proof states, code edits, and plans may be even better units in specific domains.

The fifth takeaway is that automated AI research is already useful, but mostly inside well framed loops.

Models can run experiments, tune hyperparameters, generate plots, and debug implementation issues. They are weaker at deciding that the current frame is wrong. That is where first principles reasoning and research taste still matter.

The sixth takeaway is that off policy data is not good or bad in isolation.

It depends where the data sits relative to the states your current policy can reach. A replay buffer near the policy distribution can teach recovery. A replay buffer far away can waste capacity.

The seventh takeaway is that test time scaling and distillation form a powerful cycle.

Search spends compute to improve behavior. Training distills that behavior into the network. Then future search starts from a stronger place. That loop is one of the cleanest pictures of how reasoning and learning can compound.

## 16. The open question

The question I keep coming back to is this:

Can we build an AlphaGo like improvement loop for language agents without pretending language is Go?

The answer cannot be literal MCTS over tokens. The child space is too large. Exact child revisits are rare. Values are fuzzy. Many tasks do not have a clean simulator.

But the deeper pattern still seems right.

We need systems that can generate alternatives, evaluate partial progress, backtrack, relabel their own behavior with stronger targets, and distill that improvement into future policy.

That might look like Tree of Thoughts for toy reasoning tasks. It might look like tool trace search for agents. It might look like verifier guided proof search for math. It might look like replay plus relabeling for robotics. It might look like automated research loops where models propose experiments, run them, and learn which research moves actually improve outer loop performance.

AlphaGo remains important because it gives a working example of the full loop:

1. Search makes a policy better.

2. The better policy becomes training data.

3. The neural network absorbs the search.

4. The next search starts stronger.

5. The system compounds.

That is the part I find most interesting. Not AlphaGo as a historical Go bot, but AlphaGo as a template for turning expensive deliberation into cheap intuition.

That template is still not fully solved for LLMs. But it feels like one of the roads we keep circling back to.
