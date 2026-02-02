import { useQuery } from '@apollo/client/react';
import { ME } from '../graphql/operations';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import styles from './Settings.module.css';

export default function Settings() {
  const { data, loading, error } = useQuery(ME);

  const user = data?.me;

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading…</p></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>{error.message}</p></div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        <SettingsIcon className={styles.titleIcon} />
        Settings
      </h1>
      <p className={styles.lead}>Your account and application settings.</p>

      <section className={styles.section}>
        <h2><PersonIcon className={styles.sectionIcon} /> Profile</h2>
        {user ? (
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt><EmailIcon className={styles.dtIcon} /> Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt><BadgeIcon className={styles.dtIcon} /> Role</dt>
              <dd><span className={styles.roleBadge}>{user.role}</span></dd>
            </div>
          </dl>
        ) : (
          <p>Not signed in.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2><InfoIcon className={styles.sectionIcon} /> Application</h2>
        <dl className={styles.dl}>
          <div className={styles.dlRow}>
            <dt>App</dt>
            <dd>TMS – Transportation Management System</dd>
          </div>
          <div className={styles.dlRow}>
            <dt>Version</dt>
            <dd>1.0.0</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
