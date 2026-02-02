import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { reportError } from '../utils/errorHandler';
import styles from './ErrorDisplay.module.css';

/**
 * Centralised fallback UI for query/mutation errors.
 * Use anywhere you need to show a consistent error state (e.g. pages, modals).
 */
export default function ErrorDisplay({ error, onRetry, compact }) {
  const message = error ? reportError(error, 'UI') : 'Something went wrong';

  return (
    <div className={compact ? styles.compact : styles.wrap} role="alert">
      <ErrorOutlineIcon className={styles.icon} fontSize="small" />
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retryBtn} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
