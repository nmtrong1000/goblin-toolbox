import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '#/catalog/useCatalog.ts';
import { useLocalize } from '#/catalog/useLocalize.ts';
import { RemoteTool } from '#/federation/RemoteTool.tsx';

export function ToolPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const localize = useLocalize();
  const tool = useCatalog().tools.find((item) => item.slug === slug);

  return (
    <section className="page-section">
      <p className="eyebrow">{tool ? localize(tool.name) : t('home.collection')}</p>
      <h1 className="page-title">{tool ? localize(tool.name) : t('tool.unavailable')}</h1>
      {tool && <p>{localize(tool.description)}</p>}
      {tool && <RemoteTool slug={tool.slug} remote={tool.remote} />}
    </section>
  );
}
