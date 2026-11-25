import { useState } from 'react';
import { Wrench } from 'lucide-react';

type ToolIconProps = { icon?: string; large?: boolean };

export function ToolIcon({ icon, large = false }: ToolIconProps) {
  const [failedIcon, setFailedIcon] = useState<string>();
  const usable = icon !== undefined && icon !== failedIcon;
  const mask = usable ? `url("${icon}")` : undefined;

  return (
    <span aria-hidden="true" className={large ? 'tool-icon tool-icon-large' : 'tool-icon'}>
      {usable ? (
        <>
          <span className="tool-icon-glyph" style={{ maskImage: mask, WebkitMaskImage: mask }} />
          <img alt="" hidden onError={() => setFailedIcon(icon)} src={icon} />
        </>
      ) : (
        <Wrench strokeWidth={1.8} />
      )}
    </span>
  );
}
