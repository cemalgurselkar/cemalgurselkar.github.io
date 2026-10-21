"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type KeyboardEvent,
} from "react";

const stars = Array.from({ length: 58 }, (_, index) => ({
  left: `${((index * 37 + 11) % 97) + 1}%`,
  top: `${((index * 53 + 7) % 91) + 3}%`,
  size: index % 9 === 0 ? "2px" : "1px",
  delay: `${((index * 41) % 60) / 10}s`,
  duration: `${2.4 + (index % 5) * 0.7}s`,
}));

// Rationale: A lightweight CSS 3D sculpture brings motion and depth to the hero without hiding portfolio content behind another panel.
export function OrbitalSculpture() {
  const [rotation, setRotation] = useState({ x: -7, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!lastPointer.current) return;
    const deltaX = event.clientX - lastPointer.current.x;
    const deltaY = event.clientY - lastPointer.current.y;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    setRotation((current) => ({
      x: Math.max(-78, Math.min(78, current.x - deltaY * 0.55)),
      y: ((current.y + deltaX * 0.55 + 180) % 360) - 180,
    }));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    lastPointer.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const directions: Record<string, { x: number; y: number }> = {
      ArrowUp: { x: -8, y: 0 },
      ArrowDown: { x: 8, y: 0 },
      ArrowLeft: { x: 0, y: -10 },
      ArrowRight: { x: 0, y: 10 },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    setRotation((current) => ({
      x: Math.max(-78, Math.min(78, current.x + direction.x)),
      y: ((current.y + direction.y + 180) % 360) - 180,
    }));
  }

  const sculptureStyle = {
    "--rotation-x": `${rotation.x.toFixed(1)}deg`,
    "--rotation-y": `${rotation.y.toFixed(1)}deg`,
    "--inverse-rotation-x": `${(-rotation.x).toFixed(1)}deg`,
    "--inverse-rotation-y": `${(-rotation.y).toFixed(1)}deg`,
  } as CSSProperties;

  return (
    <div
      aria-label="Interactive 3D space sculpture. Drag to rotate or use the arrow keys."
      className={dragging ? "orbital-art is-dragging" : "orbital-art"}
      onKeyDown={handleKeyDown}
      onPointerCancel={endDrag}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={endDrag}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      role="group"
      tabIndex={0}
    >
      {stars.map((star, index) => (
        <span
          aria-hidden="true"
          className="space-star"
          key={index}
          style={
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
            } as CSSProperties
          }
        />
      ))}
      <span aria-hidden="true" className="shooting-star" />
      <span
        aria-hidden="true"
        className="shooting-star shooting-star--second"
      />
      <span
        aria-hidden="true"
        className="space-shuttle"
        title="Decorative space shuttle"
      >
        <svg viewBox="0 0 64 64" fill="none">
          <path
            d="M33 4C26 12 23 22 21 32L9 40v5l15-3c0 7 2 13 7 18l3-5 4 5c4-5 6-11 6-18l13 3v-5L45 32C43 22 40 12 33 4Z"
            fill="url(#shuttle-body)"
            stroke="white"
            strokeOpacity=".82"
            strokeWidth="1.3"
          />
          <path d="M33 14c-3 5-4 10-4 16h8c0-6-1-11-4-16Z" fill="#9FE8FF" />
          <path d="m31 54 2 6 3-6" fill="#FFB46E" />
          <defs>
            <linearGradient
              id="shuttle-body"
              x1="16"
              x2="48"
              y1="10"
              y2="52"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFF" />
              <stop offset=".5" stopColor="#BFCBFF" />
              <stop offset="1" stopColor="#6E78B9" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <div className="orbital-scene" style={sculptureStyle}>
        <div className="orbital-sculpture">
          <div className="orbital-aura" />
          <div className="orbital-core" />
          <div className="orbital-ring orbital-ring--inner" />
          <div className="orbital-ring orbital-ring--fine" />
          <div className="orbital-ring orbital-ring--middle" />
          <div className="orbital-ring orbital-ring--outer" />
          <div className="orbital-ring orbital-ring--distant" />
          <span className="orbital-particle orbital-particle--one" />
          <span className="orbital-particle orbital-particle--two" />
          <span className="orbital-particle orbital-particle--three" />
        </div>
      </div>
      <span className="orbital-coordinate orbital-coordinate--top">
        FORM STUDY <span>001</span>
      </span>
      <span className="orbital-coordinate orbital-coordinate--bottom">
        DRAG TO ROTATE <span aria-hidden="true">·</span> ARROW KEYS
      </span>
    </div>
  );
}
