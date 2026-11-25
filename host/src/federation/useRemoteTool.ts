import { type ComponentType, useEffect, useState } from 'react';
import { loadRemote, registerRemotes } from '@module-federation/runtime';
import { federationName } from '@goblin/ui-kit/federation';

const registered = new Set<string>();

export type RemoteToolState =
  { status: 'loading' } | { status: 'failed' } | { status: 'ready'; Tool: ComponentType };

export function useRemoteTool(slug: string, remote: string) {
  const name = federationName(slug);
  const [result, setResult] = useState<{ name: string; state: RemoteToolState }>();

  useEffect(() => {
    let active = true;
    if (!registered.has(name)) {
      registerRemotes([{ name, entry: remote, type: 'module' }]);
      registered.add(name);
    }
    loadRemote<{ default: ComponentType }>(`${name}/Tool`)
      .then((module) => {
        if (!active) return;
        const Tool = module?.default;
        setResult({ name, state: Tool ? { status: 'ready', Tool } : { status: 'failed' } });
      })
      .catch(() => active && setResult({ name, state: { status: 'failed' } }));
    return () => {
      active = false;
    };
  }, [name, remote]);

  return result?.name === name ? result.state : ({ status: 'loading' } as const);
}
