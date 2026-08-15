---
layout: post
title: "Predicting Nanoparticle Drug Delivery to the Brain with Machine Learning"
date: 2026-08-15 11:00:00
permalink: /blog/2026/machine-learning-nanoparticle-brain-drug-delivery/
description: "A comprehensive study on nanoparticle drug delivery to the brain using machine learning techniques and linear mixed-effects models across a curated dataset of 403 data points."
tags: [machine-learning, nanomedicine, pharmacology, drug-delivery, data-science]
categories: [research, bioinformatics]
featured: true
toc:
  beginning: true
---

The delivery of drugs to specific target tissues and cells in the brain poses a significant challenge in brain therapeutics, primarily due to limited understanding of how nanoparticle (NP) properties influence drug biodistribution and off-target organ accumulation.

In our study published in *Molecular Pharmaceutics* (American Chemical Society), **["A comprehensive study on nanoparticle drug delivery to the brain: application of machine learning techniques"](https://doi.org/10.1021/acs.molpharmaceut.3c00880)**, we addressed the limitations of previous research by using various predictive models based on the collection of large data sets of **403 data points** incorporating both numerical and categorical features.

---

## 1. Literature Data Analysis & Physicochemical Properties

* **Predictive Modeling:** Machine learning techniques and comprehensive literature data analysis were used to develop models for predicting NP delivery to the brain.
* **Pharmacodynamic Analysis:** The physicochemical properties of loaded drugs and NPs were analyzed through a systematic analysis of pharmacodynamic parameters such as plasma area under the curve ($\text{AUC}_{\text{plasma}}$).
* **Administration Routes:** Evaluated delivery kinetics across both the **intranasal (IN)** and **intravenous (IV)** routes.

---

## 2. Linear Mixed-Effects Models (LMEMs)

The analysis employed various linear models, with a particular emphasis on **Linear Mixed-Effects Models (LMEMs)**:

* **Exceptional Accuracy:** LMEMs demonstrated exceptional accuracy and exhibited superior performance in capturing underlying patterns among the various modeling approaches.
* **Accounting for Variations:** Effectively separated global physicochemical parameters from study-specific variations.

---

## 3. Key Findings & Experimental Validation

* **Negative Impact of Release Rate:** Factors such as the **release rate** had a negative impact on brain targeting.
* **Negative Impact of Molecular Weight:** Factors such as **molecular weight** had a negative impact on brain targeting.
* **P-gp Substrate Effect:** The model also suggests a **slightly positive impact** on brain targeting when the drug is a P-glycoprotein substrate.
* **Experimental in Vivo Validation:** The model was validated via the laboratory preparation and administration of **two distinct NP formulations** via the intranasal and intravenous routes.

---

## 4. Paper & Code Repository

* 📄 **Published Paper:** [ACS Molecular Pharmaceutics (DOI: 10.1021/acs.molpharmaceut.3c00880)](https://doi.org/10.1021/acs.molpharmaceut.3c00880)
* 💻 **Code Repository:** [github.com/Introvertuoso/BrainTargeting](https://github.com/Introvertuoso/BrainTargeting)

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
