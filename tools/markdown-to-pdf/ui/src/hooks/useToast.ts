import { useCallback, useEffect, useState } from 'react';

const visibleFor = 6000;

export type ToastMessage = { id: number; title: string; message: string };

export function useToast() {
  const [toast, setToast] = useState<ToastMessage>();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(undefined), visibleFor);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const show = useCallback((title: string, message: string) => {
    setToast({ id: Date.now(), title, message });
  }, []);
  const dismiss = useCallback(() => setToast(undefined), []);

  return { toast, show, dismiss };
}
