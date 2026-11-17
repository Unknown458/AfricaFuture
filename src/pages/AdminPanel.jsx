import { useCallback, useEffect, useRef, useState } from 'react';
import AdminIcon from '../admin/AdminIcon';
import Dashboard from '../admin/Dashboard';
import GalleryManager from '../admin/GalleryManager';
import PromotionsManager from '../admin/PromotionsManager';
import SiteImagesManager from '../admin/SiteImagesManager';
import SettingsView from '../admin/SettingsView';
import { Modal } from '../admin/AdminUI';
import { useSiteContent } from '../hooks/useSiteContent';
import { getSession, logout } from '../services/auth';
import '../styles/admin.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', desc: 'Overview of your website content' },
  { id: 'gallery', label: 'Gallery Images', icon: 'gallery', desc: 'Upload and manage images shown in your website gallery' },
  { id: 'promotions', label: 'Promotions', icon: 'promo', desc: 'Create, schedule and manage your offers & deals' },
  { id: 'site-images', label: 'Website Images', icon: 'layout', desc: 'Replace the main images used across your website' },
  { id: 'settings', label: 'Settings', icon: 'settings', desc: 'Account security, backups and data' },
];

function AdminPanel({ onNavigate }) {
  const content = useSiteContent();
  const [tab, setTab] = useState(() => sessionStorage.getItem('af-admin-tab') || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolver = useRef(null);
  const session = getSession();

  useEffect(() => {
    document.title = 'Admin Panel | AfricaFuture';
  }, []);

  useEffect(() => {
    sessionStorage.setItem('af-admin-tab', tab);
  }, [tab]);

  // Kick back to login when session expires
  useEffect(() => {
    const t = setInterval(() => {
      if (!getSession()) onNavigate('/login');
    }, 60000);
    return () => clearInterval(t);
  }, [onNavigate]);

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        confirmResolver.current = resolve;
        setConfirmState(options);
      }),
    []
  );

  const closeConfirm = (result) => {
    confirmResolver.current?.(result);
    confirmResolver.current = null;
    setConfirmState(null);
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Sign out?',
      text: 'You will need to sign in again to manage your website.',
      confirmText: 'Sign out',
    });
    if (!ok) return;
    logout();
    onNavigate('/login');
  };

  const goTo = (id) => {
    setTab(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  };

  const current = NAV.find((n) => n.id === tab) || NAV[0];
  const shared = { ...content, toast, confirm, goTo };

  return (
    <div className="adm-shell">
      {/* Sidebar */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="adm-sidebar-brand">
          <span className="adm-logo-mark">AF</span>
          <div>
            <div className="adm-logo-text">
              Africa<span>Future</span>
            </div>
            <div className="adm-sidebar-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="adm-nav">
          <div className="adm-nav-label">Manage</div>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`adm-nav-item ${tab === item.id ? 'is-active' : ''}`}
              onClick={() => goTo(item.id)}
            >
              <AdminIcon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'gallery' && content.gallery.length > 0 && (
                <span className="adm-nav-count">{content.gallery.length}</span>
              )}
              {item.id === 'promotions' && content.promotions.length > 0 && (
                <span className="adm-nav-count">{content.promotions.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <button type="button" className="adm-nav-item" onClick={() => window.open('/', '_blank')}>
            <AdminIcon name="external" />
            <span>View Website</span>
          </button>
          <button type="button" className="adm-nav-item is-danger" onClick={handleLogout}>
            <AdminIcon name="logout" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="adm-sidebar-scrim" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="adm-main">
        <header className="adm-topbar">
          <button type="button" className="adm-icon-btn adm-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <AdminIcon name="menu" />
          </button>
          <div className="adm-topbar-title">
            <h1>{current.label}</h1>
            <p>{current.desc}</p>
          </div>
          <div className="adm-topbar-actions">
            <button type="button" className="adm-btn adm-btn--ghost adm-hide-sm" onClick={() => window.open('/', '_blank')}>
              <AdminIcon name="external" size={16} /> View Site
            </button>
            <div className="adm-user">
              <div className="adm-avatar">
                {(session?.username || session?.company || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info adm-hide-sm">
                <strong>{session?.username || 'Administrator'}</strong>
                <span>{session?.company || 'AfricaFuture'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="adm-content">
          {!content.loaded ? (
            <div className="adm-loading">
              <span className="adm-spinner adm-spinner--dark" /> Loading content…
            </div>
          ) : (
            <>
              {tab === 'dashboard' && <Dashboard {...shared} />}
              {tab === 'gallery' && <GalleryManager {...shared} />}
              {tab === 'promotions' && <PromotionsManager {...shared} />}
              {tab === 'site-images' && <SiteImagesManager {...shared} />}
              {tab === 'settings' && <SettingsView {...shared} onNavigate={onNavigate} />}
            </>
          )}
        </main>
      </div>

      {/* Toasts */}
      <div className="adm-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast--${t.type}`}>
            <span className="adm-toast-icon">{t.type === 'error' ? '!' : '✓'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <Modal
          title={confirmState.title}
          size="sm"
          onClose={() => closeConfirm(false)}
          footer={
            <>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => closeConfirm(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={`adm-btn ${confirmState.danger ? 'adm-btn--danger' : 'adm-btn--primary'}`}
                onClick={() => closeConfirm(true)}
                autoFocus
              >
                {confirmState.confirmText || 'Confirm'}
              </button>
            </>
          }
        >
          <p className="adm-confirm-text">{confirmState.text}</p>
        </Modal>
      )}
    </div>
  );
}

export default AdminPanel;
