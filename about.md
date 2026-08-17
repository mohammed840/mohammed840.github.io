---
layout: null
permalink: /about/
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Mohammed Alshehri — RL Resident Researcher at Prime Intellect." />
    <title>Mohammed Alshehri</title>
    <link rel="stylesheet" href="{{ '/assets/profile.css' | relative_url }}" />
  </head>
  <body>
    <main class="profile-shell">
      <header class="profile-header">
        <h1>Mohammed Alshehri</h1>
        <p class="intro">
          RL Resident Researcher at <a href="https://www.primeintellect.ai/" target="_blank" rel="noreferrer">Prime Intellect</a>,
          working on long-horizon reinforcement learning environments, agentic systems, and the infrastructure that makes capable models more reliable.
        </p>
      </header>

      <section class="accordion" aria-label="Profile sections">
        <details open>
          <summary>About</summary>
          <div class="section-copy">
            <p>
              I grew up between Dublin, Ireland, and London, UK. I’m currently an RL Resident Researcher at Prime Intellect,
              where I work on long-horizon reinforcement learning environments: training agents to reason, act, and improve over extended tasks.
            </p>
            <p>
              My work sits at the intersection of reinforcement learning, language models, agent evaluation, and research systems.
              I’m interested in the gap between impressive short demonstrations and reliable, sustained problem-solving in the real world.
            </p>
          </div>
        </details>

        <details>
          <summary>Projects</summary>
          <div class="section-copy">
            <p>Research projects, experiments, and papers on reinforcement learning, agents, and evaluation.</p>
            <div class="item-list">
              {% assign projects_sorted = site.projects | sort: "date" | reverse %}
              {% for project in projects_sorted %}
              <a class="item" href="{{ project.url | relative_url }}">
                <span class="item-title">{{ project.title }}</span>
                {% if project.description %}<span class="item-description">{{ project.description }}</span>{% endif %}
                <span class="item-action">Read project →</span>
              </a>
              {% endfor %}
            </div>
          </div>
        </details>

        <details>
          <summary>Blogs</summary>
          <div class="section-copy">
            <p>Notes on RL, long-horizon reasoning, research infrastructure, and building AI systems.</p>
            <div class="item-list">
              {% assign blogs_sorted = site.blogs | sort: "date" | reverse %}
              {% for blog in blogs_sorted %}
              <a class="item" href="{{ blog.url | relative_url }}">
                <span class="item-title">{{ blog.title }}</span>
                {% if blog.description %}<span class="item-description">{{ blog.description }}</span>{% endif %}
                <span class="item-action">Read blog →</span>
              </a>
              {% endfor %}
            </div>
          </div>
        </details>
      </section>

      <div class="signal-rule" aria-label="Upward reward signal">
        <svg viewBox="0 0 240 42" role="img" aria-labelledby="signal-title">
          <title id="signal-title">An upward reward signal</title>
          <path class="signal-baseline" d="M2 35H238" />
          <path class="signal-path" d="M2 33 L22 31 L38 34 L55 27 L72 29 L89 22 L105 25 L122 17 L140 20 L157 12 L174 16 L193 7 L210 10 L238 2" />
        </svg>
      </div>

      <footer class="profile-footer">
        <a href="https://github.com/mohammed840" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/mohammed-alshehri-0a8ab81b1/" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="https://x.com/M0EGPT" target="_blank" rel="noreferrer">X</a>
        <a href="https://www.goodreads.com/user/show/196070681-mohammed-alshehri" target="_blank" rel="noreferrer">Goodreads</a>
      </footer>
    </main>
    <script src="{{ '/assets/js/profile.js' | relative_url }}"></script>
  </body>
</html>
