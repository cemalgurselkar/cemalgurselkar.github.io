export const resumeSkillGroups = [
  {
    title: "LLM & retrieval",
    technologies: ["Python", "Qdrant", "BM25", "llama.cpp", "Docker"],
    project: "AstraRAG",
    href: "/projects/astrarag",
  },
  {
    title: "Streaming & data systems",
    technologies: ["Kafka", "PySpark", "DuckDB", "FastAPI", "Airflow"],
    project: "MarketStream",
    href: "/projects/marketstream",
  },
  {
    title: "Robotics & computer vision",
    technologies: ["ROS 2", "Gazebo", "Ultralytics YOLO", "Ollama"],
    project: "Clearpath with Language Models",
    href: "/projects/clearpath",
  },
  {
    title: "Numerical systems & tooling",
    technologies: ["Python", "NumPy", "Pytest", "Docker"],
    project: "VecTorch",
    href: "/projects/vectorch",
  },
] as const;

export const resumeProjects = [
  {
    title: "AstraRAG",
    description: "Evaluated sparse, dense, hybrid, and routed PDF retrieval.",
    href: "/projects/astrarag",
  },
  {
    title: "MarketStream",
    description:
      "Streaming market data with visible buffering and storage boundaries.",
    href: "/projects/marketstream",
  },
  {
    title: "Clearpath with Language Models",
    description:
      "A constrained language-to-robot workflow in ROS 2 simulation.",
    href: "/projects/clearpath",
  },
  {
    title: "VecTorch",
    description:
      "An embedded vector-search baseline with persistence and benchmark limits documented.",
    href: "/projects/vectorch",
  },
] as const;
