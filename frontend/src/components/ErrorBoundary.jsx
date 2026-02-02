import { Component } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import styles from './ErrorBoundary.module.css';

/**
 * Fallback UI for uncaught React errors.
 * Wraps the app (or a subtree) and shows a retry UI when something goes wrong.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback} role="alert">
          <ErrorOutlineIcon className={styles.icon} />
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.message}>
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
          </p>
          <button type="button" className={styles.retryBtn} onClick={this.handleRetry}>
            <RefreshIcon className={styles.retryIcon} fontSize="small" />
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
