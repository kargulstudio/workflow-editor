"use client";

import { Component, type ReactNode } from "react";

type AssetRiveBoundaryProps = {
  children: ReactNode;
};

type AssetRiveBoundaryState = {
  failed: boolean;
};

class AssetRiveBoundary extends Component<
  AssetRiveBoundaryProps,
  AssetRiveBoundaryState
> {
  state: AssetRiveBoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default AssetRiveBoundary;
