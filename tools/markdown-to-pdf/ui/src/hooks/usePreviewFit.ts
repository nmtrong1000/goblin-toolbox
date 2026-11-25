/*
 * Measured in a layout effect so the first paint already shows the page at its fit size instead of
 * flashing it at full size. chrome is the frame's border plus its reserved scrollbar gutter: the page
 * scrolls inside the paper frame, so the fit scale leaves room for it.
 */
import { type RefObject, useLayoutEffect, useState } from 'react';

const largestFit = 1.5;

export function usePreviewFit(
  well: RefObject<HTMLElement | null>,
  frame: RefObject<HTMLElement | null>,
  pageWidth: number,
) {
  const [fit, setFit] = useState({ scale: 1, chrome: 0 });

  useLayoutEffect(() => {
    const area = well.current;
    if (!area) return;
    const update = () => {
      const style = window.getComputedStyle(area);
      const padding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
      const box = frame.current;
      const chrome = box ? box.offsetWidth - box.clientWidth : 0;
      const available = Math.max(0, area.clientWidth - padding - chrome);
      setFit({ scale: Math.min(largestFit, available / pageWidth), chrome });
    };
    const observer = new ResizeObserver(update);
    observer.observe(area);
    update();
    return () => observer.disconnect();
  }, [well, frame, pageWidth]);

  return fit;
}
