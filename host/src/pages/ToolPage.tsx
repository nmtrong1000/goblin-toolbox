import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '#/catalog/useCatalog.ts';
import { useLocalize } from '#/catalog/useLocalize.ts';
import { Breadcrumb, type Crumb } from '#/components/Breadcrumb.tsx';
import { ToolIcon } from '#/components/ToolIcon.tsx';
import { RemoteTool } from '#/federation/RemoteTool.tsx';

export function ToolPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const localize = useLocalize();
  const { tools, vaults } = useCatalog();
  const tool = tools.find((item) => item.slug === slug);
  const vault = tool && vaults.find((item) => item.slug === tool.vault);
  const crumbs: Crumb[] = [{ label: t('nav.home'), to: '/' }];
  if (vault) crumbs.push({ label: localize(vault.name), to: `/vaults/${vault.slug}` });
  crumbs.push({ label: tool ? localize(tool.name) : t('tool.unavailable') });

  return (
    <section className="container tool-page">
      <Breadcrumb items={crumbs} />
      <header className="tool-header rise rise-1">
        {tool && <ToolIcon icon={tool.icon} large />}
        <div className="tool-header-text">
          <h1 className="tool-title">{tool ? localize(tool.name) : t('tool.unavailable')}</h1>
          {tool && <p className="tool-description">{localize(tool.description)}</p>}
        </div>
        {vault && <span className="chip">{localize(vault.name)}</span>}
      </header>
      {tool && <RemoteTool slug={tool.slug} remote={tool.remote} />}
    </section>
  );
}
