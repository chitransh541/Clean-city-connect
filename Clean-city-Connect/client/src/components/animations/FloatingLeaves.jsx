import React, { useMemo } from 'react';

/**
 * FloatingLeaves – Renders animated leaf decorations on left and right sides.
 * Uses CSS keyframes for floating/swaying motion.
 */

const LEAF_COLORS = [
  '#22c55e', // leaf-500
  '#4ade80', // leaf-400
  '#86efac', // leaf-300
  '#16a34a', // leaf-600
  '#bbf7d0', // leaf-200
];

const LEAF_SHAPES = [
  (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.17 20C12.41 20 15.94 16.5 17 8Z"
        fill={color}
        opacity="0.8"
      />
      <path
        d="M17 8C8 10 5.9 16.17 3.82 21.34"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.5"
      />
    </svg>
  ),
  (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse
        cx="12"
        cy="10"
        rx="5"
        ry="8"
        fill={color}
        opacity="0.7"
        transform="rotate(-30 12 10)"
      />
      <line x1="12" y1="2" x2="12" y2="18" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </svg>
  ),
  (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="6" fill={color} opacity="0.5" />
      <path d="M12 6 Q14 12 12 18" stroke={color} strokeWidth="0.6" opacity="0.3" />
    </svg>
  ),
];

export default function FloatingLeaves({ count = 8, side = 'both' }) {
  const generatedLeaves = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const leafSide = side === 'both' ? (i % 2 === 0 ? 'left' : 'right') : side;
      const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
      const size = 16 + Math.floor(Math.random() * 20);
      const shapeIdx = Math.floor(Math.random() * LEAF_SHAPES.length);
      const top = 10 + Math.random() * 70;
      const xOffset = 10 + Math.random() * 40;
      const animDuration = 5 + Math.random() * 6;
      const animDelay = Math.random() * 5;

      result.push({
        id: i,
        side: leafSide,
        color,
        size,
        shapeIdx,
        top,
        xOffset,
        animDuration,
        animDelay,
      });
    }
    return result;
  }, [count, side]);

  return (
    <div className="floating-leaves-container">
      {generatedLeaves.map((leaf) => (
        <div
          key={leaf.id}
          className="floating-leaf leaf-sway"
          style={{
            top: `${leaf.top}%`,
            [leaf.side]: `${leaf.xOffset}px`,
            animationDuration: `${leaf.animDuration}s`,
            animationDelay: `${leaf.animDelay}s`,
            opacity: 0.4 + Math.random() * 0.3,
          }}
        >
          {LEAF_SHAPES[leaf.shapeIdx](leaf.color, leaf.size)}
        </div>
      ))}
    </div>
  );
}
