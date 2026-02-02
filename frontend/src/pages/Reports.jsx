import { useQuery } from '@apollo/client/react';
import { SHIPMENT_STATS } from '../graphql/operations';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import styles from './Reports.module.css';

export default function Reports() {
  const { data, loading, error } = useQuery(SHIPMENT_STATS);

  const stats = data?.shipmentStats;

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading reports…</p></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>{error.message}</p></div>;
  if (!stats) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        <AssessmentIcon className={styles.titleIcon} />
        Reports
      </h1>
      <p className={styles.lead}>Shipment analytics and summary from your TMS data.</p>

      <div className={styles.cards}>
        <section className={styles.card}>
          <div className={styles.cardIconWrap}>
            <LocalShippingIcon />
          </div>
          <h2>Total Shipments</h2>
          <p className={styles.bigNumber}>{stats.total}</p>
        </section>
        <section className={styles.card}>
          <div className={styles.cardIconWrap}>
            <TrendingUpIcon />
          </div>
          <h2>Total Freight Value</h2>
          <p className={styles.bigNumber}>${Number(stats.totalFreight || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </section>
      </div>

      <section className={styles.section}>
        <h2>Shipments by Status</h2>
        <ul className={styles.list}>
          {stats.byStatus?.length ? stats.byStatus.map(({ status, count }) => (
            <li key={status} className={styles.listItem}>
              <span className={styles.statusBadge}>{status}</span>
              <span className={styles.count}>{count}</span>
            </li>
          )) : <li className={styles.listItem}>No data</li>}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Shipments by Carrier</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Carrier</th>
                <th>Count</th>
                <th>Total Freight</th>
              </tr>
            </thead>
            <tbody>
              {stats.byCarrier?.length ? stats.byCarrier.map(({ carrierName, count, totalFreight }) => (
                <tr key={carrierName}>
                  <td>{carrierName}</td>
                  <td>{count}</td>
                  <td>${Number(totalFreight || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                </tr>
              )) : (
                <tr><td colSpan={3}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
