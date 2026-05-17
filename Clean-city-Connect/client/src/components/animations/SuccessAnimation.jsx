import React from 'react';

/**
 * SuccessAnimation – Animated checkmark character for success popups.
 * Shows a green checkmark with a bouncing eco-character feel.
 */
export default function SuccessAnimation({ size = 120 }) {
  return (
    <div className="success-animation">
      <div className="success-animation-wrapper" style={{ width: size, height: size }}>
        {/* Circle background */}
        <svg
          viewBox="0 0 120 120"
          width={size}
          height={size}
          className="success-animation-svg"
        >
          {/* Outer glow ring */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="#bbf7d0"
            strokeWidth="3"
            style={{
              animation: 'successPulse 2s ease-in-out infinite',
            }}
          />
          {/* Main circle */}
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="#22c55e"
            style={{
              animation: 'successScaleIn 0.5s ease forwards',
            }}
          />
          {/* Checkmark */}
          <path
            d="M35 60 L52 77 L85 44"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 80,
              strokeDashoffset: 80,
              animation: 'drawCheck 0.6s 0.4s ease forwards',
            }}
          />
          {/* Tiny leaf accents */}
          <g style={{ animation: 'fadeIn 0.8s 0.8s ease forwards', opacity: 0 }}>
            <path d="M95 25 Q100 20 105 25 Q100 30 95 25Z" fill="#4ade80" />
            <path d="M15 85 Q20 80 25 85 Q20 90 15 85Z" fill="#86efac" />
            <path d="M100 80 Q105 75 108 82 Q103 85 100 80Z" fill="#bbf7d0" />
          </g>
        </svg>
      </div>

      <style>{`
        @keyframes successScaleIn {
          from { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes successPulse {
          0%, 100% { r: 55; opacity: 0.6; }
          50% { r: 58; opacity: 1; }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
