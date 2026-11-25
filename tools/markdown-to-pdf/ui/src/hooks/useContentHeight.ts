/*
 * Mermaid diagrams, images, math and web fonts change the page height after the HTML is set, so the
 * height follows the element with a ResizeObserver instead of measuring once per render.
 */
import { type RefObject, useLayoutEffect, useState } from 'react';

export function useContentHeight(element: RefObject<HTMLElement | null>, minHeight: number) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const target = element.current;
    if (!target) return;
    const update = () => setHeight(target.scrollHeight);
    const observer = new ResizeObserver(update);
    observer.observe(target);
    update();
    return () => observer.disconnect();
  }, [element]);

  return Math.max(minHeight, height);
}
