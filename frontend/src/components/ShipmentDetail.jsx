import { useQuery } from '@apollo/client/react';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SHIPMENT } from '../graphql/operations';
import styles from './ShipmentDetail.module.css';

export default function ShipmentDetail({ shipmentId, onClose, canEdit, onEdit }) {
  const { data, loading, error } = useQuery(SHIPMENT, {
    variables: { id: shipmentId },
    skip: !shipmentId,
  });

  const s = data?.shipment;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Shipment #{shipmentId}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <CloseIcon fontSize="small" />
          </button>
        </div>
        {loading && <p className={styles.loading}>Loading…</p>}
        {error && <p className={styles.error}>{error.message}</p>}
        {s && (
          <div className={styles.body}>
            <section className={styles.section}>
              <h3>Parties</h3>
              <dl>
                <dt>Shipper</dt>
                <dd>{s.shipperName}</dd>
                <dt>Carrier</dt>
                <dd>{s.carrierName}</dd>
              </dl>
            </section>
            <section className={styles.section}>
              <h3>Locations</h3>
              <dl>
                <dt>Pickup</dt>
                <dd>{s.pickupLocation}</dd>
                <dt>Delivery</dt>
                <dd>{s.deliveryLocation}</dd>
              </dl>
            </section>
            <section className={styles.section}>
              <h3>Status &amp; tracking</h3>
              <dl>
                <dt>Status</dt>
                <dd><span className={styles.statusBadge}>{s.status}</span></dd>
                <dt>Tracking</dt>
                <dd>
                  {s.trackingData && typeof s.trackingData === 'object' ? (
                    <pre className={styles.pre}>{JSON.stringify(s.trackingData, null, 2)}</pre>
                  ) : (
                    String(s.trackingData || '-')
                  )}
                </dd>
              </dl>
            </section>
            <section className={styles.section}>
              <h3>Rates</h3>
              <dl>
                <dd>
                  {s.rates && typeof s.rates === 'object' ? (
                    <pre className={styles.pre}>{JSON.stringify(s.rates, null, 2)}</pre>
                  ) : (
                    String(s.rates || '-')
                  )}
                </dd>
              </dl>
            </section>
            <section className={styles.section}>
              <dl>
                <dt>Created</dt>
                <dd>{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</dd>
                <dt>Updated</dt>
                <dd>{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '-'}</dd>
              </dl>
            </section>
        </div>
        )}
        <div className={styles.footer}>
          {canEdit && onEdit && s && (
            <button type="button" className={styles.editBtn} onClick={() => onEdit(s)}>
              <EditIcon className={styles.footerIcon} fontSize="small" />
              Edit shipment
            </button>
          )}
          <button type="button" className={styles.backBtn} onClick={onClose}>
            <ArrowBackIcon className={styles.footerIcon} fontSize="small" />
            Back to list
          </button>
        </div>
      </div>
    </div>
  );
}
