---
title: Blogs
permalink: /blogs/
---

# Blogs

{% assign blogs_sorted = site.blogs | sort: "date" | reverse %}

{% for b in blogs_sorted %}
<details class="blog-entry" style="margin: 1rem 0; padding: 0.75rem; border: 0; border-radius: 0; background: transparent;">
  <summary style="cursor: pointer; font-size: 1.25rem; font-weight: 600;">
    {{ b.title }}
    <span style="display: block; font-size: 0.85rem; font-weight: 400; color: #666; margin-top: 0.2rem;">
      {{ b.date | date: "%B %d, %Y" }}{% if b.description %} · {{ b.description }}{% endif %}
    </span>
  </summary>

  <div style="margin-top: 0.75rem;">
    <div>
      {{ b.content }}
    </div>
    <p style="margin-top: 1rem;">
      <a href="{{ b.url | relative_url }}">Read full post →</a>
    </p>
  </div>
</details>
{% endfor %}
