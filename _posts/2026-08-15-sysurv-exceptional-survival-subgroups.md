---
layout: post
title: "Sysurv: Discovering Subgroups with Exceptional Survival Characteristics"
date: 2026-08-15 12:00:00
permalink: /blog/2026/sysurv-exceptional-survival-subgroups/
description: "An overview of Sysurv, a fully differentiable, non-parametric method for discovering interpretable subgroups with exceptional survival outcomes using Random Survival Forests."
tags: [machine-learning, survival-analysis, subgroup-discovery, pytorch, explainable-ai]
categories: [research, machine-learning]
featured: true
toc:
  beginning: true
---

In survival analysis, identifying subpopulations that survive significantly longer or shorter than the general population is a cornerstone of precision medicine and reliability engineering. For example, in oncology, discovering which patient subgroups have exceptionally good or poor survival trajectories allows clinicians to determine who benefits from specific therapies and tailor personalized interventions.

In our paper, **["Discovering Subgroups with Exceptional Survival Characteristics"](https://arxiv.org/abs/2602.22179)** (arXiv:2602.22179), we propose **Sysurv**—a fully differentiable, non-parametric method that leverages Random Survival Forests to learn individual survival curves and discover inherently interpretable rules that select exceptional survival subgroups.

In this post, we explain the core principles behind Sysurv and how to run the method using our open-source [Sysurv Python implementation](https://github.com/Introvertuoso/Sysurv).

---

## The Challenge of Exceptional Survival Subgroup Discovery

Existing approaches to subgroup discovery in time-to-event data typically suffer from three key limitations:

1. **Restrictive Model Assumptions:** Traditional methods often rely on proportional hazards assumptions (e.g., Cox Proportional Hazards), which fail when hazard ratios change over time or when complex non-linear feature interactions exist.
2. **Pre-Discretization Bias:** Many rule-mining techniques require continuous physiological features (such as biomarker levels or age) to be pre-discretized into rigid intervals before search, discarding valuable gradient information.
3. **Overlooking Individual Heterogeneity:** Methods that compare only aggregate group statistics (such as median survival time) frequently overlook nuanced individual deviations in survival trajectories.

---

## How Sysurv Works

Sysurv addresses these limitations through a two-stage formulation:

1. **Non-Parametric Individual Survival Estimation:** First, Sysurv fits a **Random Survival Forest (RSF)** on the dataset to estimate individual cumulative hazard functions $\hat{\Lambda}(t \mid x_i)$ and corresponding individual survival curves:
   $$\hat{S}(t \mid x_i) = \exp\left(-\hat{\Lambda}(t \mid x_i)\right)$$
   This captures non-linear relationships and high-order feature interactions without imposing parametric or proportional hazards assumptions.

2. **Differentiable Rule Optimization:** Sysurv then formulates subgroup selection as a differentiable optimization problem. It learns soft condition boundaries directly over continuous features and optimizes rule combinations via gradient descent in PyTorch, balancing survival divergence against rule complexity to produce human-readable, actionable rules.

---

## Running Sysurv

The official Python implementation is available in the [Sysurv GitHub repository](https://github.com/Introvertuoso/Sysurv).

### 1. Installation

```bash
git clone https://github.com/Introvertuoso/Sysurv.git
cd Sysurv
pip install -r requirements.txt
```

### 2. Basic Usage

```python
from src.configs import SySurvConfig
from src.methods import SySurv
from src.utils import load_case_study_data

# Load dataset
dataset = load_case_study_data()

# Configure hyperparameters
config = SySurvConfig(
    alpha=0.1,          # Complexity regularization weight
    lr=0.01,            # Learning rate
    max_epochs=1000,    # Optimization epochs
    num_subgroups=3     # Number of target subgroups
)

# Fit Sysurv and extract exceptional subgroups
model = SySurv(config)
subgroups = model.fit(dataset)

for i, sg in enumerate(subgroups, 1):
    print(f"Subgroup #{i}: {sg.rule_description}")
```

---

## Resources & Citation

* 📄 **Preprint:** [arXiv:2602.22179 [cs.LG]](https://arxiv.org/abs/2602.22179)
* 💻 **Code:** [github.com/Introvertuoso/Sysurv](https://github.com/Introvertuoso/Sysurv)
* 💬 **BibTeX:**

```bibtex
@article{Al_Rahwanji_2026,
  title = {Discovering Subgroups with Exceptional Survival Characteristics},
  author = {Al Rahwanji, Mhd Jawad and Xu, Sascha and Walter, Nils Philipp and Vreeken, Jilles},
  journal = {arXiv preprint arXiv:2602.22179},
  year = {2026}
}
```
