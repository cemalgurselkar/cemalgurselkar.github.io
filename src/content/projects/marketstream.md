---
title: MarketStream
description: A streaming market-data system that follows events from ingestion through processing, layered storage, orchestration, and serving, with profiling and backpressure evidence.
repo: cemalgurselkar/fast_orderbook
technologies: [Kafka, PySpark, DuckDB, FastAPI, Airflow]
featured: true
order: 2
draft: false
links:
  - label: README
    url: https://github.com/cemalgurselkar/fast_orderbook/blob/c1a2592cf79e9cf868c268599a7fb1a330962f83/README.md
  - label: Benchmark report
    url: https://github.com/cemalgurselkar/fast_orderbook/blob/c1a2592cf79e9cf868c268599a7fb1a330962f83/reports/benchmark_report_2026-09-10_17-44-28.md
  - label: Captured test report
    url: https://github.com/cemalgurselkar/fast_orderbook/blob/c1a2592cf79e9cf868c268599a7fb1a330962f83/reports/test_report_2026-09-10_18-53-56.md
---

## Overview

MarketStream separates exchange ingestion, Kafka buffering, PySpark processing, layered storage, orchestration, and serving. That separation makes producer rate, durable writer rate, queue growth, and consumer latency independently visible.

## Results

Audited at commit `c1a2592`.

| Measure | Value | Context |
| --- | --- | --- |
| Durable writer rate | 11,569 events/s | One recorded run that requested 50,000 events/s; backlog and sampled latency were present. |
| Captured tests | 23 passed | Recorded by the checked-in test report in its captured environment. |

## Limitations

- Requested event rate is not sustained throughput.
- The recorded 50,000 events/s request exceeded the durable writer rate and accumulated backlog.
- Results describe a captured environment, not guaranteed live-market performance.
