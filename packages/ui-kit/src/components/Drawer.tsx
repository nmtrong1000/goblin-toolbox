/*
 * On narrow screens the drawer becomes a bottom sheet and only there shows the footer, so actions
 * that sit in the page toolbar on desktop stay reachable on phones.
 */
import { type ReactNode, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useDismiss } from '#/hooks/useDismiss.ts';

type DrawerProps = {
  id?: string;
  title: string;
  icon?: ReactNode;
  closeLabel: string;
  footer?: ReactNode;
  children: ReactNode;
  onClose: () => void;
};

export function Drawer({ id, title, icon, closeLabel, footer, children, onClose }: DrawerProps) {
  const titleId = useId();
  const drawer = useRef<HTMLElement>(null);

  useDismiss(drawer, true, onClose);

  useEffect(() => {
    const area = drawer.current;
    const first =
      area?.querySelector<HTMLElement>('input:checked') ??
      area?.querySelector<HTMLElement>('input, button');
    first?.focus();
  }, []);

  return (
    <>
      <button
        aria-label={closeLabel}
        className="common-backdrop"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <aside aria-labelledby={titleId} className="common-drawer" id={id} ref={drawer}>
        <header className="common-drawer-header">
          {icon}
          <h2 className="common-drawer-title" id={titleId}>
            {title}
          </h2>
          <button
            aria-label={closeLabel}
            className="common-icon-button"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </header>
        {children}
        {footer && <div className="common-drawer-footer">{footer}</div>}
      </aside>
    </>
  );
}
