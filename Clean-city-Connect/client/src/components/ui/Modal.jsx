import React, { useEffect, useRef } from 'react';

/**
 * Modal – Centered popup with overlay, smooth enter/exit, and animated character option.
 * 
 * Props:
 *  - isOpen: boolean
 *  - onClose: close handler
 *  - children: modal content
 *  - title: optional title
 *  - showCloseButton: show X button (default true)
 *  - maxWidth: max width class (default 'max-w-md')
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  maxWidth = 'max-w-md',
}) {
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="modal-overlay"
    >
      <div
        className={`modal-content ${maxWidth === 'max-w-md' ? 'modal-content--max-w-md' : maxWidth === 'max-w-3xl' ? 'modal-content--max-w-3xl' : 'modal-content--max-w-lg'}`}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Title */}
        {title && (
          <h3 className="modal-title">{title}</h3>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
