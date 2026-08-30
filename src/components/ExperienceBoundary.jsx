import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ExperienceBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Portfolio experience error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="error-state">
        <div className="error-card">
          <AlertTriangle size={28} />
          <h1>Something didn’t load correctly.</h1>
          <p>The portfolio hit an unexpected issue. A quick refresh should restore the experience.</p>
          <button onClick={() => window.location.reload()}>
            <RefreshCw size={17} /> Refresh portfolio
          </button>
        </div>
      </main>
    );
  }
}

export function SectionSkeleton() {
  return (
    <div className="section-shell px-4 py-24 sm:px-6" aria-label="Loading portfolio section" role="status">
      <div className="mx-auto max-w-7xl">
        <div className="skeleton-line w-32" />
        <div className="skeleton-line mt-4 h-12 max-w-xl" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </div>
    </div>
  );
}
