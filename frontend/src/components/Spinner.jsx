import styles from './Spinner.module.css';

/**
 * Reusable loading spinner for consistent loading states.
 */
export default function Spinner({ size = 'medium', className = '' }) {
  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
