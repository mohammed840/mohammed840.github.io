---
title: "Text2WetLab"
date: 2026-11-17
authors: "E. O’Leary, M. Alshehri, L. Legon"
year: 2026
code: "https://github.com/PhysicalAIBenchmarks/Text2WetLab"
image: "/assets/text2wetlab/hamilton_starlet_preview.gif"
description: "Co-authored a benchmark for LLM agents that turn lab protocols and research papers into robot code, evaluated for protocol fidelity and safe execution."
---

I co-authored **Text2WetLab**, a benchmark for evaluating how LLM agents translate lab protocols and research papers into executable liquid-handling robot code.

The benchmark combines simulation, deterministic checks, and rubric-based judging to assess whether generated protocols follow the experiment correctly. Its verifier also checks for unsafe actions and reward hacking.

<figure class="blog-figure">
  <img src="{{ '/assets/text2wetlab/hamilton_starlet_preview.gif' | relative_url }}" alt="Hamilton STARlet automated protein extraction replayed in the PyLabRobot 3D visualizer" />
  <figcaption>Automated protein extraction on a Hamilton STARlet, replayed in the PyLabRobot 3D visualizer at 4× speed.</figcaption>
</figure>

[View Text2WetLab on GitHub](https://github.com/PhysicalAIBenchmarks/Text2WetLab)
