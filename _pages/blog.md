---
layout: default
permalink: /blog/
title: Blog
nav: true
nav_order: 2
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1
    after: 3
---

<div class="post">

{% assign blog_name_size = site.blog_name | size %}
{% assign blog_description_size = site.blog_description | size %}

{% if blog_name_size > 0 or blog_description_size > 0 %}
  <div class="header-bar">
    <h1>{{ site.blog_name }}</h1>
    <h2>{{ site.blog_description }}</h2>
  </div>
{% endif %}

{% if site.display_tags.size > 0 or site.tags.size > 0 or site.display_categories.size > 0 %}
  <div class="tag-scroll-wrapper">
    <div class="tag-scroll-banner" id="tag-filter-banner">
      <button type="button" class="tag-chip active-chip" data-filter="all">
        <i class="fa-solid fa-layer-group fa-xs"></i> All
      </button>
      {% for category in site.display_categories %}
        <button type="button" class="tag-chip category-chip" data-filter-type="category" data-filter="{{ category | slugify }}">
          <i class="fa-solid fa-tag fa-xs"></i> {{ category }}
        </button>
      {% endfor %}
      {% assign blog_tags = site.display_tags %}
      {% if blog_tags == blank or blog_tags.size == 0 %}
        {% assign blog_tags = site.tags | map: 0 %}
      {% endif %}
      {% for tag in blog_tags %}
        <button type="button" class="tag-chip hashtag-chip" data-filter-type="tag" data-filter="{{ tag | slugify }}">
          <i class="fa-solid fa-hashtag fa-xs"></i> {{ tag }}
        </button>
      {% endfor %}
    </div>
  </div>
{% endif %}

{% assign featured_posts = site.posts | where: "featured", "true" %}
{% if featured_posts.size > 0 %}
  <div class="featured-posts-section">
    <div class="section-title-sm">
      <i class="fa-solid fa-star fa-xs"></i> Featured Articles
    </div>
    <div class="row row-cols-1 row-cols-md-2 g-3">
    {% for post in featured_posts %}
      {% assign post_tags = post.tags | join: ' ' | slugify %}
      {% assign post_cats = post.categories | join: ' ' | slugify %}
      <div class="col featured-col" data-tags="{{ post_tags }}" data-categories="{{ post_cats }}">
        <a href="{{ post.url | relative_url }}" class="featured-card-link">
          <div class="card featured-card h-100">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge-pinned"><i class="fa-solid fa-thumbtack fa-xs"></i> Pinned</span>
                {% if post.external_source == blank %}
                  {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
                {% else %}
                  {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
                {% endif %}
                <span class="read-time-pill">{{ read_time }} min read</span>
              </div>
              <h3 class="card-title featured-title">{{ post.title }}</h3>
              <p class="card-text featured-description">{{ post.description }}</p>
              <div class="mt-auto pt-2 post-meta-bottom">
                <i class="fa-solid fa-calendar-day fa-xs"></i> {{ post.date | date: '%B %d, %Y' }}
              </div>
            </div>
          </div>
        </a>
      </div>
    {% endfor %}
    </div>
  </div>
{% endif %}

  <!-- Empty state container for no matching filter results -->
  <div id="no-filter-results" class="text-center py-5" style="display: none;">
    <p class="text-muted mb-3"><i class="fa-solid fa-magnifying-glass fa-2x mb-2 d-block"></i> No articles found matching "<span id="current-filter-label" class="font-weight-bold"></span>".</p>
    <button type="button" class="btn btn-sm btn-outline-primary" onclick="window.resetBlogFilter()">Show All Articles</button>
  </div>

  <div class="all-articles-header">
    <div class="section-title-sm">
      <i class="fa-solid fa-newspaper fa-xs"></i> Articles
    </div>
  </div>

  <ul class="post-list">
    {% if page.pagination.enabled %}
      {% assign postlist = paginator.posts %}
    {% else %}
      {% assign postlist = site.posts %}
    {% endif %}

    {% for post in postlist %}
      {% if post.external_source == blank %}
        {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      {% else %}
        {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
      {% endif %}
      {% assign year = post.date | date: "%Y" %}
      {% assign tags_str = post.tags | join: " " | slugify %}
      {% assign cats_str = post.categories | join: " " | slugify %}

      <li class="post-item" data-tags="{{ tags_str }}" data-categories="{{ cats_str }}">
        <h3>
          {% if post.redirect == blank %}
            <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
          {% elsif post.redirect contains '://' %}
            <a class="post-title" href="{{ post.redirect }}" target="_blank">{{ post.title }}</a>
            <svg width="2rem" height="2rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          {% else %}
            <a class="post-title" href="{{ post.redirect | relative_url }}">{{ post.title }}</a>
          {% endif %}
        </h3>
        <p>{{ post.description }}</p>
        <p class="post-meta">
          {{ read_time }} min read &nbsp; &middot; &nbsp;
          {{ post.date | date: '%B %d, %Y' }}
          {% if post.external_source %}
            &nbsp; &middot; &nbsp; {{ post.external_source }}
          {% endif %}
        </p>
        <p class="post-tags">
          <a href="{{ year | prepend: '/blog/' | prepend: site.baseurl}}">
            <i class="fa-solid fa-calendar fa-sm"></i> {{ year }}
          </a>

          {% if post.tags.size > 0 %}
            &nbsp; &middot; &nbsp;
            {% for tag in post.tags %}
              <a href="javascript:void(0);" class="filter-tag-link" data-filter="{{ tag | slugify }}">
                <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}
              </a>
              {% unless forloop.last %}&nbsp;{% endunless %}
            {% endfor %}
          {% endif %}

          {% if post.categories.size > 0 %}
            &nbsp; &middot; &nbsp;
            {% for category in post.categories %}
              <a href="javascript:void(0);" class="filter-tag-link" data-filter="{{ category | slugify }}">
                <i class="fa-solid fa-tag fa-sm"></i> {{ category }}
              </a>
              {% unless forloop.last %}&nbsp;{% endunless %}
            {% endfor %}
          {% endif %}
        </p>
      </li>
    {% endfor %}
  </ul>

  {% if page.pagination.enabled %}
    {% include pagination.liquid %}
  {% endif %}

</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
  const filterBanner = document.getElementById('tag-filter-banner');
  const filterButtons = document.querySelectorAll('#tag-filter-banner .tag-chip');
  const postItems = document.querySelectorAll('.post-list .post-item');
  const featuredSection = document.querySelector('.featured-posts-section');
  const featuredCards = document.querySelectorAll('.featured-posts-section .featured-col');
  const noResultsMsg = document.getElementById('no-filter-results');

  function applyFilter(filterVal) {
    filterVal = (filterVal || 'all').toLowerCase().trim();

    filterButtons.forEach(function (btn) {
      const btnFilter = btn.getAttribute('data-filter');
      if (btnFilter === filterVal) {
        btn.classList.add('active-chip');
      } else {
        btn.classList.remove('active-chip');
      }
    });

    let visibleCount = 0;

    postItems.forEach(function (item) {
      const tags = (item.getAttribute('data-tags') || '').toLowerCase().split('-');
      const rawTags = (item.getAttribute('data-tags') || '').toLowerCase();
      const rawCats = (item.getAttribute('data-categories') || '').toLowerCase();

      if (filterVal === 'all' || rawTags.includes(filterVal) || rawCats.includes(filterVal)) {
        item.style.display = '';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (featuredSection) {
      let featuredVisible = 0;
      featuredCards.forEach(function (card) {
        const rawTags = (card.getAttribute('data-tags') || '').toLowerCase();
        const rawCats = (card.getAttribute('data-categories') || '').toLowerCase();
        if (filterVal === 'all' || rawTags.includes(filterVal) || rawCats.includes(filterVal)) {
          card.style.display = '';
          featuredVisible++;
        } else {
          card.style.display = 'none';
        }
      });
      featuredSection.style.display = (featuredVisible > 0) ? '' : 'none';
    }

    if (noResultsMsg) {
      if (visibleCount === 0) {
        noResultsMsg.style.display = 'block';
        const labelSpan = document.getElementById('current-filter-label');
        if (labelSpan) labelSpan.textContent = filterVal;
      } else {
        noResultsMsg.style.display = 'none';
      }
    }

    if (filterVal === 'all') {
      if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
      }
    } else {
      history.replaceState(null, null, '#' + encodeURIComponent(filterVal));
    }
  }

  window.resetBlogFilter = function () {
    applyFilter('all');
  };

  if (filterBanner) {
    filterBanner.addEventListener('click', function (e) {
      const btn = e.target.closest('.tag-chip');
      if (!btn) return;
      e.preventDefault();
      const filterVal = btn.getAttribute('data-filter');
      applyFilter(filterVal);
    });
  }

  document.addEventListener('click', function (e) {
    const link = e.target.closest('.filter-tag-link');
    if (!link) return;
    e.preventDefault();
    const filterVal = link.getAttribute('data-filter');
    applyFilter(filterVal);
    if (filterBanner) {
      window.scrollTo({ top: filterBanner.offsetTop - 70, behavior: 'smooth' });
    }
  });

  if (window.location.hash) {
    const hashFilter = decodeURIComponent(window.location.hash.substring(1));
    if (hashFilter) {
      applyFilter(hashFilter);
    }
  }
});
</script>
