import { Component, type ReactNode } from 'react';

type ToolBoundaryProps = { children: ReactNode; fallback: ReactNode };

export class ToolBoundary extends Component<ToolBoundaryProps> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
