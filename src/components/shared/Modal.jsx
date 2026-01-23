import React, { useEffect } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog className="modal-overlay" open={isOpen} onClick={onClose}>
      <article className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <header className="modal-header">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="Close modal">
              ×
            </button>
          </header>
        )}
        <section className="modal-body">
          {children}
        </section>
      </article>
    </dialog>
  );
}

export default Modal;

