import React from "react"
import Button from "./Button"
import { AlertTriangle } from "lucide-react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Component Error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 border border-red-200 rounded-[20px] bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Something went wrong</h2>
          </div>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>An error occurred in this component.</p>
            {this.props.showDetails && (
              <details className="mt-2">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto max-h-[200px] p-2 bg-red-100 dark:bg-red-900/40 rounded">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          <div className="mt-4">
            <Button onClick={this.resetError} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
