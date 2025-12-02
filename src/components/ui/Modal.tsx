import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export default function Modal({ open, title, onClose, children, footer, size = 'md' }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const t = setTimeout(() => dialogRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <div aria-modal="true" role="dialog" aria-label={title} className="fixed inset-0 z-[100]">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          ref={dialogRef}
          tabIndex={-1}
          className={`w-full ${maxW} sm:rounded-2xl rounded-xl sm:my-0 my-auto border border-white/10 bg-[#121418] text-white shadow-2xl outline-none animate-scale-in`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 focus:ring-2 focus:ring-indigo-500 transition-colors"
              aria-label="Close settings"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>

          {footer && (
            <div className="sticky bottom-0 px-5 py-3 bg-[#121418]/95 border-t border-white/10 backdrop-blur supports-[backdrop-filter]:bg-[#121418]/70 rounded-b-2xl">
              <div className="flex items-center justify-end gap-2">{footer}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
