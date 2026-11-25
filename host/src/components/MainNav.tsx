import { Archive, House } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const links = [
  { to: '/', label: 'nav.home', Icon: House, end: true },
  { to: '/vaults', label: 'nav.vaults', Icon: Archive, end: false },
];

export function MainNav() {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('nav.label')} className="main-nav">
      {links.map(({ to, label, Icon, end }) => (
        <NavLink end={end} key={to} to={to} viewTransition>
          <Icon aria-hidden="true" size={16} />
          {t(label)}
        </NavLink>
      ))}
    </nav>
  );
}
