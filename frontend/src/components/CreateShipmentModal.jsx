import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import CloseIcon from '@mui/icons-material/Close';
import { CREATE_SHIPMENT } from '../graphql/operations';
import styles from './CreateShipmentModal.module.css';

export default function CreateShipmentModal({ onClose, onSuccess }) {
  const [shipperName, setShipperName] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [status, setStatus] = useState('pending');
  const [trackingJson, setTrackingJson] = useState('{}');
  const [ratesJson, setRatesJson] = useState('{}');
  const [error, setError] = useState('');

  const [createShipment, { loading }] = useMutation(CREATE_SHIPMENT, {
    onCompleted: () => {
      onSuccess?.();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    let trackingData = {};
    let rates = {};
    try {
      trackingData = JSON.parse(trackingJson || '{}');
      rates = JSON.parse(ratesJson || '{}');
    } catch {
      setError('Invalid JSON in tracking or rates');
      return;
    }
    createShipment({
      variables: {
        input: {
          shipperName,
          carrierName,
          pickupLocation,
          deliveryLocation,
          status,
          trackingData,
          rates,
        },
      },
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>New Shipment</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close"><CloseIcon fontSize="small" /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            <span>Shipper name</span>
            <input value={shipperName} onChange={(e) => setShipperName(e.target.value)} required />
          </label>
          <label>
            <span>Carrier name</span>
            <input value={carrierName} onChange={(e) => setCarrierName(e.target.value)} required />
          </label>
          <label>
            <span>Pickup location</span>
            <input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} required />
          </label>
          <label>
            <span>Delivery location</span>
            <input value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} required />
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </label>
          <label>
            <span>Tracking (JSON)</span>
            <textarea value={trackingJson} onChange={(e) => setTrackingJson(e.target.value)} rows={2} />
          </label>
          <label>
            <span>Rates (JSON)</span>
            <textarea value={ratesJson} onChange={(e) => setRatesJson(e.target.value)} rows={2} />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
