---
title: AstraRAG
description: A reproducible RAG engine for PDF question answering that compares sparse, dense, hybrid, and routed retrieval paths, with explicit evaluation and failure boundaries.
repo: cemalgurselkar/astraRag
technologies: [Python, Qdrant, BM25, llama.cpp, Docker]
featured: true
order: 1
draft: false
links:
  - label: README and architecture
    url: https://github.com/cemalgurselkar/astraRag/blob/f0cdc78c09881fdc01608cbcb453330045635990/README.md
  - label: Benchmark scripts
    url: https://github.com/cemalgurselkar/astraRag/tree/f0cdc78c09881fdc01608cbcb453330045635990/scripts
  - label: Test suites
    url: https://github.com/cemalgurselkar/astraRag/tree/f0cdc78c09881fdc01608cbcb453330045635990/test
---

## Overview

AstraRAG parses PDFs, creates token-based chunks, builds local embeddings, and stores vectors in Qdrant. A query can follow BM25, dense, reciprocal-rank-fusion hybrid, or routed retrieval before context reaches answer generation.

## Results

Audited at commit `f0cdc78`: 40 queries over five PDFs (314 chunks), documented warm local run.

| Retrieval path | Hit@10 |
| --- | --- |
| Dense | 0.625 |
| BM25 | 0.775 |
| Hybrid (RRF) | 0.750 |

## Limitations

- OCR and complex table or page-layout extraction are unsupported.
- The documented `astrarag evaluate` command is a placeholder; benchmark scripts are the real evaluation path.
- Retrieval latency is local and hardware-dependent, not a universal production claim.
