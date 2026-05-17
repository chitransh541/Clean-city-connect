import React from 'react';

/**
 * WaveButton – Transparent bg, green border, pill shape.
 * On hover: green color fills up like water with wave animation.
 * 
 * Props:
 *  - children: button text/content
 *  - onClick: click handler
 *  - size: 'sm' | 'md' | 'lg'
 *  - type: 'button' | 'submit'
 *  - disabled: boolean
 *  - className: additional classes
 *  - icon: optional icon element
 */
export default function WaveButton({
  children,
  onClick,
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  icon = null,
}) {
  const sizeClass = size === 'sm' ? 'wave-btn--sm' : size === 'lg' ? 'wave-btn--lg' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`wave-btn ${sizeClass} ${disabled ? 'wave-btn--disabled' : ''} ${className}`}
    >
      {icon && <span className="wave-btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
