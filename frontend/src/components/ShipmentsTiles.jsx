import { useState, useEffect, useRef } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import styles from './ShipmentsTiles.module.css';

function formatRates(rates) {
  if (!rates) return '-';
  if (typeof rates === 'object' && rates.freight != null) return `$${rates.freight}`;
  if (typeof rates === 'object' && rates.total != null) return `$${rates.total}`;
  return '-';
}

export default function ShipmentsTiles({ shipments, flaggedIds = new Set(), onTileClick, onEdit, onFlag, onDelete }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const isFlagged = (id) => (flaggedIds instanceof Set ? flaggedIds.has(id) : false);

  return (
    <div className={styles.grid}>
      {shipments.map((s) => (
        <article
          key={s.id}
          className={styles.tile}
          onClick={() => onTileClick(s)}
        >
          <div className={styles.tileHeader}>
            <span className={styles.tileId}>#{s.id}</span>
            {isFlagged(s.id) && <FlagIcon className={styles.flagIcon} fontSize="small" titleAccess="Flagged" />}
            <div className={styles.menuWrap} ref={openMenuId === s.id ? menuRef : null}>
              <button
                type="button"
                className={styles.menuBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === s.id ? null : s.id);
                }}
                aria-label="More options"
              >
                <MoreVertIcon fontSize="small" />
              </button>
              {openMenuId === s.id && (
                <ul className={styles.menu} onClick={(e) => e.stopPropagation()}>
                  <li><button type="button" onClick={() => { onEdit?.(s); setOpenMenuId(null); }}><EditIcon className={styles.menuItemIcon} fontSize="small" /> Edit</button></li>
                  <li><button type="button" onClick={() => { onFlag?.(s); setOpenMenuId(null); }}><FlagIcon className={styles.menuItemIcon} fontSize="small" /> {isFlagged(s.id) ? 'Unflag' : 'Flag'}</button></li>
                  <li><button type="button" className={styles.deleteDisabled} disabled title="Delete not available (API supports Add/Update only)"><DeleteOutlineIcon className={styles.menuItemIcon} fontSize="small" /> Delete</button></li>
                </ul>
              )}
            </div>
          </div>
          <div className={styles.tileBody}>
            <p className={styles.shipper}>{s.shipperName}</p>
            <p className={styles.carrier}>{s.carrierName}</p>
            <p className={styles.location}>{s.pickupLocation}</p>
            <p className={styles.location}>→ {s.deliveryLocation}</p>
            <p className={styles.status}>{s.status}</p>
            <p className={styles.rates}>{formatRates(s.rates)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
