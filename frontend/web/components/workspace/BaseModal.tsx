'use client';

import { useEffect, type ReactNode } from 'react';

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
  widthClassName?: string;
}

export function BaseModal({
  open,
  onClose,
  titleId,
  children,
  widthClassName = 'max-w-2xl',
}: BaseModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`vel-glass w-full ${widthClassName} max-h-[90vh] overflow-auto rounded-2xl border border-[var(--vel-border-subtle)]`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
