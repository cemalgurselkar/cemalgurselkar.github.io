/**
 * Content for the About page. Edit freely; everything here is plain text.
 * Keep it factual — the page renders exactly what is written.
 */

export interface TimelineItem {
  title: string;
  org: string;
  period: string;
  detail: string;
  tags?: string[];
}

export const about = {
  /** Paragraphs shown at the top of the page. */
  intro: [
    "I'm a computer engineer working on AI/ML and data systems. I turn messy data and model behavior into systems you can inspect: retrieval pipelines with evaluation, streaming infrastructure with visible boundaries, and robot workflows that keep language grounded in state.",
    "I care about the part after the demo — the evaluation, the failure mode, and the constraint that makes a result honest.",
  ],

  location: "Mersin, Türkiye",

  interests: [
    "Retrieval and evaluation of LLM systems",
    "Streaming and data infrastructure",
    "Robotics and language-grounded control",
    "Mathematics behind machine learning",
  ],

  experience: [
    {
      title: "AI Engineering Intern",
      org: "Technology House",
      period: "Internship",
      detail:
        "Built an automated fish detection and counting system with YOLOv11 for real-time industrial monitoring, including tracking and custom counting logic.",
      tags: ["YOLOv11", "Computer vision", "Industrial monitoring"],
    },
    {
      title: "AI / Data Engineering",
      org: "FlyRank AI",
      period: "Project",
      detail:
        "Built MarketStream, an end-to-end market-data pipeline spanning Kafka ingestion, PySpark processing, layered storage, Airflow orchestration, and FastAPI serving.",
      tags: ["Kafka", "PySpark", "Airflow", "FastAPI"],
    },
  ] satisfies TimelineItem[],

  education: [
    {
      title: "B.Sc. Computer Engineering",
      org: "Çukurova University",
      period: "2021–2026",
      detail:
        "Senior thesis: LLM-based autonomous robot control, connecting natural-language planning to robotic middleware and motion planning in ROS 2 simulation.",
    },
  ] satisfies TimelineItem[],

  skills: [
    {
      group: "AI / ML",
      items: [
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
      group: "Data",
      items: [
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
      group: "Systems",
      items: [
        "Docker",
        "FastAPI",
        "ROS 2",
        "Gazebo",
        "Ultralytics YOLO",
        "Git",
      ],
    },
  ],
};
