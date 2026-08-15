---
layout: post
title: "Sysurv: Discovering Subgroups with Exceptional Survival Characteristics"
date: 2026-08-15 12:00:00
permalink: /blog/2026/sysurv-exceptional-survival-subgroups/
description: "An overview of Sysurv, a fully differentiable, non-parametric method that leverages random survival forests to learn individual survival curves and automatically learn conditions and inherently interpretable rules to select subgroups with exceptional survival characteristics."
tags: [machine-learning, survival-analysis, subgroup-discovery, pytorch, explainable-ai]
categories: [research, machine-learning]
featured: true
toc:
  beginning: true
---

In many applications, it is important to identify subpopulations that survive longer or shorter than the rest of the population. In medicine, for example, it allows determining which patients benefit from treatment, and in predictive maintenance, which components are more likely to fail.

In our paper, **["Discovering Subgroups with Exceptional Survival Characteristics"](https://arxiv.org/abs/2602.22179)** (arXiv:2602.22179), we propose **Sysurv**, a fully differentiable, non-parametric method that leverages random survival forests to learn individual survival curves, automatically learns conditions and how to combine these into inherently interpretable rules, so as to select subgroups with exceptional survival characteristics.

---

## 1. Limitations of Existing Methods

Existing methods for discovering subgroups with exceptional survival characteristics suffer from three key limitations:

* **Restrictive Survival Model Assumptions:** They require restrictive assumptions about the survival model (e.g., proportional hazards).
* **Pre-Discretized Features:** They require pre-discretized features, discarding fine-grained numerical information prior to search.
* **Overlooking Individual Deviations:** As they compare average statistics, they tend to overlook individual deviations in survival trajectories.

---

## 2. The Sysurv Method

Sysurv addresses these limitations through a non-parametric, fully differentiable framework:

* **Learning Individual Survival Curves:** Sysurv leverages **Random Survival Forests** to learn individual survival curves without imposing restrictive parametric or proportional hazards assumptions:
  $$\hat{S}(t \mid x_i) = \exp\left(-\hat{\Lambda}(t \mid x_i)\right)$$
* **Automatic Rule Learning:** It automatically learns conditions and how to combine these into inherently interpretable rules so as to select subgroups with exceptional survival characteristics.
* **Empirical Evaluation:** Empirical evaluation on a wide range of datasets and settings, including a case study on cancer data, shows that Sysurv reveals insightful and actionable survival subgroups, outperforming the state of the art.

---

## 3. Python Implementation & Usage

The official Python implementation of the paper is available in the [Sysurv GitHub repository](https://github.com/Introvertuoso/Sysurv). We additionally provide a demo in a Jupyter notebook (`Demo.ipynb`) to provide an easy starting point.

### Required Packages
* `pytorch` for learning.
* `scikit-survival` for survival analysis.
* `matplotlib` for plotting.
* `tqdm` for progress bars.
* `ipykernel` for Jupyter notebooks.

### Environment Setup
You can use the Mamba environment manager to install the required packages like so:

```bash
git clone https://github.com/Introvertuoso/Sysurv.git
cd Sysurv

mamba env create -f environment.yml
mamba activate sysurv
```

### Folder Organization
* `src`: Contains the source code of Sysurv.
* `data`: Contains the dataset used for the case study in the paper and the demo (`data/case_study/`).
* `Demo.ipynb`: Shows how to use Sysurv on the case study dataset and replicate the survival curve plots.

---

## 4. Paper & Citation

* 📄 **Preprint:** [arXiv:2602.22179 [cs.LG]](https://arxiv.org/abs/2602.22179)
* 💻 **Repository:** [github.com/Introvertuoso/Sysurv](https://github.com/Introvertuoso/Sysurv)

```bibtex
@article{Al_Rahwanji_2026,
  title = {Discovering Subgroups with Exceptional Survival Characteristics},
  author = {Al Rahwanji, Mhd Jawad and Xu, Sascha and Walter, Nils Philipp and Vreeken, Jilles},
  journal = {arXiv preprint arXiv:2602.22179},
  year = {2026}
}
```
