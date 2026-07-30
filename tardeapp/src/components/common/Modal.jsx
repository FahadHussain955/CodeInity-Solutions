// =============================================================================
// MODAL — Reusable dialog/modal component
// Uses native <dialog> element for accessibility (focus trap, Escape key).
// FUTURE: Enhance with Framer Motion exit animations.
// =============================================================================

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal component.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} [props.title]
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {boolean} [props.closeOnOverlay=true]
 * @param {React.ReactNode} props.children
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlay = true,
  children,
}) {
  const dialogRef = useRef(null);

  // Sync open state with native <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Close on native dialog cancel event (Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (closeOnOverlay && e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${size}`}
      onClick={handleBackdropClick}
      aria-labelledby={title ? 'modal-title' : undefined}
      data-testid="modal"
    >
      <div className="modal-content">
        {/* ── Header ── */}
        {(title || onClose) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close dialog"
              data-testid="modal-close-btn"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="modal-body">{children}</div>
      </div>
    </dialog>
  );
}
