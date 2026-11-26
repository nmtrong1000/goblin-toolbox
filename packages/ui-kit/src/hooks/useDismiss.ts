/*
 * Escape bubbles from the innermost open area outwards; the first one to handle it marks the event
 * with preventDefault, so a color popover closes before the settings drawer that contains it.
 */
import { type RefObject, useEffect, useRef } from 'react';

type DismissOptions = { outsideClick?: boolean };
export type DismissReason = 'escape' | 'outside';

export function useDismiss(
  area: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: (reason: DismissReason) => void,
  { outsideClick = false }: DismissOptions = {},
) {
  const dismiss = useRef(onDismiss);

  useEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!open) return;
    const element = area.current;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      dismiss.current('escape');
    }

    function onPointerDown(event: PointerEvent) {
      if (element && event.target instanceof Node && !element.contains(event.target)) {
        dismiss.current('outside');
      }
    }

    element?.addEventListener('keydown', onKeyDown);
    if (outsideClick) document.addEventListener('pointerdown', onPointerDown);
    return () => {
      element?.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [area, open, outsideClick]);
}
