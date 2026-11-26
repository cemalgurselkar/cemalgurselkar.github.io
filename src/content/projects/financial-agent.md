---
title: Financial AI Agent
description: A local tool-using financial research prototype that exposes how a ReAct-style loop selects market, search, technical-analysis, and retrieval tools.
repo: cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture
technologies: [Ollama, Chroma, YFinance, Streamlit, Python]
featured: false
order: 5
draft: false
links:
  - label: README
    url: https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/readme.md
  - label: Agent loop
    url: https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/src/agent.py
  - label: Tool implementations
    url: https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/src/tools.py
  - label: Captured 50-question run
    url: https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/src/benchmark_logs/BENCHMARK_50Q_20251230_192244.txt
---

## Overview

A local Qwen2.5 model selects explicit tools for market prices, ticker lookup, RSI and SMA calculations, web search, CSV analysis, and local retrieval. The Streamlit interface exposes the tool-using research workflow.

## Limitations

- The checked-in run records whether questions were answered, not whether answers were correct, so no accuracy figure is published.
- External data freshness is provider-dependent, and the project is not financial advice.
