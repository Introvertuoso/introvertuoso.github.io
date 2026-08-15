---
layout: post
title: "Predicting Nanoparticle Drug Delivery to the Brain with Machine Learning"
date: 2026-08-15 11:00:00
permalink: /blog/2026/machine-learning-nanoparticle-brain-drug-delivery/
description: "A machine learning study using Linear Mixed-Effects Models across 403 data points to evaluate how nanoparticle and drug physicochemical properties govern brain targeting efficiency."
tags: [machine-learning, nanomedicine, pharmacology, drug-delivery, data-science]
categories: [research, bioinformatics]
featured: true
toc:
  beginning: true
---

The delivery of therapeutics to specific target tissues and cells in the brain poses a significant challenge in brain therapeutics, primarily due to a limited understanding of how nanoparticle (NP) properties influence drug biodistribution and off-target organ accumulation.

In our study published in *Molecular Pharmaceutics* (American Chemical Society), **["A comprehensive study on nanoparticle drug delivery to the brain: application of machine learning techniques"](https://doi.org/10.1021/acs.molpharmaceut.3c00880)**, we addressed the limitations of previous research by developing predictive machine learning models based on a curated dataset of 403 data points.

In this post, we summarize the methodology, modeling insights, and key pharmacological findings from the paper, along with our open-source [BrainTargeting repository](https://github.com/Introvertuoso/BrainTargeting).

---

## The Curated Dataset: 403 Data Points

To systematically evaluate the determinants of brain delivery, we assembled a comprehensive dataset comprising **403 data points** incorporating both numerical and categorical descriptors:

* **Physicochemical Properties:** Characteristics of the loaded drugs and nanoparticle carriers (such as molecular weight, particle size, surface charge/zeta potential, and drug release rate).
* **Pharmacokinetic Parameters:** Parameters including plasma Area Under the Curve ($\text{AUC}_{\text{plasma}}$), brain Area Under the Curve ($\text{AUC}_{\text{brain}}$), and brain targeting metrics.
* **Administration Routes:** Comparing systemic Intravenous (IV) vs. direct Intranasal (IN) administration.

---

## Machine Learning & Statistical Modeling

The study analyzed the physicochemical and pharmacokinetic features using various linear modeling approaches:

* **Linear Mixed-Effects Models (LMEMs):** Among the evaluated models, LMEMs demonstrated superior performance in capturing underlying data patterns across heterogeneous experimental settings by accounting for grouped random effects.
* **Feature Analysis:** Evaluating the directional impact and statistical significance of individual physicochemical parameters on brain targeting efficiency.

---

## Key Pharmacological Findings

Our modeling and analysis revealed several key relationships governing brain drug delivery:

1. **Molecular Weight ($M_w$):** Higher drug molecular weight exhibited a **negative impact** on brain targeting efficiency.
2. **Drug Release Rate:** A higher release rate had a **negative impact** on brain targeting, indicating that rapid premature release in systemic circulation reduces the amount delivered to the brain.
3. **P-Glycoprotein (P-gp) Substrates:** The model suggested a **slightly positive impact** on brain targeting when the encapsulated drug is a P-glycoprotein substrate.
4. **Experimental Validation:** The model was experimentally validated through the laboratory preparation and in vivo administration of **two distinct nanoparticle formulations** via both the **intranasal (IN)** and **intravenous (IV)** routes.

---

## Code & Resources

* 📄 **Published Article:** [ACS Molecular Pharmaceutics (DOI: 10.1021/acs.molpharmaceut.3c00880)](https://doi.org/10.1021/acs.molpharmaceut.3c00880)
* 💻 **Code Repository:** [github.com/Introvertuoso/BrainTargeting](https://github.com/Introvertuoso/BrainTargeting)
* 💬 **BibTeX:**

```bibtex
@article{Yousfan_2023,
  author = {Yousfan, Amal and Al Rahwanji, Mhd Jawad and Hanano, Abdulsamie and Al-Obaidi, Hisham},
  title = {A comprehensive study on nanoparticle drug delivery to the brain: application of machine learning techniques},
  journal = {Molecular Pharmaceutics},
  volume = {21},
  number = {1},
  pages = {333--345},
  year = {2023},
  publisher = {American Chemical Society},
  doi = {10.1021/acs.molpharmaceut.3c00880}
}
```
