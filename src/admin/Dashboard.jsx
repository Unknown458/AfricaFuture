import AdminIcon from './AdminIcon';
import { EmptyState, StatusChip } from './AdminUI';
import { formatDate } from './formatDate';
import { getPromotionStatus } from '../services/contentStore';
import { getSession } from '../services/auth';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function Dashboard({
  gallery,
  promotions,
  siteImages,
  goTo,
  isSuperAdmin = false,
  websites = [],
  currentWebsite,
  onSelectWebsite,
}) {
  const statuses = promotions.map((p) => getPromotionStatus(p));
  const count = (s) => statuses.filter((x) => x === s).length;
  const visibleImages = (gallery || []).filter((g) => g.visible !== false).length;
  const recent = [...(gallery || [])]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);
  const livePromos = promotions.filter((p) => getPromotionStatus(p) === 'live').slice(0, 4);
  const session = getSession();

  const stats = [
    { label: 'Gallery Images', value: gallery.length, sub: `${visibleImages} visible on site`, icon: 'gallery', tone: 'orange', to: 'gallery' },
    { label: 'Live Promotions', value: count('live'), sub: 'Showing on website now', icon: 'promo', tone: 'green', to: 'promotions' },
    { label: 'Scheduled', value: count('scheduled'), sub: 'Will go live automatically', icon: 'calendar', tone: 'purple', to: 'promotions' },
    isSuperAdmin
      ? { label: 'Websites Managed', value: websites.length || 4, sub: 'Multi-website control active', icon: 'globe', tone: 'navy', to: 'website-admins' }
      : { label: 'Custom Site Images', value: Object.keys(siteImages).length, sub: 'of 3 replaceable images', icon: 'layout', tone: 'navy', to: 'site-images' },
  ];

  return (
    <div className="adm-stack">
      {/* Welcome banner */}
      <section className="adm-welcome">
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span className="adm-pill adm-pill--light">Dashboard</span>
            {isSuperAdmin && (
              <span className="adm-pill adm-pill--gold">
                <AdminIcon name="shield" size={12} />
                <span>Super Administrator</span>
              </span>
            )}
            {currentWebsite && (
              <span className="adm-pill adm-pill--light">
                <AdminIcon name="globe" size={12} />
                <span>{currentWebsite.websiteName}</span>
              </span>
            )}
          </div>

          <h2>
            {greeting()}, <span>{session?.username || 'Admin'}</span> 👋
          </h2>
          <p>
            {isSuperAdmin
              ? `You have Super Admin control over ${websites.length || 4} websites. Select any website to manage its images, promotions, and admins.`
              : 'Keep your website fresh. Upload new images or launch a promotion — changes go live on your website straight away.'}
          </p>

          <div className="adm-welcome-actions">
            <button type="button" className="adm-btn adm-btn--primary" onClick={() => goTo('gallery')}>
              <AdminIcon name="upload" size={16} /> Upload Images
            </button>
            <button type="button" className="adm-btn adm-btn--light" onClick={() => goTo('promotions')}>
              <AdminIcon name="plus" size={16} /> New Promotion
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                className="adm-btn adm-btn--light"
                style={{ background: 'rgba(245, 158, 11, 0.25)', borderColor: 'rgba(245, 158, 11, 0.5)' }}
                onClick={() => goTo('website-admins')}
              >
                <AdminIcon name="users" size={16} /> Website Admins
              </button>
            )}
          </div>
        </div>

        <div className="adm-welcome-meta">
          <span>Last sign-in</span>
          <strong>{session ? new Date(session.loginAt).toLocaleString() : '—'}</strong>
        </div>
      </section>

      {/* Super Admin Multi-Website Switcher Cards */}
      {isSuperAdmin && websites.length > 0 && (
        <section className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3>Websites Under Your Control</h3>
              <p className="adm-muted">
                Select a website below to switch your management context.
              </p>
            </div>
            <button
              type="button"
              className="adm-btn adm-btn--ghost"
              onClick={() => goTo('website-admins')}
            >
              <AdminIcon name="users" size={16} /> Manage All Admins
            </button>
          </div>

          <div className="adm-websites-grid">
            {websites.map((site) => {
              const isCurrent = currentWebsite?.websiteId === site.websiteId;
              return (
                <div
                  key={site.websiteId}
                  className={`adm-website-card ${isCurrent ? 'is-selected' : ''}`}
                >
                  <div className="adm-website-card-top">
                    <div className="adm-website-icon">
                      <AdminIcon name="globe" size={20} />
                    </div>
                    {isCurrent ? (
                      <span className="adm-badge adm-badge--gold">Current Site</span>
                    ) : (
                      <span className="adm-badge adm-badge--blue">ID #{site.websiteId}</span>
                    )}
                  </div>
                  <strong className="adm-website-title">{site.websiteName}</strong>
                  <div className="adm-website-code">code: {site.websiteCode}</div>
                  <div className="adm-website-meta">
                    <span className="adm-status is-live">Active</span>
                    <button
                      type="button"
                      className={`adm-btn adm-btn--block ${isCurrent ? 'adm-btn--primary' : 'adm-btn--ghost'}`}
                      style={{ marginTop: 10 }}
                      onClick={() => onSelectWebsite && onSelectWebsite(site)}
                    >
                      {isCurrent ? 'Currently Managing ✓' : 'Switch to this Site →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="adm-stats">
        {stats.map((s) => (
          <button key={s.label} type="button" className={`adm-stat adm-stat--${s.tone}`} onClick={() => goTo(s.to)}>
            <div className="adm-stat-icon">
              <AdminIcon name={s.icon} size={20} />
            </div>
            <div>
              <div className="adm-stat-value">{s.value}</div>
              <div className="adm-stat-label">{s.label}</div>
              <div className="adm-stat-sub">{s.sub}</div>
            </div>
          </button>
        ))}
      </section>

      <div className="adm-grid-2">
        {/* Recent uploads */}
        <section className="adm-card">
          <div className="adm-card-head">
            <h3>Recent Uploads</h3>
            <button type="button" className="adm-link" onClick={() => goTo('gallery')}>
              View all →
            </button>
          </div>
          {recent.length ? (
            <div className="adm-recent-grid">
              {recent.map((g) => {
                const isVideo = g.type === 'video' || g.mimeType?.startsWith('video/');
                return (
                  <div key={g.id} className="adm-recent-item" title={g.title}>
                    {isVideo && !g.poster ? (
                      <video
                        src={g.src}
                        muted
                        preload="metadata"
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img src={g.poster || g.src} alt={g.title} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="gallery"
              title="No images yet"
              text="Upload your first images to show them in the website gallery."
              action={
                <button type="button" className="adm-btn adm-btn--primary" onClick={() => goTo('gallery')}>
                  Upload Images
                </button>
              }
            />
          )}
        </section>

        {/* Live promotions */}
        <section className="adm-card">
          <div className="adm-card-head">
            <h3>Live Promotions</h3>
            <button type="button" className="adm-link" onClick={() => goTo('promotions')}>
              Manage →
            </button>
          </div>
          {livePromos.length ? (
            <ul className="adm-mini-list">
              {livePromos.map((p) => (
                <li key={p.id}>
                  <div className="adm-mini-thumb">{p.image ? <img src={p.image} alt="" /> : <AdminIcon name="promo" />}</div>
                  <div className="adm-mini-info">
                    <strong>{p.title}</strong>
                    <span>{p.endDate ? `Ends ${formatDate(p.endDate)}` : 'No end date'}</span>
                  </div>
                  <StatusChip status="live" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="promo"
              title="No live promotions"
              text="Create a promotion to highlight special offers on your homepage."
              action={
                <button type="button" className="adm-btn adm-btn--primary" onClick={() => goTo('promotions')}>
                  Create Promotion
                </button>
              }
            />
          )}
        </section>
      </div>

      {/* Tips */}
      <section className="adm-card adm-tips">
        <h3>💡 Tips for great results</h3>
        <ul>
          <li>
            Use <strong>landscape images</strong> (e.g. 1600×1000) for the best look on all screens.
          </li>
          <li>
            Give every image a <strong>clear title</strong> — it helps customers and search engines.
          </li>
          <li>
            Set an <strong>end date</strong> on promotions so they disappear automatically when the offer ends.
          </li>
          <li>
            Download a <strong>backup</strong> from Settings regularly to keep your content safe.
          </li>
        </ul>
      </section>
    </div>
  );
}

export default Dashboard;
