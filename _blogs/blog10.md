---
title: "From Scaling To Research: Reflections On The Ilya Sutskever Conversation With Dwarkesh"
date: 2026-03-24
author: "Mohammed Alshehri"
description: "Sutskever argues the age of scaling is ending — it is back to the age of research, now with big computers. A reflection on what this means for AI, generalization, and the future of intelligence."
---

## From Scaling To Research: Reflections On The Ilya Sutskever Conversation With Dwarkesh

There is a moment in the recent Dwarkesh Podcast episode with Ilya Sutskever that captures a turning point in how the AI community understands its own progress. Sutskever, one of the central figures behind modern deep learning and now the founder of Safe Superintelligence Inc., looks back at the last few years and says, in effect: the era when simply scaling models was the main engine of progress is ending. It is time to return to the age of research, only this time with very large computers in the background. ([Dwarkesh Podcast][1])



The phrase sounds almost modest, but it carries a sharp edge. For a long stretch of the 2020s, the main recipe for progress was clear. Train larger transformers, on more data, with more compute, and new capabilities would appear. Companies invested staggering sums into GPUs and data centers precisely because this recipe was low risk and highly legible. If performance did not reach some desired level, you scaled again. The Dwarkesh episode gives voice to an emerging unease with that story. It asks whether raw scale has done most of what it can do within the current paradigm and whether the real bottleneck has quietly shifted back to something harder to buy: fundamentally new ideas. ([Teahose][2])



To understand the weight of that claim, it helps to revisit what the scaling era actually accomplished and where its limits have become visible.


# What The Scaling Era Really Delivered



The successes of the scaling era are undeniable. Starting from the early transformer models and extending through increasingly large generations of language and multimodal models, the same core pattern repeated: increase the number of parameters, the volume and diversity of training data, and the compute budget, and the model becomes more capable across a wide variety of tasks. Performance curves on benchmarks for translation, question answering, coding, and reasoning improved in a surprisingly smooth fashion as model and data scale grew. This was not just correlation but a robust engineering fact that teams around the world were able to reproduce.



This repeated success gave rise to a seductive narrative. Intelligence was treated as an emergent property of large scale prediction. If a system can predict the next token with sufficiently rich internal representations, it will eventually be able to solve almost any task that can be formulated in language or code. Under this view, there was no sharp conceptual boundary between current models and more advanced ones. The difference was mostly one of scale and refinement.



Companies and labs acted accordingly. Effort flowed into training ever larger models and building the infrastructure required to support them. The core architecture, while refined, remained recognizably the same. The main bet was that more of the same would carry the field all the way to artificial general intelligence, or at least close enough that the remaining distance would be bridged by incremental improvements.



The Dwarkesh conversation does not deny any of this. Instead, it takes these successes as given, then asks why the gap between benchmark performance and real world impact still feels so large.


# The Generalization Gap At The Heart Of The Podcast 

One of the central themes of the Ilya Sutskever episode is the persistent gap between how models perform on evaluations and how they behave in messy, real world settings. Sutskever notes that current systems can achieve excellent, sometimes superhuman, scores on a wide range of benchmarks, yet they still generalize dramatically worse than humans when faced with new tasks or slightly shifted conditions. ([podchemy.com][3])



This is more than a complaint about occasional hallucinations or failures. It points to a deeper structural issue. If a model can ace difficult tests but still behave in fragile, surprising, or obviously flawed ways in deployment, then something about its inner organization is misaligned with our intuitive notion of understanding. The system is very good at performing well in carefully specified evaluation regimes. It is less good at robustly solving problems that are only partially specified, open ended, or qualitatively different from what it saw before.



In the podcast and in summaries of it, this is sometimes framed as the problem of generalization. Human beings, even teenagers learning to drive, can acquire new complex skills with surprisingly little explicit data, guided by an internal sense of what matters and what counts as a correct or safe outcome. Models, by contrast, often require orders of magnitude more data and still fail in obvious ways when taken slightly off their training manifold. ([podchemy.com][3])



This mismatch is at the core of Sutskever’s claim that simply scaling up more of the same will not solve the problem. If models already have vast capacity and training data, and yet their generalization remains qualitatively different from human generalization, then the issue is not just that they are not big enough.


# Performance, Intelligence, And The Limits Of External Optimization

Another way to look at the argument in the podcast is through the distinction between performance and intelligence. The scaling era optimized performance. It targeted measurable outcomes: benchmark scores, task accuracy, user satisfaction ratings, reward models in reinforcement learning from human feedback. These are all external signals. The model is trained to produce outputs that match targets or please evaluators, but it does not have an internal concept of why those outputs are good.



In the Dwarkesh interview, Sutskever alludes to the idea that human emotions play a role similar to an internal value function. Emotions, in this view, are a compact, evolutionarily shaped mechanism that guides behavior and learning without requiring constant external rewards. They provide immediate feedback about what is desirable or dangerous, even in situations that have never been encountered before. ([podchemy.com][3])



Current AI systems, by contrast, do not have a robust internal value function. They have parameter settings that encode statistical patterns, and they have been shaped by large scale optimization procedures to match some objective. However, there is no simple, interpretable inner structure that corresponds to a stable sense of what is good or bad across different contexts.



This matters because intelligence, in the deeper sense, seems to require internally guided behavior. An intelligent system should be able to evaluate its own thoughts, to prefer some strategies over others, and to pursue goals consistently even when external feedback is sparse or delayed. External supervision alone can approximate this in narrow regimes, but it does not automatically give rise to the kind of unified, coherent inner evaluation that human minds appear to have.



The podcast suggests, implicitly and at times explicitly, that this is one of the reasons why the pure scaling strategy is running out of conceptual steam. Scaling improves performance relative to external metrics, but it does not obviously build the internal machinery that would turn these systems into agents with robust, humanlike generalization. 


# Why Sutskever Says The Age Of Scaling Is Over


In the Dwarkesh episode and in subsequent coverage, Sutskever describes the last few years as an age of scaling, roughly from 2020 to 2025, during which compute was the dominant bottleneck and pretraining provided a clear, low risk pathway to improvement. Now, he argues, that situation has changed. The scale of current models and training runs is already enormous. The question he poses is whether increasing that scale another hundred times would transform the situation in a fundamental way, and his answer is that it probably would not. ([Teahose][2])



This does not mean that larger models would not be different or more capable in many respects. It means that the underlying conceptual problems, especially the generalization gap and the lack of deep internal value structures, would still be waiting on the other side of that investment. More data and compute will produce refinements. They are unlikely on their own to resolve the mismatch between benchmark brilliance and real world brittleness.



Hence the phrase that has been echoed in articles and summaries of the interview: the age of scaling is over, and it is back to the age of research, now with big computers. The ordering in that sentence matters. Research comes first, compute second. Compute is still extremely important, but its role is to empower new ideas rather than to stand in for them.


# The Return Of Ideas As The Bottleneck

One of the more thought provoking observations associated with the podcast and its commentary is Sutskever’s remark that there are now more companies than ideas. During the scaling era, the path to relevance was clear. You obtained access to large amounts of compute, trained foundation models, built products around them, and refined the process. Many organizations pursued more or less the same strategy, differentiated by resources, execution, and product design, but not by fundamentally different conceptions of how intelligence should work. ([podchemy.com][3])



If scaling is no longer the main frontier, this balance changes. The true bottleneck shifts back toward novel, high impact ideas about architectures, learning mechanisms, and ways of integrating AI into the world. Compute continues to be necessary to demonstrate and scale those ideas, but it is not the scarce ingredient in the same way.



This vision has historical echoes. In earlier decades, researchers often had interesting ideas but lacked the compute to prove them convincingly. That made it hard to tell which concepts were genuinely powerful and which were artifacts of small experiments. Today, as Sutskever points out, the situation is inverted. Compute is relatively abundant at the upper end of the field. It is now possible to test the viability of new architectures or training tricks at meaningful scales, at least within large labs and well resourced startups. The limiter is the flow of ideas that are truly different from what has already been tried.



The implication is that the next big advances in AI will look less like parameter count announcements and more like conceptual breakthroughs. They may involve new ways to represent knowledge, new forms of interaction between agents and environments, or new understanding of how to embed value functions inside learning systems in a robust way. They will likely be tested on large hardware, but their origin will be intellectual, not economic.


# Safety, Alignment, And The Need For Internal Structure

Another important thread that runs through the Ilya Sutskever conversation is the relationship between capability, safety, and the overall trajectory toward superintelligent systems. As head of Safe Superintelligence Inc., Sutskever explicitly frames his work around the idea of building extremely powerful AI that is safe by design. ([Dwarkesh Podcast][1])



This concern interacts directly with the end of the scaling era. If one believes that pure scaling will not automatically produce systems with humanlike generalization or robust internal value structures, then safety cannot be an afterthought applied on top of ever larger models. It has to be built into the way those models are conceived and trained from the beginning.



In the podcast, there is a repeated emphasis on understanding what is missing from current models, especially in terms of their internal evaluation mechanisms. If emotions in humans function as a primitive but powerful value network, then something analogous may be needed in AI systems if they are to behave coherently and safely in a wide range of situations. This is not a matter of adding more data to the pretraining corpus. It is a research question about how to formalize and implement something like internal values in a machine.



Here again, scaling is necessary but not sufficient. Training such systems will require large compute budgets, but the question of what exactly is being trained and why becomes central. In that sense, the shift from scaling to research is also a shift from a mainly external view of AI behavior to a more internal one, where the structure of the system and its self evaluation processes are just as important as its external outputs.



# Economic And Cultural Consequences Of A Post Scaling Turn

The framing of the Dwarkesh Podcast episode has implications beyond pure research. If a field moves from a regime where progress is mostly a function of capital and engineering to one where it depends more heavily on ideas and scientific taste, the competitive landscape changes. Large companies still enjoy advantages in data, compute, and deployment. However, their success becomes more dependent on their ability to cultivate and recognize deep conceptual work, not only on their capacity to run enormous training jobs.



For smaller teams and independent researchers, this shift can be both daunting and encouraging. It means that brute force replication of large model training runs is unlikely to be a winning strategy. At the same time, it opens the possibility that genuinely novel insights about architectures, learning processes, or evaluation can matter again, even if they begin in more modest settings.



Culturally, moving from scaling to research can also influence how the community talks about progress. In a scaling dominated era, charts showing performance versus compute and parameter count carry a great deal of weight. In a research driven era, progress may be more uneven and harder to quantify in the short term. New ideas can take time to mature and may initially underperform simpler baselines before revealing their strengths. Patience and conceptual clarity become more important virtues than the ability to show smooth, upward trending curves.


#  What Might The Next Era Actually Look Like

Trying to predict the specific technical shape of the post scaling era is speculative, but it is possible to outline some themes that align with the concerns raised in the Ilya Sutskever podcast.



One likely theme is richer interaction. Instead of treating training as a one way process of ingesting static data, more systems may learn through ongoing interaction with environments, humans, or other agents. This could allow them to build internal models of cause and effect and to refine their behavior using feedback that is not neatly packaged as supervised labels.



Another is explicit structure. Current models rely heavily on implicit representations that emerge from end to end training. Future systems might include more explicit modules for memory, planning, self evaluation, and environment modeling, with architectures designed to encourage certain kinds of reasoning rather than hoping that such capabilities emerge spontaneously from scale.



A third is internal value modeling. Inspired in part by the discussion of emotions and value functions in the podcast, research may aim to encode something like a learned but stable evaluation layer inside models, so they have a consistent way to assess their own actions and thoughts across many situations. Achieving this would require blending insights from machine learning, cognitive science, and philosophy, since it touches on the nature of goals, preferences, and ethical constraints.



All of these directions are demanding. None can be reduced to a simple formula of more parameters plus more data. They represent exactly the sort of research agenda that an age of research, as Sutskever describes it, is meant to prioritize.


# A Turning Point, Not A Dead End

Seen in this light, the Ilya Sutskever episode of the Dwarkesh Podcast is not a funeral for scaling but a reframing of its role. Scaling has taken AI remarkably far. It has revealed how much can be done with a single architecture pushed very hard. It has also clarified the limits of that approach, especially around generalization, internal values, and the gap between evaluation metrics and real world effectiveness.



Declaring that the age of scaling is over is not a claim that AI progress will slow to a halt. It is a statement that the simple story of bigger models as the main path forward is no longer enough. The field is entering a more complex, and in some ways more interesting, phase in which ideas, architectures, and deep research questions reclaim center stage, supported rather than overshadowed by the immense compute that the scaling era left behind.



In that sense, the conversation between Sutskever and Dwarkesh is a marker of transition. It acknowledges the achievements of the past few years while insisting that the most important work still lies ahead, not in building yet another scaled up version of the same system, but in asking what kind of system is needed in the first place if we want machines that truly generalize, reason, and align with human values.



[1]: https://www.dwarkesh.com/p/ilya-sutskever-2?utm_source=chatgpt.com "Ilya Sutskever – We're moving from the age of scaling to ..."

[2]: https://www.teahose.com/podcast/Dwarkesh/Ilya%20Sutskever%20%E2%80%93%20We%27re%20moving%20from%20the%20age%20of%20scaling%20to%20the%20age%20of%20research?utm_source=chatgpt.com "Ilya Sutskever – We're moving from the age of scaling to the ..."

[3]: https://www.podchemy.com/notes/ilya-sutskever-the-age-of-scaling-is-over-45724979786?utm_source=chatgpt.com "Podcast Notes /// Ilya Sutskever – The age of scaling is over"