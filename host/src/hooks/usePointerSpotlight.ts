import { type RefObject, useEffect } from 'react';

const follow = 0.2;

export function usePointerSpotlight(target: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let frame = 0;
    let visible = false;
    let goal = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    function paint() {
      if (!element) return;
      current = {
        x: current.x + (goal.x - current.x) * follow,
        y: current.y + (goal.y - current.y) * follow,
      };
      element.style.setProperty('--spot-x', `${current.x.toFixed(1)}px`);
      element.style.setProperty('--spot-y', `${current.y.toFixed(1)}px`);
      const settled = Math.abs(goal.x - current.x) < 0.5 && Math.abs(goal.y - current.y) < 0.5;
      frame = settled ? 0 : requestAnimationFrame(paint);
    }

    function show(next: boolean) {
      visible = next;
      element?.style.setProperty('--spot-opacity', next ? '1' : '0');
    }

    function move(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || !element) return;
      const box = element.getBoundingClientRect();
      const inside =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      goal = { x: event.clientX - box.left, y: event.clientY - box.top };
      if (inside && !visible) current = goal;
      show(inside);
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function leave() {
      show(false);
    }

    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(frame);
    };
  }, [target]);
}
