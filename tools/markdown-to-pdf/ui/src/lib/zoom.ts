export type Zoom = 'fit' | number;

export const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5];

export function stepZoom(zoom: Zoom, fitScale: number, direction: 1 | -1): Zoom {
  const current = zoom === 'fit' ? fitScale : zoom;
  const next =
    direction > 0
      ? zoomLevels.find((level) => level > current + 0.001)
      : [...zoomLevels].reverse().find((level) => level < current - 0.001);
  return next ?? zoom;
}
