import React from 'react';

/**
 * Card component – rounded corners, soft shadows, optional hover lift.
 * 
 * Props:
 *  - children: card content
 *  - interactive: enables hover lift + pointer cursor
 *  - onClick: click handler (makes card interactive automatically)
 *  - className: additional classes
 *  - padding: custom padding class (default uses card CSS padding)
 */
export default function Card({
  children,
  interactive = false,
  onClick,
  className = '',
  padding = '',
}) {
  const isInteractive = interactive || !!onClick;

  return (
    <div
      onClick={onClick}
      className={`card ${isInteractive ? 'card--interactive' : ''} ${padding} ${className}`}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {children}
    </div>
  );
}
