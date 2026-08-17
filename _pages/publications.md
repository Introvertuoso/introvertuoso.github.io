---
layout: page
permalink: /publications/
title: Publications
description: Peer-reviewed journal articles, conference & workshop papers, and preprints.
nav: true
nav_order: 1
header_card: scholar
---

<!-- _pages/publications.md -->
<div class="publications">

{% bibliography %}

<script>
(function() {
  var headings = document.querySelectorAll('.publications h2.bibliography');
  headings.forEach(function(h2) {
    var nextElem = h2.nextElementSibling;
    if (nextElem && (nextElem.tagName === 'OL' || nextElem.classList.contains('bibliography'))) {
      var details = document.createElement('details');
      details.className = 'collapsible-category';
      details.open = true;

      var summary = document.createElement('summary');
      summary.className = 'category-summary';
      summary.innerHTML = '<h2 class="category">' + h2.innerHTML + '</h2><i class="fa-solid fa-chevron-down category-chevron"></i>';

      h2.parentNode.insertBefore(details, h2);
      details.appendChild(summary);
      details.appendChild(nextElem);
      h2.remove();
    }
  });
})();
</script>

</div>
