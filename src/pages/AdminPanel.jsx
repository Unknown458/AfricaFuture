import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdminIcon from '../admin/AdminIcon';
import Dashboard from '../admin/Dashboard';
import GalleryManager from '../admin/GalleryManager';
import PromotionsManager from '../admin/PromotionsManager';
import SiteImagesManager from '../admin/SiteImagesManager';
import WebsiteAdminsManager from '../admin/WebsiteAdminsManager';
import SettingsView from '../admin/SettingsView';
import { Modal } from '../admin/AdminUI';
import { useSiteContent } from '../hooks/useSiteContent';
import AuthMiddleware from '../middlewares/auth/auth';
import { getSession, logout } from '../services/auth';
import { getMediaListApi, mapApiMediaItem } from '../services/media/mediaService';
import { getAllWebsites } from '../services/website/websiteService';
import '../styles/admin.css';

const BASE_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', desc: 'Overview of your website content' },
  { id: 'gallery', label: 'Gallery Images', icon: 'gallery', desc: 'Upload and manage images shown in your website gallery' },
  { id: 'promotions', label: 'Promotions', icon: 'promo', desc: 'Create, schedule and manage your offers & deals' },
  { id: 'site-images', label: 'Website Images', icon: 'layout', desc: 'Replace the main images used across your website' },
  { id: 'settings', label: 'Settings', icon: 'settings', desc: 'Account security, backups and data' },
];

function AdminPanel({ onNavigate, tenant = 'Admin', loginPath = '/login' }) {
  const content = useSiteContent();
  const [tab, setTab] = useState(() => sessionStorage.getItem('af-admin-tab') || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolver = useRef(null);
  const session = getSession();
  const isSuperAdmin = Boolean(session?.isSuperAdmin);

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

  // SuperAdmin multi-website state
  const [websites, setWebsites] = useState([]);
  const [currentWebsite, setCurrentWebsite] = useState(null);
  const [serverMediaList, setServerMediaList] = useState([]);

  const activeWebsiteId = currentWebsite?.websiteId || websites[0]?.websiteId || 1;
  const activeTenant = currentWebsite?.websiteName || session?.company || tenant;
  const logoMark = activeTenant === 'Meemcurtain' ? 'MC' : activeTenant === 'Royalcurtain' ? 'RC' : 'AF';

  // Load server media for Dashboard stats & sidebar count
  useEffect(() => {
    let isMounted = true;
    getMediaListApi({ websiteId: activeWebsiteId })
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data)) {
          setServerMediaList(res.data.map(mapApiMediaItem).filter(Boolean));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [activeWebsiteId, tab]);

  const combinedGallery = useMemo(() => {
    if (!serverMediaList || serverMediaList.length === 0) {
      return content.gallery;
    }
    const serverIds = new Set(serverMediaList.map((m) => String(m.mediaId || m.id)));
    const localOnly = content.gallery.filter(
      (g) => !g.mediaId || !serverIds.has(String(g.mediaId))
    );
    return [...serverMediaList, ...localOnly];
  }, [serverMediaList, content.gallery]);

  // Load all websites if SuperAdmin
  useEffect(() => {
    if (isSuperAdmin) {
      getAllWebsites().then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setWebsites(res.data);
          const savedId = Number(sessionStorage.getItem('af-admin-active-website-id'));
          const found = res.data.find((w) => w.websiteId === savedId) || res.data[0];
          setCurrentWebsite(found);
        }
      });
    }
  }, [isSuperAdmin]);

  const handleSelectWebsite = (site) => {
    setCurrentWebsite(site);
    sessionStorage.setItem('af-admin-active-website-id', site.websiteId);
    toast(`Switched context to: ${site.websiteName}`);
  };

  const handleSelectWebsiteById = (siteId) => {
    const found = websites.find((w) => w.websiteId === Number(siteId));
    if (found) handleSelectWebsite(found);
  };

  useEffect(() => {
    document.title = `${activeTenant} Admin Panel`;
  }, [activeTenant]);

  useEffect(() => {
    sessionStorage.setItem('af-admin-tab', tab);
  }, [tab]);

  // Auto-logout when session expires: verifies with AuthMiddleware every 5 seconds
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const isValid = await AuthMiddleware();
      if (!isMounted) return;
      if (!isValid) {
        toast('Session expired. Please sign in again.', 'error');
        setTimeout(() => {
          if (isMounted) onNavigate(loginPath);
        }, 600);
      }
    };

    verifySession();
    const timer = setInterval(verifySession, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [loginPath, onNavigate, toast]);

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Sign out?',
      text: 'You will need to sign in again to manage your website.',
      confirmText: 'Sign out',
    });
    if (!ok) return;
    logout();
    onNavigate(loginPath);
  };

  const goTo = (id) => {
    setTab(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  };

  // Build navigation items (insert Website Admins for Super Admin)
  const navItems = isSuperAdmin
    ? [
        BASE_NAV[0],
        { id: 'website-admins', label: 'Website Admins', icon: 'users', desc: 'Create and manage website administrators' },
        ...BASE_NAV.slice(1),
      ]
    : BASE_NAV;

  const current = navItems.find((n) => n.id === tab) || navItems[0];
  const shared = { ...content, gallery: combinedGallery, toast, confirm, goTo };

  return (
    <div className="adm-shell">
      {/* Sidebar */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="adm-sidebar-brand">
          <span className="adm-logo-mark">{logoMark}</span>
          <div>
            <div className="adm-logo-text">
              Admin<span>Portal</span>
            </div>
          </div>
        </div>

        <nav className="adm-nav">
          <div className="adm-nav-label">Manage</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`adm-nav-item ${tab === item.id ? 'is-active' : ''}`}
              onClick={() => goTo(item.id)}
            >
              <AdminIcon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'gallery' && combinedGallery.length > 0 && (
                <span className="adm-nav-count">{combinedGallery.length}</span>
              )}
              {item.id === 'promotions' && content.promotions.length > 0 && (
                <span className="adm-nav-count">{content.promotions.length}</span>
              )}
              {item.id === 'website-admins' && websites.length > 0 && (
                <span className="adm-nav-count">{websites.length}</span>
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
            {/* SuperAdmin Website Selector in Topbar */}
            {isSuperAdmin && websites.length > 0 && (
              <div className="adm-website-switcher adm-hide-sm" title="Active Client Website Context">
                <AdminIcon name="globe" size={16} />
                <select
                  className="adm-website-select"
                  value={currentWebsite?.websiteId || ''}
                  onChange={(e) => handleSelectWebsiteById(e.target.value)}
                >
                  {websites.map((w) => (
                    <option key={w.websiteId} value={w.websiteId}>
                      {w.websiteName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button type="button" className="adm-btn adm-btn--ghost adm-hide-sm" onClick={() => window.open('/', '_blank')}>
              <AdminIcon name="external" size={16} /> View Site
            </button>

            <div className="adm-user">
              <div className="adm-avatar" style={isSuperAdmin ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' } : undefined}>
                {(session?.userName || session?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info adm-hide-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong>{session?.userName || session?.username || 'Administrator'}</strong>
                  {isSuperAdmin && <span className="adm-badge adm-badge--gold">Super Admin</span>}
                </div>
                <span>{currentWebsite?.websiteName || activeTenant}</span>
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
              {tab === 'dashboard' && (
                <Dashboard
                  {...shared}
                  isSuperAdmin={isSuperAdmin}
                  websites={websites}
                  currentWebsite={currentWebsite}
                  onSelectWebsite={handleSelectWebsite}
                />
              )}
              {tab === 'website-admins' && isSuperAdmin && (
                <WebsiteAdminsManager
                  {...shared}
                  websites={websites}
                  currentWebsite={currentWebsite}
                  onSelectWebsite={handleSelectWebsite}
                />
              )}
              {tab === 'gallery' && (
                <GalleryManager
                  {...shared}
                  websites={websites}
                  currentWebsite={currentWebsite}
                  onSelectWebsite={handleSelectWebsite}
                  isSuperAdmin={isSuperAdmin}
                />
              )}
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
