import { Component } from 'react';
/**
 * Catches a crash inside one game round, so a bug in one game shows a friendly card instead of a blank app.
 * Give it a new `key` to try again.
 */
export class ErrorBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(error) {
        console.error(error);
    }
    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
