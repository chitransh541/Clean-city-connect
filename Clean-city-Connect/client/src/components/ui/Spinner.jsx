import React from 'react';

/**
 * Spinner – Green loading spinner
 */
export default function Spinner({ size = 32, className = '' }) {
  return (
    <div
      className={`spinner ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
