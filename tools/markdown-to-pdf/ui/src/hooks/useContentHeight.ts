/*
 * html and css are not read here; they are the inputs that change the element's height, so a
 * change in either one measures again after the browser lays it out.
 */
import { type RefObject, useEffect, useState } from 'react';

export function useContentHeight(
  element: RefObject<HTMLElement | null>,
  minHeight: number,
  html: string,
  css: string,
) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setHeight(element.current?.scrollHeight ?? minHeight);
    });
    return () => cancelAnimationFrame(frame);
  }, [element, minHeight, html, css]);

  return Math.max(minHeight, height);
}
