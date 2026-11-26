"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Wraps the portfolio render tree (editor preview, read-only preview route)
 * so a crash inside one section — malformed data, a bad image URL, whatever
 * — shows a contained fallback instead of taking down the whole editor or
 * dashboard around it. Portfolio content is comparatively unpredictable
 * (AI-extracted, hand-edited, occasionally missing fields); the rest of the
 * app — the sidebar, the toolbar, navigation — shouldn't go down with it.
 */
export class PortfolioRenderErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[PortfolioRenderErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-10 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium">Something went wrong rendering this portfolio.</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            This usually means a piece of content is in an unexpected shape. Your saved data hasn&apos;t been
            touched — try reloading the page.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
