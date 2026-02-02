import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import styles from './ShipmentFilters.module.css';

export default function ShipmentFilters({ filters, onFiltersChange }) {
  const [shipper, setShipper] = useState(filters.shipperName ?? '');
  const [carrier, setCarrier] = useState(filters.carrierName ?? '');
  const [status, setStatus] = useState(filters.status ?? '');

  const apply = () => {
    onFiltersChange({
      shipperName: shipper || undefined,
      carrierName: carrier || undefined,
      status: status || undefined,
    });
  };

  const clear = () => {
    setShipper('');
    setCarrier('');
    setStatus('');
    onFiltersChange({});
  };

  return (
    <div className={styles.wrap}>
      <FilterListIcon className={styles.filterIcon} fontSize="small" titleAccess="Filters" />
      <input
        type="text"
        placeholder="Shipper"
        value={shipper}
        onChange={(e) => setShipper(e.target.value)}
        className={styles.input}
      />
      <input
        type="text"
        placeholder="Carrier"
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        className={styles.input}
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className={styles.select}
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="in_transit">In Transit</option>
        <option value="delivered">Delivered</option>
      </select>
      <button type="button" onClick={apply} className={styles.btn}>Apply</button>
      <button type="button" onClick={clear} className={styles.btnSecondary}>Clear</button>
    </div>
  );
}
