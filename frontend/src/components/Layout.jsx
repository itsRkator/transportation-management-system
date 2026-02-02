import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

const horizontalItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/shipments', label: 'Shipments' },
  { path: '/reports', label: 'Reports' },
  { path: '/settings', label: 'Settings' },
];

const hamburgerItems = [
  { path: '/', label: 'Home' },
  {
    label: 'Operations',
    children: [
      { path: '/shipments', label: 'Shipments' },
      { path: '/shipments/new', label: 'New Shipment' },
    ],
  },
  {
    label: 'Analytics',
    children: [
      { path: '/reports', label: 'Reports' },
      { path: '/reports/rates', label: 'Rates' },
    ],
  },
  { path: '/settings', label: 'Settings' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSub, setOpenSub] = useState(null);
  const { user, logout, sessionExpiredMessage, dismissSessionExpired } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const onEscape = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [sidebarOpen]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <MenuIcon fontSize="medium" />
        </button>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandShort}>TMS</span>
        </Link>
        <nav className={styles.horizontalNav}>
          {horizontalItems.map(({ path, label }) => {
            const isActive = path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <Link
                key={path}
                to={path}
                className={isActive ? styles.navActive : ''}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.headerRight}>
          <span className={styles.userBadge} title={user?.email}>
            <span className={styles.userEmail}>{user?.email}</span>
            <span className={styles.userRole}>({user?.role})</span>
          </span>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <LogoutIcon className={styles.logoutIcon} fontSize="small" />
            <span className={styles.logoutText}>Logout</span>
          </button>
        </div>
      </header>

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Menu</span>
          <button
            type="button"
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {hamburgerItems.map((item) =>
            item.children ? (
              <div key={item.label} className={styles.subMenu}>
                <button
                  type="button"
                  className={styles.subMenuTrigger}
                  onClick={() => setOpenSub((o) => (o === item.label ? null : item.label))}
                >
                  {item.label}
                </button>
                {openSub === item.label && (
                  <ul className={styles.subMenuList}>
                    {item.children.map((c) => (
                      <li key={c.path}>
                        <Link to={c.path} onClick={() => setSidebarOpen(false)}>
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={item.path === '/' ? (location.pathname === '/' ? styles.sidebarActive : '') : (location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? styles.sidebarActive : '')}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {sessionExpiredMessage && (
        <div className={styles.sessionBanner} role="alert">
          <span>{sessionExpiredMessage}</span>
          <button type="button" className={styles.sessionBannerBtn} onClick={() => { dismissSessionExpired(); navigate('/login'); }}>
            Sign in
          </button>
        </div>
      )}
      <main className={`${styles.main} mainContent`}>
        <Outlet />
      </main>
    </div>
  );
}
