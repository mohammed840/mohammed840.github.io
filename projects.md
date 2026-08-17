---
title: Projects
permalink: /projects/
---

<h1>Projects</h1>
<p class="collection-intro">Research projects, experiments, and papers on reinforcement learning, agents, and evaluation.</p>

{% assign projects_sorted = site.projects | sort: "date" | reverse %}

{% for p in projects_sorted %}
<article class="collection-entry">
<a class="collection-title" href="{{ p.url | relative_url }}">{{ p.title }}</a>
{% if p.date %}<span class="collection-meta">{{ p.date | date: "%B %Y" }}</span>{% endif %}
{% if p.description %}<p class="collection-description">{{ p.description }}</p>{% endif %}
<a class="collection-action" href="{{ p.url | relative_url }}">Read project →</a>
</article>
{% endfor %}
