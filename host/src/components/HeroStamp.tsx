import { Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function HeroStamp() {
  const { t } = useTranslation();

  return (
    <div aria-hidden="true" className="hero-stamp">
      <svg className="hero-stamp-ring" viewBox="0 0 240 240">
        <defs>
          <path d="M120,120 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" id="hero-stamp-path" />
        </defs>
        <circle className="hero-stamp-outer" cx="120" cy="120" r="114" />
        <circle className="hero-stamp-inner" cx="120" cy="120" r="72" />
        <text className="hero-stamp-text" lengthAdjust="spacing" textLength="570">
          <textPath href="#hero-stamp-path">{t('home.stamp')}</textPath>
        </text>
      </svg>
      <span className="hero-stamp-core">
        <Wrench strokeWidth={1.8} />
      </span>
    </div>
  );
}
