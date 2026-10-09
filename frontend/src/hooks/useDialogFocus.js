import { useEffect, useRef } from 'react';

export default function useDialogFocus(open) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const elements = () => [...dialog.querySelectorAll('a[href], button, input, textarea, select, [tabindex]')]
      .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
    const focusFirst = () => (elements()[0] || dialog).focus();
    focusFirst();
    const onFocus = event => { if (!dialog.contains(event.target)) focusFirst(); };
    const onKey = event => {
      if (event.key !== 'Tab') return;
      const list = elements();
      const first = list[0];
      const last = list[list.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  return ref;
}
