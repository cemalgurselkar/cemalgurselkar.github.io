# Portfolio Content Audit

Status: Phase 0 discovery artifact  
Audit date: 2026-10-21  
Owner: Cemal Gürsel Kar  
Public profile: <https://github.com/cemalgurselkar>

## Audit rules

- A claim is **verified** only when the current public repository contains code, documentation, a reproducible report, or another direct artifact supporting it.
- A profile or README statement without underlying evidence is **provisional**. It may guide drafting but is not a production metric.
- A contradiction is **held back** until it is resolved. The portfolio must not silently choose the more flattering version.
- Benchmark numbers must be paired with workload, hardware, method, and limitations. Repository results are not universal performance claims.
- The CV was not present in the workspace, so education, employment, internship, dates, and résumé copy remain provisional.

## Repository and source state

- The working tree contains a previous portfolio implementation recorded as deleted, plus generated `.next` changes. Phase 0 does not restore, delete, or modify any of that work.
- No current `package.json`, application source, or CV/resume PDF is present in the working tree.
- The GitHub account exposes 31 public repositories at audit time.
- The user has chosen GitHub Pages for deployment and will handle deployment. Future implementation should remain compatible with a static Next.js export; runtime server features are out of scope unless that decision changes.

## Identity and contact claims

| Claim                                                | Status                                               | Evidence                                                                                                                                                       | Publication decision                                                             |
| ---------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Name: Cemal Gürsel Kar                               | Verified from owner-maintained profile               | [Profile README](https://github.com/cemalgurselkar/cemalgurselkar/blob/202020b6e3558052efe7741b4a3d0230802eb1e1/README.md)                                     | Safe to use                                                                      |
| Positioning: AI/ML, LLM systems, data engineering    | Verified as self-positioning, not employment history | [Profile README](https://github.com/cemalgurselkar/cemalgurselkar/blob/202020b6e3558052efe7741b4a3d0230802eb1e1/README.md)                                     | Safe as a concise personal focus                                                 |
| Computer Engineering, Çukurova University, 2021–2026 | Provisional                                          | [Profile README](https://github.com/cemalgurselkar/cemalgurselkar/blob/202020b6e3558052efe7741b4a3d0230802eb1e1/README.md#background-and-interests); CV absent | Do not add degree status or exact dates beyond the profile until CV confirmation |
| “Computer Engineering Graduate”                      | Provisional                                          | Profile uses this phrase; no CV/diploma artifact supplied                                                                                                      | Confirm before hero/resume publication                                           |
| Email: `cemalgurselkar@gmail.com`                    | Public but not approved for the portfolio            | [Profile README](https://github.com/cemalgurselkar/cemalgurselkar/blob/202020b6e3558052efe7741b4a3d0230802eb1e1/README.md)                                     | Require explicit approval before rendering                                       |
| LinkedIn                                             | URL found                                            | <https://www.linkedin.com/in/cemal-g%C3%BCrsel-85498425a/>                                                                                                     | Confirm preferred canonical URL before rendering                                 |
| Medium                                               | URL found                                            | <https://medium.com/@cemalgurselkar>                                                                                                                           | Optional; confirm whether it represents current work                             |
| Turkey                                               | Public profile location only                         | <https://github.com/cemalgurselkar>                                                                                                                            | Avoid unnecessary location emphasis unless desired                               |

## Project audit and publication readiness

### 1. AstraRAG — flagship, evidence-ready with corrected metrics

Repository: <https://github.com/cemalgurselkar/astraRag>  
Audited commit: `f0cdc78c09881fdc01608cbcb453330045635990`

Verified:

- End-to-end PDF RAG pipeline with parsing, token chunks, local llama.cpp embeddings, Qdrant HNSW retrieval, BM25, reciprocal-rank-fusion hybrid retrieval, routing, Gemini answer generation, CLI, HTTP API, and Docker Compose.
- Atomic index replacement, unchanged-corpus detection, and vector reuse are described and represented in the repository.
- White-box tests cover chunking, parsing, embedding, routing, retrieval, and context strategies; black-box tests cover CLI, API, indexing, service, and retrieval acceptance boundaries.
- Current documented benchmark: 40 queries, five academic PDFs, 314 chunks, warm local runs.
- Current documented results include Dense Hit@10 `0.625`, BM25 Hit@10 `0.775`, Hybrid RRF Hit@10 `0.750`; adaptive routing Hit@5 `0.725` with `4.30 ms` mean retrieval latency.
- Current documented limitation: `astrarag evaluate` is a placeholder; benchmark scripts are the actual evaluation path. OCR and complex table/layout extraction are unsupported.

Evidence:

- [README and architecture](https://github.com/cemalgurselkar/astraRag/blob/f0cdc78c09881fdc01608cbcb453330045635990/README.md)
- [Benchmark scripts](https://github.com/cemalgurselkar/astraRag/tree/f0cdc78c09881fdc01608cbcb453330045635990/scripts)
- [Test suites](https://github.com/cemalgurselkar/astraRag/tree/f0cdc78c09881fdc01608cbcb453330045635990/test)
- [Architecture notes](https://github.com/cemalgurselkar/astraRag/blob/f0cdc78c09881fdc01608cbcb453330045635990/architecture.md)

Conflict to resolve:

- The profile claims **85% Hit@10 with hybrid search**, but the audited README reports **75% Hybrid RRF Hit@10**. The portfolio must use the audited result and its context, or wait for a newly reproduced benchmark. The 85% claim must not be published as-is.

Recommended production summary:

> A reproducible RAG engine for PDF question answering that compares sparse, dense, hybrid, and routed retrieval paths, with explicit evaluation and failure boundaries.

### 2. MarketStream (`fast_orderbook`) — flagship, architecture-ready

Repository: <https://github.com/cemalgurselkar/fast_orderbook>  
Audited commit: `c1a2592cf79e9cf868c268599a7fb1a330962f83`

Verified:

- Python SDK and CLI stream Binance trade, depth, book-ticker, ticker, and kline events.
- Source tree implements Kafka ingestion, PySpark processing, Parquet storage, DuckDB analytics, PostgreSQL serving, FastAPI, Streamlit, and an Airflow DAG.
- The repository includes architecture notes, benchmark tooling, profiling output, tests, and Docker Compose setup.
- Checked-in test reports record 23 passing tests in the captured environment.
- The benchmark report explicitly distinguishes requested event rate, producer rate, durable writer rate, backlog, and sampled end-to-end latency.

Evidence:

- [README](https://github.com/cemalgurselkar/fast_orderbook/blob/c1a2592cf79e9cf868c268599a7fb1a330962f83/README.md)
- [Pipeline source](https://github.com/cemalgurselkar/fast_orderbook/tree/c1a2592cf79e9cf868c268599a7fb1a330962f83/src)
- [Architecture notes](https://github.com/cemalgurselkar/fast_orderbook/tree/c1a2592cf79e9cf868c268599a7fb1a330962f83/project_architecture)
- [Benchmark report](https://github.com/cemalgurselkar/fast_orderbook/blob/c1a2592cf79e9cf868c268599a7fb1a330962f83/reports/benchmark_report_2026-09-10_17-44-28.md)
- [Captured test report](https://github.com/cemalgurselkar/fast_orderbook/blob/c1a2592cf79e9cf868c268599a7fb1a330962f83/reports/test_report_2026-09-10_18-53-56.md)

Claim restriction:

- Do not describe a target event rate as sustained throughput. One recorded run requested 50,000 events/s but durably wrote 11,569 events/s with large backlog latency. Any future headline metric must identify the exact report and conditions.

Recommended production summary:

> A streaming market-data system that follows events from ingestion through processing, layered storage, orchestration, and serving, with profiling and backpressure evidence.

### 3. Clearpath with Language Models — flagship, workflow-ready

Repository: <https://github.com/cemalgurselkar/Clearpath_with_LanguageModels>  
Audited commit: `67a01979193c7fcda9b8e116d948604162d1720a`

Verified:

- A ROS 2 Humble and Gazebo Fortress simulation for a Husky base, UR5e arm, Robotiq gripper, and RealSense-style camera configuration.
- Separate ROS nodes implement command parsing through local Ollama, YOLOv8 detection, scanning, visual-servo navigation, and arm control.
- The source contains the documented topics and state hand-offs, including `/llm_task`, `/scanner_status`, `/cmd_vel`, and `/navigator/status`.
- The current configuration uses `llama3.2:1b`; the code converts constrained English commands into a small JSON task schema.
- Training artifacts and simulation-world assets are present.

Evidence:

- [README and node diagram](https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/blob/67a01979193c7fcda9b8e116d948604162d1720a/README.md)
- [ROS package source](https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/tree/67a01979193c7fcda9b8e116d948604162d1720a/src/llm_robot)
- [LLM configuration](https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/blob/67a01979193c7fcda9b8e116d948604162d1720a/src/llm_robot/llm_robot/prompt.py)
- [Navigation implementation](https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/blob/67a01979193c7fcda9b8e116d948604162d1720a/src/llm_robot/llm_robot/navigator.py)

Claims requiring confirmation:

- The profile calls this a graduation thesis, but the repository alone does not verify academic status, dates, authorship split, or assessment.
- No repeatable end-to-end success rate or task-completion benchmark was found. Present the workflow as a simulation, not as deployed autonomous robotics.
- A source-file comment says `llama3.2:2b`, while the actual configuration and README use `llama3.2:1b`; publish `1b` unless the code changes.

Recommended production summary:

> A simulated mobile-manipulation workflow connecting constrained natural-language planning to perception, navigation, and grasp-control nodes in ROS 2.

### 4. Vectorch (`VecTorch`) — strong additional case study

Repository: <https://github.com/cemalgurselkar/VecTorch>  
Audited commit: `8a88749bb565e3507fc8b6ade8959a02ca967950`

Verified:

- Embedded persistent Python vector database with exact NumPy-backed flat search for cosine, dot-product, and squared L2 distance.
- Atomic generation-based snapshots, logical deletion, typed validation, tests, reproducible benchmark tooling, CI, package build, and Docker example.
- Version `0.1.0` is explicitly an alpha exact-search baseline, not an ANN engine.
- The checked-in benchmark scales from 10K to 1M 128-dimensional vectors and reports latency/QPS with machine and methodology caveats.
- At 1M vectors, the documented local baseline is approximately `199.701 ms` p50 and `4.88` QPS; these values are machine-specific and must always retain that qualifier.

Evidence:

- [README](https://github.com/cemalgurselkar/VecTorch/blob/8a88749bb565e3507fc8b6ade8959a02ca967950/README.md)
- [Technical diagnosis](https://github.com/cemalgurselkar/VecTorch/blob/8a88749bb565e3507fc8b6ade8959a02ca967950/report.md)
- [Benchmark methodology](https://github.com/cemalgurselkar/VecTorch/blob/8a88749bb565e3507fc8b6ade8959a02ca967950/benchmarks/README.md)
- [Tests](https://github.com/cemalgurselkar/VecTorch/tree/8a88749bb565e3507fc8b6ade8959a02ca967950/tests)

Claim restriction:

- Do not call the current implementation “low-latency” without scale and hardware context. Do not imply HNSW/IVF, concurrent writes, filtering, or a published PyPI release.

Recommended production summary:

> An embedded vector-search baseline built to make storage semantics, exact-search correctness, profiling, and scale limits inspectable.

### 5. `tiny-gpts` — educational supporting project

Repository: <https://github.com/cemalgurselkar/tiny-gpts>  
Audited commit: `709b921693076c03fde671330fc5c9df26e3ad2b`

Verified:

- PyTorch implementations include a GPT-2-style decoder with causal self-attention, token/position embeddings, residual blocks, training, optimizer configuration, and generation.
- A second small DeepSeek-inspired implementation includes RMSNorm, rotary embeddings, attention, MLP blocks, training, and generation.

Evidence:

- [Repository](https://github.com/cemalgurselkar/tiny-gpts/tree/709b921693076c03fde671330fc5c9df26e3ad2b)
- [GPT-2 layers](https://github.com/cemalgurselkar/tiny-gpts/blob/709b921693076c03fde671330fc5c9df26e3ad2b/tiny_gpts/GPT2/layers.py)
- [GPT-2 model](https://github.com/cemalgurselkar/tiny-gpts/blob/709b921693076c03fde671330fc5c9df26e3ad2b/tiny_gpts/GPT2/model.py)
- [DeepSeek-inspired model](https://github.com/cemalgurselkar/tiny-gpts/blob/709b921693076c03fde671330fc5c9df26e3ad2b/tiny_gpts/Deepseek/model.py)

Limitations:

- The README contains stale setup instructions pointing to `build_gpt`, not this repository.
- There is no dependency manifest, recorded training result, model-quality benchmark, or evidence that this is a faithful reproduction of a named production architecture.
- Describe it as an educational implementation; never imply that the portfolio demo runs a real model.

### 6. Financial AI Agent — implementation verified, metrics held back

Repository: <https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture>  
Audited commit: `fe83404c21fa904b885c7d245a7e1ffd55c65332`

Verified:

- A local `qwen2.5:3b-instruct` agent implements a text-based ReAct-style tool loop.
- Tools cover YFinance prices, RSI/SMA calculations, Serper search, CSV analysis, ticker lookup, and a local Chroma/Ollama knowledge base.
- A Streamlit interface and a captured 50-question execution log are present.

Evidence:

- [README](https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/readme.md)
- [Agent loop](https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/src/agent.py)
- [Tool implementations](https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/src/tools.py)
- [Captured run](https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/src/benchmark_logs/BENCHMARK_50Q_20251230_192244.txt)

Rejected production claims:

- The README claims 84% accuracy (`42/50`) and comparative Gemini/Groq/Llama scores. The checked-in log marks all 50 items only as `CEVAPLANDI` (answered), not correct/incorrect, and contains visibly incorrect reasoning in at least one answer. No grading rubric or competitor logs were found. Publish none of these accuracy/comparison values.
- “Real-time” depends on third-party data freshness and should be expressed as external tool retrieval, not guaranteed live-market accuracy.
- A future exhibit must use a documented, redacted trace and state that it is not financial advice.

Recommended production summary:

> A local tool-using financial research prototype that exposes how a ReAct-style loop selects market, search, technical-analysis, and retrieval tools.

### 7. Fish detection and counting (`Academic_Project`) — visual asset ready, context pending

Repository: <https://github.com/cemalgurselkar/Academic_Project>  
Audited commit: `b9f208d3ffc9fc603de08556a56506659e6fd1d8`

Verified:

- The repository includes a dual-model Ultralytics pipeline for fish and crate detection, tracking, draggable ROI selection, batch histogram correction, crate matching, logs, and a demo GIF.
- The implementation uses YOLO model loading plus tracking configuration and custom counting logic.

Evidence:

- [README and demo](https://github.com/cemalgurselkar/Academic_Project/blob/b9f208d3ffc9fc603de08556a56506659e6fd1d8/README.md)
- [Counting implementation](https://github.com/cemalgurselkar/Academic_Project/blob/b9f208d3ffc9fc603de08556a56506659e6fd1d8/Solutions/Solution.py)

Conflicts and unknowns:

- The title/profile say YOLOv11, while repository description and the feature section say YOLOv8. Use “Ultralytics YOLO” until confirmed.
- The README says trained `.pt` files could not be uploaded, but weight files currently exist in `Solutions/`; clarify which weights are valid and distributable.
- The industrial-internship context appears only in the profile README and needs CV/user confirmation.
- No accuracy, count error, dataset size, or deployment evidence was found. Do not invent them.

### 8. Qwen2.5-Coder LoRA (`Lora_Training`) — implementation verified, results blocked

Repository: <https://github.com/cemalgurselkar/Lora_Training>  
Audited commit: `bb06a472194d050a06449587dbec07a64d0f824b`

Verified:

- Training code targets `Qwen/Qwen2.5-Coder-1.5B-Instruct` using PEFT LoRA, with rank 32, alpha 64, attention projection targets, DoRA, and two configured datasets.
- An evaluation script integrates an external LiveCodeBench-style workflow.

Evidence:

- [README](https://github.com/cemalgurselkar/Lora_Training/blob/bb06a472194d050a06449587dbec07a64d0f824b/README.md)
- [Training code](https://github.com/cemalgurselkar/Lora_Training/blob/bb06a472194d050a06449587dbec07a64d0f824b/train.py)
- [Evaluation adapter](https://github.com/cemalgurselkar/Lora_Training/blob/bb06a472194d050a06449587dbec07a64d0f824b/eval.py)

Blocked metrics:

- README numbers conflict internally: it labels 11/41 as the base model for both datasets, then reports 11/41 for DEEP and 15/41 for DIVERSE.
- Checked-in `RAPOR_DEEP.json` contains 29 entries and all are marked wrong; `RAPOR_DIVERSE.json` contains 26 entries and all are marked wrong. They do not substantiate the README table.
- Until the evaluation protocol and raw results are reconciled, publish the training method only—no improvement or Pass@1 claims.

## Featured-work recommendation

Recommended homepage order:

1. **AstraRAG** — strongest combination of current documentation, reproducible metrics, tests, and a clear interaction.
2. **MarketStream** — shows data engineering breadth and makes a strong animated systems narrative.
3. **Clearpath** — visually distinct robotics workflow with a clear simulated state machine.
4. **Vectorch** — demonstrates systems thinking, durability trade-offs, benchmarking, and honest limitations.

Supporting projects on the index:

- `tiny-gpts`: educational ML foundations.
- Financial AI Agent: tool-using agent prototype; no accuracy headline.
- Fish counting: computer vision system; version/internship context pending.
- Qwen LoRA: training pipeline; benchmark result held back.

## Missing information and approval checklist

- [ ] Supply the CV PDF for fact-checking; do not add it to `public/resume/` until explicitly approved.
- [ ] Confirm exact education status and dates.
- [ ] Confirm whether the public email may appear on the site.
- [ ] Confirm the canonical LinkedIn URL and whether Medium should be linked.
- [ ] Confirm the preferred role/title for the hero.
- [ ] Confirm project dates, individual contribution, collaborators, and whether each repository is entirely personal work.
- [ ] Resolve AstraRAG’s 85% versus 75% Hybrid Hit@10 conflict.
- [ ] Explain or remove the Financial Agent accuracy and competitor comparison table.
- [ ] Confirm YOLO version, internship context, asset rights, and weight-file status for the fish project.
- [ ] Reconcile the LoRA README table with the checked-in JSON evaluation reports.
- [ ] Confirm whether Clearpath is a graduation thesis and whether screenshots/training images may be published.
- [ ] Provide or approve a portrait; otherwise use no portrait rather than a placeholder person.
- [ ] Confirm the final custom domain. GitHub Pages deployment itself remains user-owned.

## Content safety decisions

- No phone number will be displayed.
- No benchmark will appear without workload and limitations nearby.
- No project will be described as production-deployed unless direct evidence is supplied.
- No simulated exhibit will be labeled live.
- No private API key, dataset, chat history, financial data, or embedded repository artifact will be copied into the portfolio.
- Repository images and demos will be reused only after confirming ownership and suitability for public display.
