---
title: Projects
permalink: /papers/
---

# Projects

{% assign projects_sorted = site.projects | sort: "date" | reverse %}

{% for p in projects_sorted %}
<article style="margin: 1.5rem 0; padding: 1rem 0; border-bottom: 1px solid #eee;">
<h2 style="margin: 0 0 0.3rem; font-size: 1.2rem;">{{ p.title }}</h2>
{% if p.date %}<p style="margin: 0 0 0.4rem; font-size: 0.85rem; color: #666;">{{ p.date | date: "%B %Y" }}</p>{% endif %}
{% if p.description %}<p style="margin: 0 0 0.5rem; color: #444;">{{ p.description }}</p>{% endif %}
<p style="margin: 0;">
{% if p.pdf %}{% assign pdf_href = p.pdf %}{% unless pdf_href contains "://" %}{% assign pdf_href = pdf_href | relative_url %}{% endunless %}<a href="{{ pdf_href }}">PDF</a>{% endif %}
{% if p.code %}{% assign code_href = p.code %}{% unless code_href contains "://" %}{% assign code_href = code_href | relative_url %}{% endunless %}{% if p.pdf %} | {% endif %}<a href="{{ code_href }}">Code</a>{% endif %}
{% if p.slides %}{% assign slides_href = p.slides %}{% unless slides_href contains "://" %}{% assign slides_href = slides_href | relative_url %}{% endunless %}{% if p.pdf or p.code %} | {% endif %}<a href="{{ slides_href }}">Slides</a>{% endif %}
{% if p.url %} | <a href="{{ p.url | relative_url }}">Read more →</a>{% endif %}
</p>
</article>
{% endfor %}
