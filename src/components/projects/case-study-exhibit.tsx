"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

import type { CaseStudySlug } from "@/data/projects";

type ExhibitStep = {
  label: string;
  detail: string;
  signal: string;
};

type Exhibit = {
  disclosure: string;
  title: string;
  steps: readonly ExhibitStep[];
};

const exhibits: Record<CaseStudySlug, Exhibit> = {
  astrarag: {
    disclosure: "Audited benchmark / warm local runs",
    title: "Compare retrieval paths",
    steps: [
      {
        label: "Dense",
        signal: "Hit@10 0.625",
        detail:
          "Embedding similarity retrieves context through the Qdrant index.",
      },
      {
        label: "BM25",
        signal: "Hit@10 0.775",
        detail: "Sparse lexical matching led this audited Hit@10 workload.",
      },
      {
        label: "Hybrid",
        signal: "Hit@10 0.750",
        detail:
          "Reciprocal-rank fusion combines sparse and dense result lists.",
      },
      {
        label: "Adaptive",
        signal: "Hit@5 0.725 · 4.30 ms mean",
        detail:
          "A router selects a retrieval path; the metric uses a different cutoff and is not directly Hit@10-comparable.",
      },
    ],
  },
  marketstream: {
    disclosure: "Architecture walkthrough / not live market data",
    title: "Follow one event boundary",
    steps: [
      {
        label: "Ingest",
        signal: "Binance streams",
        detail: "SDK and CLI accept trade, depth, ticker, and kline events.",
      },
      {
        label: "Buffer",
        signal: "Kafka",
        detail:
          "The broker separates incoming event rate from downstream processing capacity.",
      },
      {
        label: "Process",
        signal: "PySpark",
        detail:
          "Stream processing transforms the event flow before layered storage.",
      },
      {
        label: "Store",
        signal: "Parquet · DuckDB · PostgreSQL",
        detail:
          "Different storage layers support durable data, analytics, and serving.",
      },
      {
        label: "Serve",
        signal: "FastAPI · Streamlit",
        detail:
          "API and interface layers expose the processed data to consumers.",
      },
    ],
  },
  clearpath: {
    disclosure: "Simulation workflow / no physical deployment claim",
    title: "Step through the robot states",
    steps: [
      {
        label: "Parse",
        signal: "/llm_task",
        detail:
          "A local model maps constrained English into a small JSON task schema.",
      },
      {
        label: "Scan",
        signal: "/scanner_status",
        detail:
          "The simulated robot scans before handing perception state forward.",
      },
      {
        label: "Detect",
        signal: "Ultralytics YOLO",
        detail:
          "Detection identifies the target within the simulated camera workflow.",
      },
      {
        label: "Navigate",
        signal: "/cmd_vel",
        detail:
          "Visual-servo navigation aligns the mobile base with the target.",
      },
      {
        label: "Grasp",
        signal: "/navigator/status",
        detail:
          "Arm control receives a bounded state transition rather than free-form text.",
      },
    ],
  },
  vectorch: {
    disclosure: "Exact-search baseline / machine-specific benchmark",
    title: "Inspect the durability boundary",
    steps: [
      {
        label: "Mutate",
        signal: "In-memory state",
        detail:
          "Validated vector changes begin in the current in-memory generation.",
      },
      {
        label: "Snapshot",
        signal: "New generation",
        detail:
          "Persistence writes a new generation instead of overwriting the active one.",
      },
      {
        label: "Publish",
        signal: "Atomic switch",
        detail:
          "The completed generation becomes current through an atomic publish step.",
      },
      {
        label: "Reopen",
        signal: "Persistent state",
        detail:
          "Reopening validates that the published generation remains readable.",
      },
    ],
  },
  "financial-agent": {
    disclosure: "Tool boundary / not financial advice",
    title: "Inspect the available tool surface",
    steps: [
      {
        label: "Market",
        signal: "YFinance",
        detail: "Price and ticker tools retrieve external market information.",
      },
      {
        label: "Technical",
        signal: "RSI · SMA",
        detail:
          "Explicit functions calculate technical indicators outside the model.",
      },
      {
        label: "Search",
        signal: "Serper",
        detail:
          "Search is selected as a bounded tool when outside information is required.",
      },
      {
        label: "Retrieval",
        signal: "Chroma · Ollama",
        detail:
          "A local knowledge base supplies retrieved context to the tool loop.",
      },
    ],
  },
};

// Rationale: Each concise explorer lets visitors inspect a real system boundary without turning the case study into a long technical report.
export function CaseStudyExhibit({ slug }: { slug: CaseStudySlug }) {
  const exhibit = exhibits[slug];
  const [activeIndex, setActiveIndex] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useReducedMotion();
  const activeStep = exhibit.steps[activeIndex];

  const selectStep = (index: number, focus = false) => {
    const normalized = (index + exhibit.steps.length) % exhibit.steps.length;
    setActiveIndex(normalized);
    if (focus) buttons.current[normalized]?.focus();
  };

  return (
    <section
      aria-labelledby="exhibit-title"
      className={`case-exhibit case-exhibit--${slug}`}
    >
      <header>
        <p className="eyebrow">{exhibit.disclosure}</p>
        <h2 id="exhibit-title">{exhibit.title}</h2>
      </header>
      <div
        aria-label={exhibit.title}
        className="case-exhibit-controls"
        role="group"
      >
        {exhibit.steps.map((step, index) => (
          <button
            ref={(element) => {
              buttons.current[index] = element;
            }}
            aria-controls="case-exhibit-panel"
            aria-pressed={activeIndex === index}
            key={step.label}
            onClick={() => selectStep(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                selectStep(activeIndex + 1, true);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                selectStep(activeIndex - 1, true);
              }
              if (event.key === "Home") {
                event.preventDefault();
                selectStep(0, true);
              }
              if (event.key === "End") {
                event.preventDefault();
                selectStep(exhibit.steps.length - 1, true);
              }
            }}
            type="button"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {step.label}
          </button>
        ))}
      </div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        aria-live="polite"
        className="case-exhibit-panel"
        id="case-exhibit-panel"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        key={`${slug}-${activeStep.label}`}
        transition={{ duration: reduceMotion ? 0 : 0.18 }}
      >
        <p>{activeStep.signal}</p>
        <strong>{activeStep.label}</strong>
        <span>{activeStep.detail}</span>
      </motion.div>
    </section>
  );
}
