export const projectCategoryLabels = {
  rag: "LLM / RAG",
  robotics: "Robotics / CV",
  data: "Data engineering",
  foundations: "ML foundations",
} as const;

export type ProjectCategory = keyof typeof projectCategoryLabels;
export type ProjectPreview =
  "retrieval" | "stream" | "robot" | "vector" | "tools" | "vision" | "training";

export type EvidenceLink = { label: string; url: string };
export type VerifiedMetric = { label: string; value: string; context: string };

export const caseStudySlugs = [
  "astrarag",
  "marketstream",
  "clearpath",
  "vectorch",
  "financial-agent",
] as const;

export type CaseStudySlug = (typeof caseStudySlugs)[number];

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  categories: readonly ProjectCategory[];
  tech: readonly string[];
  githubUrl: string;
  featured: boolean;
  cover: ProjectPreview;
  architectureCue: string;
  evidenceLinks: readonly EvidenceLink[];
  verifiedMetrics: readonly VerifiedMetric[];
  status: "published" | "index-only";
  auditedCommit: string;
};

export const projects: readonly Project[] = [
  {
    slug: "astrarag",
    title: "AstraRAG",
    shortTitle: "Retrieval under evaluation",
    summary:
      "A reproducible RAG engine for PDF question answering that compares sparse, dense, hybrid, and routed retrieval paths, with explicit evaluation and failure boundaries.",
    categories: ["rag"],
    tech: ["Python", "Qdrant", "BM25", "llama.cpp", "Docker"],
    githubUrl: "https://github.com/cemalgurselkar/astraRag",
    featured: true,
    cover: "retrieval",
    architectureCue: "Query → route → sparse / dense / hybrid → context",
    evidenceLinks: [
      {
        label: "README and architecture",
        url: "https://github.com/cemalgurselkar/astraRag/blob/f0cdc78c09881fdc01608cbcb453330045635990/README.md",
      },
      {
        label: "Benchmark scripts",
        url: "https://github.com/cemalgurselkar/astraRag/tree/f0cdc78c09881fdc01608cbcb453330045635990/scripts",
      },
      {
        label: "Test suites",
        url: "https://github.com/cemalgurselkar/astraRag/tree/f0cdc78c09881fdc01608cbcb453330045635990/test",
      },
    ],
    verifiedMetrics: [
      {
        label: "Dense Hit@10",
        value: "0.625",
        context:
          "40 queries, five PDFs, 314 chunks; documented warm local run.",
      },
      {
        label: "BM25 Hit@10",
        value: "0.775",
        context: "Same audited workload and local benchmark context.",
      },
      {
        label: "Hybrid RRF Hit@10",
        value: "0.750",
        context: "Audited result; the older 85% profile claim is not used.",
      },
    ],
    status: "published",
    auditedCommit: "f0cdc78",
  },
  {
    slug: "marketstream",
    title: "MarketStream",
    shortTitle: "Events with visible backpressure",
    summary:
      "A streaming market-data system that follows events from ingestion through processing, layered storage, orchestration, and serving, with profiling and backpressure evidence.",
    categories: ["data"],
    tech: ["Kafka", "PySpark", "DuckDB", "FastAPI", "Airflow"],
    githubUrl: "https://github.com/cemalgurselkar/fast_orderbook",
    featured: true,
    cover: "stream",
    architectureCue: "Exchange → Kafka → Spark → storage → serving",
    evidenceLinks: [
      {
        label: "README",
        url: "https://github.com/cemalgurselkar/fast_orderbook/blob/c1a2592cf79e9cf868c268599a7fb1a330962f83/README.md",
      },
      {
        label: "Benchmark report",
        url: "https://github.com/cemalgurselkar/fast_orderbook/blob/c1a2592cf79e9cf868c268599a7fb1a330962f83/reports/benchmark_report_2026-09-10_17-44-28.md",
      },
      {
        label: "Captured test report",
        url: "https://github.com/cemalgurselkar/fast_orderbook/blob/c1a2592cf79e9cf868c268599a7fb1a330962f83/reports/test_report_2026-09-10_18-53-56.md",
      },
    ],
    verifiedMetrics: [
      {
        label: "Durable writer rate",
        value: "11,569 events/s",
        context:
          "One recorded run requested 50,000 events/s; backlog and sampled latency were present.",
      },
      {
        label: "Captured tests",
        value: "23 passed",
        context:
          "Recorded by the checked-in test report in its captured environment.",
      },
    ],
    status: "published",
    auditedCommit: "c1a2592",
  },
  {
    slug: "clearpath",
    title: "Clearpath with Language Models",
    shortTitle: "Language bounded by robot states",
    summary:
      "A simulated mobile-manipulation workflow connecting constrained natural-language planning to perception, navigation, and grasp-control nodes in ROS 2.",
    categories: ["robotics", "rag"],
    tech: ["ROS 2", "Gazebo", "Ollama", "Ultralytics YOLO", "Python"],
    githubUrl:
      "https://github.com/cemalgurselkar/Clearpath_with_LanguageModels",
    featured: true,
    cover: "robot",
    architectureCue: "Command → scan → detect → navigate → grasp",
    evidenceLinks: [
      {
        label: "README and node diagram",
        url: "https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/blob/67a01979193c7fcda9b8e116d948604162d1720a/README.md",
      },
      {
        label: "ROS package source",
        url: "https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/tree/67a01979193c7fcda9b8e116d948604162d1720a/src/llm_robot",
      },
      {
        label: "Navigation implementation",
        url: "https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/blob/67a01979193c7fcda9b8e116d948604162d1720a/src/llm_robot/llm_robot/navigator.py",
      },
    ],
    verifiedMetrics: [
      {
        label: "End-to-end success rate",
        value: "Not published",
        context:
          "No repeatable task-completion benchmark was found; the workflow is presented as simulation.",
      },
    ],
    status: "published",
    auditedCommit: "67a0197",
  },
  {
    slug: "vectorch",
    title: "VecTorch",
    shortTitle: "Exact search, honest limits",
    summary:
      "An embedded vector-search baseline built to make storage semantics, exact-search correctness, profiling, and scale limits inspectable.",
    categories: ["data", "foundations"],
    tech: ["Python", "NumPy", "Pytest", "Docker"],
    githubUrl: "https://github.com/cemalgurselkar/VecTorch",
    featured: true,
    cover: "vector",
    architectureCue: "Mutation → generation → atomic publish → reopen",
    evidenceLinks: [
      {
        label: "README",
        url: "https://github.com/cemalgurselkar/VecTorch/blob/8a88749bb565e3507fc8b6ade8959a02ca967950/README.md",
      },
      {
        label: "Benchmark methodology",
        url: "https://github.com/cemalgurselkar/VecTorch/blob/8a88749bb565e3507fc8b6ade8959a02ca967950/benchmarks/README.md",
      },
      {
        label: "Technical diagnosis",
        url: "https://github.com/cemalgurselkar/VecTorch/blob/8a88749bb565e3507fc8b6ade8959a02ca967950/report.md",
      },
    ],
    verifiedMetrics: [
      {
        label: "1M-vector p50",
        value: "199.701 ms",
        context:
          "128-dimensional exact-search baseline; machine-specific local result.",
      },
      {
        label: "1M-vector throughput",
        value: "4.88 QPS",
        context: "Same documented local baseline; this is not an ANN engine.",
      },
    ],
    status: "published",
    auditedCommit: "8a88749",
  },
  {
    slug: "financial-agent",
    title: "Financial AI Agent",
    shortTitle: "Tool choice made inspectable",
    summary:
      "A local tool-using financial research prototype that exposes how a ReAct-style loop selects market, search, technical-analysis, and retrieval tools.",
    categories: ["rag", "data"],
    tech: ["Ollama", "Chroma", "YFinance", "Streamlit", "Python"],
    githubUrl:
      "https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture",
    featured: false,
    cover: "tools",
    architectureCue: "Question → tool selection → observation → synthesis",
    evidenceLinks: [
      {
        label: "README",
        url: "https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/readme.md",
      },
      {
        label: "Agent loop",
        url: "https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/src/agent.py",
      },
      {
        label: "Tool implementations",
        url: "https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/src/tools.py",
      },
      {
        label: "Captured 50-question run",
        url: "https://github.com/cemalgurselkar/Financial_AI_Agent_with_ReAct_Architecture/blob/fe83404c21fa904b885c7d245a7e1ffd55c65332/src/benchmark_logs/BENCHMARK_50Q_20251230_192244.txt",
      },
    ],
    verifiedMetrics: [
      {
        label: "Published accuracy",
        value: "Withheld",
        context:
          "The 50-question log records answers, not graded correctness; no defensible accuracy is shown.",
      },
    ],
    status: "published",
    auditedCommit: "fe83404",
  },
  {
    slug: "fish-detection",
    title: "Fish detection and counting",
    shortTitle: "Tracked objects through a bounded ROI",
    summary:
      "A dual-model Ultralytics pipeline for fish and crate detection, tracking, configurable regions of interest, and counting logic.",
    categories: ["robotics"],
    tech: ["Ultralytics YOLO", "OpenCV", "Python", "Tracking"],
    githubUrl: "https://github.com/cemalgurselkar/Academic_Project",
    featured: false,
    cover: "vision",
    architectureCue: "Frames → detect → track → ROI crossing → count",
    evidenceLinks: [
      {
        label: "Counting implementation",
        url: "https://github.com/cemalgurselkar/Academic_Project/blob/b9f208d3ffc9fc603de08556a56506659e6fd1d8/Solutions/Solution.py",
      },
    ],
    verifiedMetrics: [],
    status: "index-only",
    auditedCommit: "b9f208d",
  },
  {
    slug: "qwen-lora",
    title: "Qwen2.5-Coder LoRA",
    shortTitle: "Training method, results held back",
    summary:
      "A PEFT LoRA training pipeline for Qwen2.5-Coder-1.5B-Instruct with configured datasets and an external evaluation adapter.",
    categories: ["foundations"],
    tech: ["Transformers", "PEFT", "LoRA", "DoRA", "Python"],
    githubUrl: "https://github.com/cemalgurselkar/Lora_Training",
    featured: false,
    cover: "training",
    architectureCue: "Dataset → adapters → training → external evaluation",
    evidenceLinks: [
      {
        label: "Training source",
        url: "https://github.com/cemalgurselkar/Lora_Training/blob/bb06a472194d050a06449587dbec07a64d0f824b/train.py",
      },
    ],
    verifiedMetrics: [],
    status: "index-only",
    auditedCommit: "bb06a47",
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const publishedCaseStudies = projects.filter(
  (project) => project.status === "published",
);

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
