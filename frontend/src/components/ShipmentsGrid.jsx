import styles from './ShipmentsGrid.module.css';

const COLS = [
  { key: 'id', label: 'ID' },
  { key: 'shipperName', label: 'Shipper' },
  { key: 'carrierName', label: 'Carrier' },
  { key: 'pickupLocation', label: 'Pickup' },
  { key: 'deliveryLocation', label: 'Delivery' },
  { key: 'status', label: 'Status' },
  { key: 'trackingData', label: 'Tracking' },
  { key: 'rates', label: 'Rates' },
  { key: 'createdAt', label: 'Created' },
  { key: 'actions', label: '' },
];

function cellValue(shipment, key) {
  const v = shipment[key];
  if (key === 'trackingData' && v) return typeof v === 'object' ? (v.trackingNumber || JSON.stringify(v).slice(0, 30)) : String(v).slice(0, 30);
  if (key === 'rates' && v) return typeof v === 'object' ? (`$${v.freight ?? v.total ?? '-'}`) : String(v).slice(0, 20);
  if (key === 'createdAt' && v) return new Date(v).toLocaleDateString();
  if (key === 'actions') return null;
  return v ?? '-';
}

export default function ShipmentsGrid({ shipments, onRowClick }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLS.map(({ key, label }) => (
              <th key={key}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr key={s.id} onClick={() => onRowClick(s)} className={styles.row}>
              {COLS.map(({ key }) => (
                <td key={key}>
                  {key === 'actions' ? (
                    <span className={styles.viewLink}>View</span>
                  ) : (
                    cellValue(s, key)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
