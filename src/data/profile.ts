export const profile = {
  name: "Cemal Gürsel Kar",
  role: "Computer Engineering graduate",
  focus: "AI/ML & data systems",
  location: "Adana / Mersin, Türkiye",
  email: "cemalgurselkar@gmail.com",
  github: "https://github.com/cemalgurselkar",
  university: "Çukurova University",
  degree: "B.Sc. Computer Engineering",
  years: "2021–2026",
  availability: "Open to AI/ML, data, and retrieval engineering roles",
  tagline:
    "I build AI and data systems that can be opened up, measured, and questioned.",
  intro:
    "I turn messy data and model behavior into systems you can inspect: retrieval pipelines with evaluation, streaming infrastructure with visible boundaries, and robot workflows that keep language grounded in state.",
  story:
    "I care about the part after the demo — the evaluation, the failure mode, and the constraint that makes a result honest. That is the thread running through AstraRAG, MarketStream, Clearpath, and VecTorch: each project leaves the seams visible instead of hiding them behind a polished claim.",
} as const;

export const experience = [
  {
    company: "Technology House",
    role: "AI Engineering Intern",
    period: "Internship",
    summary:
      "Built an automated fish detection and counting system with YOLOv11 for real-time industrial monitoring, including tracking and custom counting logic.",
    tags: ["YOLOv11", "Computer vision", "Industrial monitoring"],
  },
  {
    company: "FlyRank AI",
    role: "AI / Data Engineering",
    period: "Project",
    summary:
      "Built MarketStream, an end-to-end market-data pipeline spanning Kafka ingestion, PySpark processing, layered storage, Airflow orchestration, and FastAPI serving.",
    tags: ["Kafka", "PySpark", "Airflow", "FastAPI"],
  },
] as const;

export const education = [
  {
    school: "Çukurova University",
    degree: "B.Sc. Computer Engineering",
    period: "2021–2026",
    detail:
      "Senior thesis: LLM-based autonomous robot control, connecting natural-language planning to robotic middleware and motion planning in ROS 2 simulation.",
  },
] as const;

export const skillGroups = [
  {
    title: "AI / ML",
    skills: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "Scikit-Learn",
      "XGBoost",
      "Pandas",
      "NumPy",
      "Ollama",
      "Qdrant",
      "PEFT / LoRA",
    ],
  },
  {
    title: "Data",
    skills: [
      "Kafka",
      "Spark / PySpark",
      "Airflow",
      "DuckDB",
      "PostgreSQL",
      "Parquet",
      "SQL",
    ],
  },
  {
    title: "Systems",
    skills: ["Docker", "FastAPI", "ROS 2", "Gazebo", "Ultralytics YOLO", "Git"],
  },
] as const;

export const principles = [
  {
    title: "Evaluate before claiming",
    detail:
      "Retrieval strategies and model changes need a repeatable measurement, not a single impressive demo.",
  },
  {
    title: "Keep the boundary visible",
    detail:
      "Streaming, storage, and robot state transitions are easier to trust when the hand-offs can be inspected.",
  },
  {
    title: "Ship the limitation too",
    detail:
      "A result is more useful when its hardware, workload, and failure modes are stated beside it.",
  },
] as const;

export const stack = [
  "Python",
  "PyTorch",
  "TensorFlow",
  "Scikit-Learn",
  "Ollama",
  "Qdrant",
  "Kafka",
  "PySpark",
  "Airflow",
  "DuckDB",
  "PostgreSQL",
  "Docker",
  "FastAPI",
  "ROS 2",
  "Ultralytics YOLO",
] as const;
