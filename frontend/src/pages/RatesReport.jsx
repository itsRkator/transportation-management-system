import { useQuery } from '@apollo/client/react';
import { SHIPMENT_STATS } from '../graphql/operations';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import styles from './Reports.module.css';

export default function RatesReport() {
  const { data, loading, error } = useQuery(SHIPMENT_STATS);

  const stats = data?.shipmentStats;

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading rates report…</p></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>{error.message}</p></div>;
  if (!stats) return null;

  const byCarrier = stats.byCarrier ?? [];
  const totalFreight = Number(stats.totalFreight ?? 0);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        <AttachMoneyIcon className={styles.titleIcon} />
        Rates Report
      </h1>
      <p className={styles.lead}>Freight and rates summary by carrier from shipment data.</p>

      <section className={styles.card} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.cardIconWrap}>
          <AttachMoneyIcon />
        </div>
        <h2>Total Freight (All Shipments)</h2>
        <p className={styles.bigNumber}>${totalFreight.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
      </section>

      <section className={styles.section}>
        <h2>
          <LocalShippingIcon className={styles.sectionIcon} />
          Freight by Carrier
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Carrier</th>
                <th>Shipments</th>
                <th>Total Freight</th>
                <th>Avg per Shipment</th>
              </tr>
            </thead>
            <tbody>
              {byCarrier.length ? byCarrier.map(({ carrierName, count, totalFreight: carrierFreight }) => {
                const freight = Number(carrierFreight ?? 0);
                const avg = count ? freight / count : 0;
                return (
                  <tr key={carrierName}>
                    <td>{carrierName}</td>
                    <td>{count}</td>
                    <td>${freight.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td>${avg.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4}>No carrier data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
