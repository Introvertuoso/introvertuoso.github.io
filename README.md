# Mhd Jawad Al Rahwanji - Academic Website

Personal academic homepage and portfolio hosted at [introvertuoso.github.io](https://introvertuoso.github.io/).

Built with [Jekyll](https://jekyllrb.com/) and based on the [al-folio](https://github.com/alshedivat/al-folio) theme.

---

## Features & Content

* **Publications & Citations:** Managed via [`_bibliography/papers.bib`](_bibliography/papers.bib) with automatic weekly citation updates from Google Scholar (`bin/update_citations.py`).
* **Activities & Recreation:** Categorized projects showcasing academic activities (Teaching, Talks, Reviewing) and personal recreation (Cooking, Art, Photography) in [`_projects/`](_projects/).
* **News & Announcements:** Chronological updates in [`_news/`](_news/).
* **Curriculum Vitae:** Structured background and downloadable PDF support configured in [`_data/cv.yml`](_data/cv.yml) and [`_pages/cv.md`](_pages/cv.md).

---

## Local Development

### Prerequisites
* Ruby (3.2+) & Bundler
* Python (for citation sync)

### Running Locally
```bash
# 1. Install dependencies
bundle install

# 2. Start local Jekyll server
bundle exec jekyll serve

# 3. Open in browser
# Navigate to http://localhost:4000
```

### Updating Google Scholar Citations
Citation counts update automatically every Sunday via GitHub Actions. To trigger manually:
```bash
python bin/update_citations.py
```

---

## Deployment

Pushes to the `master` branch automatically build and publish the site to GitHub Pages via the [Deploy workflow](.github/workflows/deploy.yml).
