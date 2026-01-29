---
title: Papers
permalink: /papers/
---

{% assign papers_sorted = site.papers | sort: "date" | reverse %}

{% for p in papers_sorted %}
<details style="margin: 1rem 0; padding: 0.75rem; border: 0; border-radius: 0; background: transparent;">
  <summary style="cursor: pointer; font-size: 1.25rem; font-weight: 600;">
    {{ p.title }}
  </summary>

  <div style="margin-top: 0.75rem;">
    <p>
      {% if p.pdf %}
        {% assign pdf_href = p.pdf %}
        {% unless pdf_href contains "://" %}{% assign pdf_href = pdf_href | relative_url %}{% endunless %}
        <a href="{{ pdf_href }}">PDF</a>
      {% endif %}
      {% if p.code %}
        {% assign code_href = p.code %}
        {% unless code_href contains "://" %}{% assign code_href = code_href | relative_url %}{% endunless %}
        {% if p.pdf %} | {% endif %}<a href="{{ code_href }}">Code</a>
      {% endif %}
      {% if p.slides %}
        {% assign slides_href = p.slides %}
        {% unless slides_href contains "://" %}{% assign slides_href = slides_href | relative_url %}{% endunless %}
        {% if p.pdf or p.code %} | {% endif %}<a href="{{ slides_href }}">Slides</a>
      {% endif %}
    </p>

    <div>
      {{ p.content }}
    </div>
  </div>
</details>

---
{% endfor %}
