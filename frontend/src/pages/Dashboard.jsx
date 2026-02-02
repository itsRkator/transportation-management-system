import { Link } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.lead}>Welcome to the Transportation Management System.</p>
      <div className={styles.cards}>
        <Link to="/shipments" className={styles.card}>
          <LocalShippingIcon className={styles.cardIcon} />
          <h2>Shipments</h2>
          <p>View and manage shipments in grid or tile view.</p>
        </Link>
        <Link to="/reports" className={styles.card}>
          <AssessmentIcon className={styles.cardIcon} />
          <h2>Reports</h2>
          <p>Shipment analytics, status breakdown, and carrier stats.</p>
        </Link>
        <Link to="/settings" className={styles.card}>
          <SettingsIcon className={styles.cardIcon} />
          <h2>Settings</h2>
          <p>Your profile, role, and application info.</p>
        </Link>
      </div>
    </div>
  );
}
