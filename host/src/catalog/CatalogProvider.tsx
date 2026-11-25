import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogContext } from '#/catalog/catalog-context.ts';
import { loadCatalog } from '#/catalog/load-catalog.ts';
import type { Catalog } from '#/catalog/types.ts';

type CatalogProviderProps = { children: ReactNode };

export function CatalogProvider({ children }: CatalogProviderProps) {
  const { t } = useTranslation();
  const [catalog, setCatalog] = useState<Catalog>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    loadCatalog()
      .then((loaded) => active && setCatalog(loaded))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  if (failed) {
    return (
      <p className="page-section" role="alert">
        {t('catalog.failed')}
      </p>
    );
  }
  if (!catalog) return <p className="page-section">{t('catalog.loading')}</p>;
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}
