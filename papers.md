---
title: Papers
permalink: /papers/
---

{% assign papers_sorted = site.papers | sort: "date" | reverse %}

{% for p in papers_sorted %}
## [{{ p.title }}]({{ p.url }})

{% if p.authors %}**Authors:** {{ p.authors }}
{% endif %}
{% if p.venue %}**Venue:** {{ p.venue }}
{% endif %}
{% if p.year %}**Year:** {{ p.year }}
{% endif %}

{% if p.abstract %}
{{ p.abstract }}
{% endif %}

{% if p.pdf %}
  {% assign pdf_href = p.pdf %}
  {% unless pdf_href contains "://" %}{% assign pdf_href = pdf_href | relative_url %}{% endunless %}
  [PDF]({{ pdf_href }})
{% endif %}
{% if p.code %}
  {% assign code_href = p.code %}
  {% unless code_href contains "://" %}{% assign code_href = code_href | relative_url %}{% endunless %}
  {% if p.pdf %} | {% endif %}[Code]({{ code_href }})
{% endif %}
{% if p.slides %}
  {% assign slides_href = p.slides %}
  {% unless slides_href contains "://" %}{% assign slides_href = slides_href | relative_url %}{% endunless %}
  {% if p.pdf or p.code %} | {% endif %}[Slides]({{ slides_href }})
{% endif %}

---
{% endfor %}
