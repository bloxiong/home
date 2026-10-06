import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Admin page crashed', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="mx-auto mt-10 max-w-lg rounded-2xl border border-danger/40 bg-surface p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-danger" aria-hidden />
        <h1 className="mt-3 font-display text-xl">This page hit a problem</h1>
        <p className="mt-2 text-sm text-muted">{String(this.state.error?.message || this.state.error)}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={() => this.setState({ error: null })}
            className="h-10 rounded-xl border border-line px-4 text-sm font-bold hover:border-accent/60">Try again</button>
          <button type="button" onClick={() => window.location.reload()}
            className="h-10 rounded-xl bg-accent px-4 text-sm font-bold text-on-accent">Reload</button>
        </div>
      </div>
    )
  }
}
