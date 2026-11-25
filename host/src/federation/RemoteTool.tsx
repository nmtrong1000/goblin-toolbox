import { ToolBoundary } from '#/federation/ToolBoundary.tsx';
import { ToolLoadError } from '#/federation/ToolLoadError.tsx';
import { ToolSkeleton } from '#/federation/ToolSkeleton.tsx';
import { useRemoteTool } from '#/federation/useRemoteTool.ts';

type RemoteToolProps = { slug: string; remote: string };

export function RemoteTool({ slug, remote }: RemoteToolProps) {
  const state = useRemoteTool(slug, remote);

  if (state.status === 'failed') return <ToolLoadError />;
  if (state.status === 'loading') return <ToolSkeleton />;
  return (
    <ToolBoundary fallback={<ToolLoadError />}>
      <state.Tool />
    </ToolBoundary>
  );
}
