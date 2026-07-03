---
title: Blogs
permalink: /blogs/
---

# Blogs

{% assign blogs_sorted = site.blogs | sort: "date" | reverse %}

{% for b in blogs_sorted %}
{% assign is_claimcheck_draft = false %}
{% if b.url == "/blogs/claimcheck-rl-verifier/" %}
{% assign is_claimcheck_draft = true %}
{% endif %}
<article class="blog-entry" style="margin: 1.5rem 0; padding: 1rem 0; border-bottom: 1px solid #eee;">
  <h2 style="margin: 0 0 0.3rem; font-size: 1.25rem;">{% if is_claimcheck_draft %}<span>{{ b.title }}</span>{% else %}<a href="{{ b.url | relative_url }}" style="text-decoration: none; color: inherit;">{{ b.title }}</a>{% endif %}</h2>
  <p style="margin: 0 0 0.5rem; font-size: 0.85rem; color: #666;">
    {{ b.date | date: "%B %d, %Y" }}{% if b.author %} · {{ b.author }}{% endif %}
  </p>
  {% if b.description %}
  <p style="margin: 0 0 0.5rem; color: #444;">{{ b.description }}</p>
  {% endif %}
  {% if is_claimcheck_draft %}<span style="font-size: 0.9rem; color: #666;">Read full post →</span>{% else %}<a href="{{ b.url | relative_url }}" style="font-size: 0.9rem;">Read full post →</a>{% endif %}
</article>
{% endfor %}
