"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

const nodes = [
  {
    id: "models",
    label: "Models",
    index: "01",
    x: 16,
    y: 24,
    detail: "Local and task-specific inference begins the system.",
  },
  {
    id: "retrieval",
    label: "Retrieval",
    index: "02",
    x: 61,
    y: 15,
    detail: "Evaluated context constrains what reaches the model.",
  },
  {
    id: "agents",
    label: "Agents",
    index: "03",
    x: 76,
    y: 62,
    detail: "Bounded tools turn intent into inspectable actions.",
  },
  {
    id: "systems",
    label: "Systems",
    index: "04",
    x: 28,
    y: 76,
    detail: "Observable flows expose evidence and failure boundaries.",
  },
] as const;

// Rationale: The keyboard-operable graph turns a broad engineering claim into four connected, inspectable system layers.
export function SystemGraph() {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useReducedMotion();
  const activeNode = nodes[activeIndex];

  const moveFocus = (nextIndex: number) => {
    const normalized = (nextIndex + nodes.length) % nodes.length;
    setActiveIndex(normalized);
    buttons.current[normalized]?.focus();
  };

  return (
    <div
      className="system-graph"
      aria-label="Interactive engineering system graph"
    >
      <div className="system-graph-canvas">
        <svg
          aria-hidden="true"
          className="system-graph-lines"
          viewBox="0 0 100 100"
        >
          {nodes.map((node, index) => {
            const next = nodes[(index + 1) % nodes.length];
            const isActive =
              index === activeIndex ||
              (index + 1) % nodes.length === activeIndex;
            return (
              <motion.line
                animate={{ opacity: isActive ? 1 : 0.32, pathLength: 1 }}
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                key={`${node.id}-${next.id}`}
                stroke="currentColor"
                transition={{
                  duration: reduceMotion ? 0 : 0.45,
                  delay: reduceMotion ? 0 : index * 0.08,
                }}
                x1={node.x}
                x2={next.x}
                y1={node.y}
                y2={next.y}
              />
            );
          })}
        </svg>
        {nodes.map((node, index) => (
          <button
            ref={(element) => {
              buttons.current[index] = element;
            }}
            aria-pressed={activeIndex === index}
            className="system-node"
            key={node.id}
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                moveFocus(activeIndex + 1);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                moveFocus(activeIndex - 1);
              }
              if (event.key === "Home") {
                event.preventDefault();
                moveFocus(0);
              }
              if (event.key === "End") {
                event.preventDefault();
                moveFocus(nodes.length - 1);
              }
            }}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            type="button"
          >
            <span className="system-node-index">{node.index}</span>
            <span>{node.label}</span>
          </button>
        ))}
      </div>
      <div aria-live="polite" className="system-graph-caption">
        <span>{activeNode.index}</span>
        <p>
          <strong>{activeNode.label}</strong> — {activeNode.detail}
        </p>
      </div>
    </div>
  );
}
