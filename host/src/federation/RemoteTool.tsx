import { useTranslation } from 'react-i18next';
import { ToolBoundary } from '#/federation/ToolBoundary.tsx';
import { ToolLoadError } from '#/federation/ToolLoadError.tsx';
import { useRemoteTool } from '#/federation/useRemoteTool.ts';

type RemoteToolProps = { slug: string; remote: string };

export function RemoteTool({ slug, remote }: RemoteToolProps) {
  const { t } = useTranslation();
  const state = useRemoteTool(slug, remote);

  if (state.status === 'failed') return <ToolLoadError />;
  if (state.status === 'loading') return <p>{t('tool.loading')}</p>;
  return (
    <ToolBoundary fallback={<ToolLoadError />}>
      <state.Tool />
    </ToolBoundary>
  );
}
