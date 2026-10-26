import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current!;
    triggerRef.current = document.activeElement as HTMLElement | null;
    el.showModal();
    return () => {
      el.close();
      triggerRef.current?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
        requestAnimationFrame(() => triggerRef.current?.focus());
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-body">
        <button
          className="icon-button close"
          aria-label="关闭弹窗"
          onClick={onClose}
        >
          <X size={21} />
        </button>

        <h2 id="dialog-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
