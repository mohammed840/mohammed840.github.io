Teaching an LLM to Coach Itself: Multi-Agent Math Tutoring with Reinforcement Learning



training a Solver-Coach-Reviser system on Hendrycks MATH using Tinker RL and Qwen3-8B.







Introduction



What if a language model could not only solve math problems, but also review its own work, spot its mistakes, and fix them?



That's exactly what we set out to build. In this project we trained a multi-agent math coaching system where a single LLM plays three distinct roles:



1. Solver  attempts the problem step-by-step and produces a final answer.

2. Coach  reviews the Solver's work, identifies the first mistake, classifies the error type (arithmetic, algebra, logic, etc.), and gives a targeted fix instruction.

3. Reviser  takes the Coach's feedback and produces a corrected solution.



The entire pipeline is trained end-to-end with reinforcement learning using verifiable rewards (RLVR). The reward signal is simple and unambiguous: does the final revised answer match the ground-truth answer? Correct = 1, incorrect = 0, with a small +0.1 bonus when the Coach actually fixes a wrong first attempt.



We used Tinker RL  a cloud-based RL training platform  to fine-tune Qwen/Qwen3-8B with LoRA adapters, trained on 500 problems from the Hendrycks MATH dataset over 200 gradient steps. The training used an importance-sampling loss with GRPO-style per-group advantage centering: for each problem we sampled multiple rollouts, centered the rewards within each group, and used the normalized advantages to weight the policy gradient.



This blog walks through our setup, the training process, and what the five key diagnostic plots tell us about what the model learned (and didn't learn).







The Setup



Model & Infrastructure



- Base model: Qwen/Qwen3-8B (single model, three role-specific prompts)

- Fine-tuning: LoRA rank 32, training MLP + attention + unembed layers

- Platform: Tinker RL (cloud GPU training with importance-sampling loss)

- Optimizer: Adam, learning rate 1e-5, no weight decay



Data



- Training set: 500 problems sampled from Hendrycks MATH (all levels, all types)

- Eval set: 5 problems (lightweight periodic eval during training)

- Dataset: Hendrycks MATH  a benchmark of 12,500 competition-level math problems spanning algebra, geometry, number theory, counting & probability, and more



Training Loop



Each of the 200 training steps works like this:



1. Sample 4 problems from the training set.

2. Roll out 2 independent episodes per problem (group_size=2), each episode running the full Solver → Coach → Reviser pipeline.

3. Compute rewards: compare the Reviser's final answer to ground truth.

4. Compute GRPO advantages: within each group of 2 rollouts on the same problem, center and normalize the rewards.

5. Build training data: construct token-level Datum objects with prompt masking (zero advantage/logprob on prompt tokens, actual values on response tokens).

6. Forward-backward + optimizer step via Tinker's `importance_sampling` loss.

7. Log per-step metrics (reward, accuracy before/after, tokens used, KL divergence proxy).



The Three Prompts



The Solver gets a straightforward instruction to solve step-by-step and output `FINAL: <answer>`. The Coach is asked to return structured JSON identifying the error type, the first wrong step, and a minimal fix instruction. The Reviser receives the original problem, the Solver's attempt, and the Coach's JSON feedback, then produces a corrected solution.







The Results: Five Diagnostic Plots



After training completed, we generated five plots to diagnose what happened during the 200-step run. Let's walk through each one.







Reward Curve Over Training Steps


https://static.wixstatic.com/media/ffcc74_943abe9949e246c9bc8da4a08abb47f2~mv2.png/v1/fill/w_740,h_444,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_943abe9949e246c9bc8da4a08abb47f2~mv2.png




Reward Curve





This is the headline metric the mean reward per training step, shown as both the raw per-step values (light blue) and a rolling mean with a window of 20 steps (dark blue).



What we see: The reward is noisy (expected with batch_size=4 and group_size=2  only 8 episodes per step), oscillating between 0.0 and 0.8. The rolling mean hovers in the 0.10–0.30 range  throughout training. There's an initial spike around step 0–5 (likely easy problems in the first batches), a dip around steps 60–75, a recovery peaking near step 90–100, and then a gradual settling around 0.15–0.20 for the remainder.



Interpretation: The model is learning something  the reward doesn't collapse to zero  but the overall accuracy remains low. This is not surprising for competition-level math with an 8B model and only 200 steps of LoRA training. The high variance suggests the model's performance is heavily problem-dependent: it can solve some problems but struggles with others. The lack of a clear upward trend after step 100 suggests the model may be near the ceiling of what this training budget can achieve, or that the learning rate / batch size needs tuning for more stable improvement.







 Accuracy Before vs After Coach


https://static.wixstatic.com/media/ffcc74_c04e16b9a5764af7a3e1c7e5d8d9924f~mv2.png/v1/fill/w_740,h_444,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_c04e16b9a5764af7a3e1c7e5d8d9924f~mv2.png






Accuracy Curves





This plot compares two rolling-mean accuracy curves over training: the orange line is the Solver's first-pass accuracy (before the Coach intervenes), and the green line is the accuracy after the full Coach → Reviser pipeline.



What we see: Both curves track each other closely, generally in the 0.10–0.25 range. The "Before Coach" (Solver-only) accuracy and the "After Coach" (Revised) accuracy are nearly overlapping throughout training, with the Solver-only curve sometimes slightly *above* the revised curve.



Interpretation: This is the most revealing plot. The Coach is not consistently improving the Solver's answers. In an ideal scenario, the green line should be clearly above the orange line  meaning the Coach catches mistakes and the Reviser fixes them. Instead, the two are interleaved, which means:



- The Coach sometimes gives bad advice that causes the Reviser to change a correct answer to an incorrect one.

- The Coach may fail to identify the actual error, leading the Reviser to make unhelpful changes.

- With only 200 training steps, the model hasn't learned to reliably distinguish correct from incorrect reasoning.



This is a key finding: the multi-agent coaching loop is a harder task than single-pass solving, and the 8B model at this training budget hasn't cracked it yet.







Fix Rate by Error Type Over Training


https://static.wixstatic.com/media/ffcc74_35f93fa7d5e848fe8f97b24733795074~mv2.png/v1/fill/w_740,h_444,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_35f93fa7d5e848fe8f97b24733795074~mv2.png






Fix Rate by Error Type





This plot breaks down the Coach's effectiveness by error type. Each colored line shows the rolling fix rate (fraction of times the Coach's intervention led to a correct revised answer) for a specific error category.



What we see:



- Formatting errors (pink) have the highest fix rate, reaching nearly 1.0 between steps 75–140, then dropping sharply around step 150. This makes sense  formatting errors (e.g., wrong answer format) are the easiest to identify and fix.

- Arithmetic errors (orange) start with a fix rate around 0.25–0.33 early on, then decline to ~0.10 by mid-training.

- Algebra errors (teal) hover around 0.05–0.15 for most of training.

- Simplification and other errors (gray) are volatile, spiking early then declining.

- Logic, misread, geometry, and counting errors remain near 0.0 throughout  the Coach essentially never successfully fixes these.



Interpretation: The model learns to fix surface-level errors (formatting) but struggles with deeper mathematical reasoning errors. This aligns with what we'd expect: identifying that an answer is in the wrong format is much easier than spotting a subtle algebraic manipulation error. The drop in formatting fix rate after step 150 is interesting  it could indicate the policy drifting (the Coach starts misclassifying errors or giving less precise instructions as training progresses).







Efficiency  Accuracy vs Tokens per Episode



https://static.wixstatic.com/media/ffcc74_d7feaa48b4e6479cb13a85567142dc74~mv2.png/v1/fill/w_740,h_444,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_d7feaa48b4e6479cb13a85567142dc74~mv2.png





Efficiency

)





This scatter plot shows the relationship between tokens consumed per episode (x-axis) and after-Coach accuracy (y-axis). Each light purple dot is one training step; the dark purple line is a rolling trend.



What we see: Most episodes consume between 1,050 and 1,280 tokens. The accuracy values are spread across the full range (0.0 to 0.75), with no clear correlation between token usage and accuracy. The rolling trend line clusters in the lower-right region (high tokens, low accuracy), showing that as training progresses, the model tends to use more tokens without gaining accuracy.



Interpretation: The model is not becoming more token-efficient over training. In fact, the trend suggests mild verbosity creep  the Solver, Coach, and Reviser are generating longer outputs as training progresses, but this extra length doesn't translate to better answers. This is a common failure mode in RL-trained language models: the policy learns to generate longer responses (perhaps hedging or adding unnecessary steps) without improving correctness. A token penalty in the reward function or a max-token constraint could help address this.







KL Divergence Over Training Steps



https://static.wixstatic.com/media/ffcc74_c04e16b9a5764af7a3e1c7e5d8d9924f~mv2.png/v1/fill/w_740,h_444,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ffcc74_c04e16b9a5764af7a3e1c7e5d8d9924f~mv2.png







)





This plot tracks the importance-sampling (IS) loss as a proxy for KL divergence between the current policy and the reference (base) policy. The light orange line is the raw per-step IS loss; the dark orange line is the rolling mean (window=20).



What we see: The IS loss is highly volatile, swinging between roughly -1,000 and +600 The rolling mean starts deeply negative (around -600 at step 0), rises toward 0 by step 40–50, stabilizes around -50 to -100 for the middle portion of training, and then dips slightly more negative toward the end.



Interpretation: The large magnitude and high variance of the IS loss indicate significant policy divergence from the base model. The negative values suggest the current policy assigns lower probability to the sampled trajectories than the reference policy did meaning the model is actively moving away from its base behavior. The stabilization in the middle of training is a good sign (the policy isn't diverging catastrophically), but the late-training dip suggests the policy may be starting to overfit or drift again. In a longer run, adding explicit KL regularization (a KL penalty term in the reward) would help keep the policy closer to the base model and prevent mode collapse.







Key Takeaways



What Worked



1. The pipeline runs end-to-end. The Solver → Coach → Reviser loop, GRPO advantage computation, Tinker integration, and JSONL logging all function correctly. This is a solid foundation for scaling up.



2. The model learns something. Rewards don't collapse to zero; the model maintains ~15–20% accuracy on competition-level math, which is non-trivial for an 8B model with minimal training.



3. Formatting errors get fixed. The Coach reliably identifies and fixes formatting issues, showing the model can learn the easier aspects of self-correction.



4. Training is stable. Despite the noisy rewards, the KL divergence doesn't explode, and the model doesn't degenerate into gibberish. The importance-sampling loss keeps things in check.



 What Didn't Work (Yet)



1. The Coach doesn't reliably improve answers. The before-vs-after accuracy curves overlap, meaning the coaching loop is roughly break-even. The Coach sometimes *hurts* performance by giving bad advice.



2. Deep mathematical errors remain unfixed. Logic, geometry, counting, and misread errors have near-zero fix rates. The 8B model at this training budget can't learn to diagnose these.



3. Token efficiency degrades. The model gets wordier without getting smarter a classic RL failure mode.



4. 200 steps isn't enough. With batch_size=4 and group_size=2, we only see 800 unique problem-rollout pairs during training. Competition math likely needs orders of magnitude more training signal.



What We'd Do Next



- Scale up: More training steps (1,000+), larger batch sizes, and a larger eval set for more reliable metrics.

- Larger model: Try Qwen3-32B or 72B  the coaching task may require more capacity.

- KL regularization: Add an explicit KL penalty to the reward to prevent policy drift.

- Token penalty: Penalize excessive token usage to encourage concise reasoning.

- Curriculum learning: Start with easier problems (Level 1–2) and gradually increase difficulty.

- Separate Coach training: Consider training the Coach role separately with supervised examples of good error identification before RL fine-tuning.





Conclusion



We built a multi-agent math coaching system where a single Qwen3-8B model plays Solver, Coach, and Reviser, trained end-to-end with Tinker RL on the Hendrycks MATH dataset. Over 200 training steps with LoRA fine-tuning, the model learned to maintain baseline math-solving ability and fix surface-level formatting errors, but the Coach role didn't reliably improve deeper mathematical reasoning.



The five diagnostic plots paint a clear picture: the reward signal is noisy but non-zero, the coaching loop is roughly break-even, fix rates are error-type-dependent, token efficiency degrades over training, and the policy diverges moderately from the base model. These are all expected behaviors for a first 200-step run and provide clear directions for improvement.



The most important insight is that self-correction in math is hard  even for a model that can solve some problems on its first pass, learning to reliably *critique and fix* its own work requires substantially more training signal and possibly more model capacity. But the infrastructure is in place, the pipeline works, and the diagnostic tools give us clear visibility into what's happening. The next step is to scale up and iterate.







*Built with [Tinker RL](https://tinker.thinkingmachines.ai) · Model: Qwen/Qwen3-8B · Dataset: Hendrycks MATH · Training: 200 steps, LoRA rank 32, importance-sampling loss with GRPO advantages*