import { type RefObject, useEffect, useState } from 'react';

export function usePreviewScale(container: RefObject<HTMLElement | null>, pageWidth: number) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const updateScale = () => {
      const style = window.getComputedStyle(element);
      const padding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
      setScale(Math.min(1, Math.max(0, element.clientWidth - padding) / pageWidth));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    updateScale();
    return () => observer.disconnect();
  }, [container, pageWidth]);

  return scale;
}
