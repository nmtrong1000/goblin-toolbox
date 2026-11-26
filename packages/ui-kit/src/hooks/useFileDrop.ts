/*
 * dragenter and dragleave also fire for every child the pointer crosses, so a depth counter keeps
 * the overlay from flickering while a file moves over the editor.
 */
import { type DragEvent, useRef, useState } from 'react';

function carriesFiles(event: DragEvent) {
  return event.dataTransfer.types.includes('Files');
}

export function useFileDrop(onFile: (file: File) => void) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  return {
    dragging,
    dropProps: {
      onDragEnter(event: DragEvent) {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        depth.current += 1;
        setDragging(true);
      },
      onDragOver(event: DragEvent) {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      },
      onDragLeave(event: DragEvent) {
        if (!carriesFiles(event)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      },
      onDrop(event: DragEvent) {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        depth.current = 0;
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) onFile(file);
      },
    },
  };
}
