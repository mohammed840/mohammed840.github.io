---
title: Blogs
permalink: /blogs/
---

<h1>Blogs</h1>
<p class="collection-intro">Notes on RL, long-horizon reasoning, research infrastructure, and building AI systems.</p>

{% assign blogs_sorted = site.blogs | sort: "date" | reverse %}
{% assign pinned_blogs = "" | split: "" %}
{% assign regular_blogs = "" | split: "" %}
{% for b in blogs_sorted %}
  {% if b.pinned %}
    {% assign pinned_blogs = pinned_blogs | push: b %}
  {% else %}
    {% assign regular_blogs = regular_blogs | push: b %}
  {% endif %}
{% endfor %}

{% for b in pinned_blogs %}
<article class="collection-entry">
  <a class="collection-title" href="{{ b.url | relative_url }}">📌 {{ b.title }}</a>
  <span class="collection-meta">{{ b.date | date: "%B %d, %Y" }}{% if b.author %} · {{ b.author }}{% endif %}</span>
  {% if b.description %}<p class="collection-description">{{ b.description }}</p>{% endif %}
  <a class="collection-action" href="{{ b.url | relative_url }}">Read blog →</a>
</article>
{% endfor %}

{% for b in regular_blogs %}
<article class="collection-entry">
  <a class="collection-title" href="{{ b.url | relative_url }}">{{ b.title }}</a>
  <span class="collection-meta">{{ b.date | date: "%B %d, %Y" }}{% if b.author %} · {{ b.author }}{% endif %}</span>
  {% if b.description %}<p class="collection-description">{{ b.description }}</p>{% endif %}
  <a class="collection-action" href="{{ b.url | relative_url }}">Read blog →</a>
</article>
{% endfor %}
