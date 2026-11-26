---
title: VecTorch
description: An embedded vector-search baseline built to make storage semantics, exact-search correctness, profiling, and scale limits inspectable.
repo: cemalgurselkar/VecTorch
technologies: [Python, NumPy, Pytest, Docker]
featured: false
order: 3
draft: false
links:
  - label: README
    url: https://github.com/cemalgurselkar/VecTorch/blob/8a88749bb565e3507fc8b6ade8959a02ca967950/README.md
  - label: Benchmark methodology
    url: https://github.com/cemalgurselkar/VecTorch/blob/8a88749bb565e3507fc8b6ade8959a02ca967950/benchmarks/README.md
  - label: Technical diagnosis
    url: https://github.com/cemalgurselkar/VecTorch/blob/8a88749bb565e3507fc8b6ade8959a02ca967950/report.md
---

## Overview

VecTorch is an embedded persistent vector-search baseline. NumPy-backed flat search supports cosine, dot product, and squared L2, while generation-based snapshots make persistence and reopen behavior testable.

## Results

Audited at commit `8a88749`: 1M vectors, 128 dimensions, exact search, machine-specific local run.

| Measure     | Value      |
| ----------- | ---------- |
| p50 latency | 199.701 ms |
| Throughput  | 4.88 QPS   |

## Limitations

- Search is exact and linear; HNSW, IVF, filtering, and concurrent writes are not implemented.
- The benchmark is hardware-specific and should not be generalized as low latency.
- Version `0.1.0` is an alpha baseline, not a production-scale ANN service.
