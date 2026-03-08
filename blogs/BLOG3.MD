## How RL Changed My Taste in AI Systems


https://static.wixstatic.com/media/ffcc74_86af4274cf7446699a0886b717af801d~mv2.jpg/v1/fill/w_174,h_174,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/ffcc74_86af4274cf7446699a0886b717af801d~mv2.jpg


I used to treat reinforcement learning as a mysterious corner of machine learning where agents somehow “figure it out” through trial and error. The more I read, the more I realized that the mystery comes from a single twist: the feedback is delayed, noisy, and often sparse. Once you accept that, RL stops being magic and starts being a very specific kind of optimization problem that punishes sloppy assumptions.



What follows is the learning path that actually worked for me. It is a narrative, not a curriculum. It is the sequence of conceptual hooks, coding milestones, and debugging habits that took me from vague fascination to being able to implement, diagnose, and iterate on RL systems with confidence. : I worked through Richard Sutton’s book, read through David Silver’s course, watched John Schulmann’s lectures,

https://static.wixstatic.com/media/ffcc74_f1d2538a28dc4cc4901c7c56c9e99caa~mv2.png/v1/fill/w_616,h_161,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_f1d2538a28dc4cc4901c7c56c9e99caa~mv2.png


# The first real mental model: a feedback loop with delayed consequences



Supervised learning feels clean because you can measure error immediately. You show the model an input, you compare its output to a label, and the gradient tells you what to do next. Reinforcement learning replaces the label with consequence. The agent takes an action now, and the environment may not tell you whether that was a good idea until much later.



This gap between action and outcome is the heart of RL. It creates the credit assignment problem, which is not just a theoretical phrase. It is the practical reason training can look like nothing is happening for a long time, and the reason seemingly minor implementation mistakes can silently destroy learning.


https://static.wixstatic.com/media/ffcc74_b484daa68cdf46ba99abac6cbe07b180~mv2.jpg/v1/fill/w_616,h_244,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/ffcc74_b484daa68cdf46ba99abac6cbe07b180~mv2.jpg


A useful way to frame this is to say that RL is optimization under delayed feedback. The objective is simple to state: maximize expected return. The difficulty is that the return is produced by a chain of decisions interacting with a world that may be stochastic, partially observed, and high dimensional.



What I had to learn early: what the agent is really optimizing



At the center of RL is a policy, often written as π(a|s). You can think of it as a function that maps what the agent observes to either an action or a distribution over actions. The policy is trained so that actions that lead to higher return become more likely.



What surprised me is that most of the intellectual work in RL is not about inventing new objectives, but about getting stable, trustworthy estimates of how to change the policy parameters. If those estimates are noisy, biased, or too high variance, learning becomes fragile. If they are stable, RL becomes surprisingly “engineerable.”



The fork in the road: value-based and policy-based thinking



I stopped feeling lost when I learned to separate RL approaches into two viewpoints. One viewpoint learns how good actions are, and then acts by selecting the best predicted action. The other viewpoint directly learns how to act by optimizing the policy itself.


https://static.wixstatic.com/media/ffcc74_76702d9b585145d7a8aff51fcc2cac6e~mv2.png/v1/fill/w_616,h_462,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_76702d9b585145d7a8aff51fcc2cac6e~mv2.png

The value-based viewpoint revolves around learning a value function or a Q function. The attraction is obvious: if you can estimate Q(s,a) well, decision making is straightforward. But the cost is that learning Q with function approximation is notoriously unstable unless you are very careful.



The policy-based viewpoint optimizes π(a|s) directly. It feels noisier at first because you are sampling actions and then using the outcomes to push probabilities up or down. But it scales naturally to large or continuous action spaces and tends to be the default for modern deep RL systems.



The bridge between these two viewpoints is actor-critic methods, where a critic estimates values to reduce variance, while the actor remains the policy being optimized.


# The sequence that finally worked for me: build intuition in layers


I made the mistake of starting with deep RL papers and trying to absorb everything at once. The better route was to build up in layers, where each layer gives you intuition that the next layer relies on.



I started with the simplest possible setting: bandits. There is no state and no long horizon. You choose an arm, you get a reward. That taught me why exploration is not a side detail, and why naive greedy selection locks you into suboptimal behavior. Bandits taught me the emotional truth of RL: you must sometimes choose what looks worse right now to learn what is actually best.



Then I moved to tabular Markov decision processes. This is where Bellman backups became real. Value iteration and policy iteration are not just algorithms, they are the cleanest way to internalize the structure of sequential decision making. Once you have run them yourself, “bootstrapping” stops being a buzzword. You can feel why it works and why it sometimes fails.



Only after that did I move to function approximation. That step is where RL becomes dangerous. When values are approximated by neural networks, targets move, samples correlate, and instability becomes the default. The first time you see an apparently correct implementation diverge, you realize RL is as much about controlling training dynamics as it is about objective functions.



This is also the point where DQN makes sense as a set of stabilizers rather than a single idea. Experience replay helps break correlations. Target networks slow down the movement of targets. And careful exploration schedules prevent the agent from collapsing into a premature habit.



After DQN, I learned REINFORCE, because it is the simplest policy gradient algorithm and the cleanest conceptual bridge from supervised learning. The key realization is that the “label” can be the action you sampled, and the “weight” on the loss can be the return or advantage. That one mental link made RL feel less alien. It looks like supervised learning on your own data, except the data distribution keeps changing as your policy changes, and the weighting comes from outcomes.



Finally, I learned PPO, which was the first algorithm that consistently felt usable. PPO’s core contribution is that it tries to prevent policy updates from changing behavior too aggressively. In practice, this is the difference between learning that progresses steadily and learning that oscillates or collapses.


https://static.wixstatic.com/media/ffcc74_1a3e46ac4d954e4dadf3059e48da0301~mv2.png/v1/fill/w_616,h_462,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_1a3e46ac4d954e4dadf3059e48da0301~mv2.png


This is also where I started to appreciate that modern RL is a bundle of details that you cannot skip. When PPO works, it is because the objective, advantage estimation, normalization, clipping, batching, and logging all cooperate. When it fails, the failure is often in one of those details rather than in the “idea” of PPO.

# Reward design taught me humility


If I had to summarize the biggest non-obvious lesson, it is that reward design is the real specification language of RL. The agent does not learn what you meant. It learns what you measured.



If the reward can be hacked, the agent will find the hack. If the reward encourages a proxy, the agent will optimize the proxy and ignore your intention. The first time you watch an agent do something that technically maximizes reward but is clearly wrong, you stop treating reward shaping as a harmless convenience.



What helped me was treating reward as a contract. Every reward term must have a clear purpose, and every term must be separately logged so you can see what the agent is trading off. If you only track total reward, you will not know whether progress is coming from the behavior you want or from an exploit you accidentally introduced.


# RL became practical when I started debugging it like systems work


The day RL became “real” for me was when I stopped treating it as a purely mathematical discipline and started treating it like engineering. That meant verifying environment mechanics, simplifying tasks until the agent can overfit, watching rollouts rather than trusting curves, and tracking training diagnostics that reveal failure early.



Entropy told me whether exploration was dying. KL divergence told me whether policy updates were too aggressive. Value loss told me when the critic was destabilizing the actor. Return variance told me whether my advantage estimates were too noisy.



Most importantly, I learned to change one variable at a time. RL can look like a slot machine when you tune everything simultaneously. It becomes legible when you isolate causes.


# Why learning RL changed how I think about LLMs and product systems

After learning RL, I stopped seeing it as “robots and games.” I started seeing it as a general tool for aligning behavior under feedback, especially when feedback is partial or delayed. That maps cleanly onto modern post-training for language models, where preferences, edits, ratings, and downstream success metrics act like rewards.



The same credit assignment problem exists in conversational systems. A user’s satisfaction may depend on an earlier clarification question, a formatting choice, or a reasoning step that is not explicitly labeled. RL methods, when used carefully, are a way of turning messy signals into learning pressure.



I also started to respect the limits. RL is powerful, but it is not automatic. If the environment is expensive, if rewards are too sparse, or if you cannot generate enough diverse interactions, your agent may never discover the behaviors you want. That is why practical systems often combine imitation learning, offline data, structured curricula, and careful evaluation loops instead of relying on raw online exploration.


# conclusion


Learning reinforcement learning felt like learning a new way to think. At first it looked mystical because the agent improves without explicit supervision. Then it looked bleak because training can fail silently for dozens of reasons. Eventually it became motivating because, once the fundamentals are clear, you can design learning systems that adapt under feedback in a principled way.



If I had to boil the journey down to one line, it would be this: reinforcement learning is simple to describe, difficult to stabilize, and incredibly revealing about what you actually asked a system to optimize.
