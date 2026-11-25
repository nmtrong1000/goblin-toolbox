import { useRef } from 'react';
import { usePointerSpotlight } from '#/hooks/usePointerSpotlight.ts';

export function HeroHalftone() {
  const area = useRef<HTMLDivElement>(null);
  usePointerSpotlight(area);

  return (
    <div aria-hidden="true" className="hero-halftone" ref={area}>
      <div className="hero-halftone-dots" />
      <div className="hero-halftone-spot" />
    </div>
  );
}
