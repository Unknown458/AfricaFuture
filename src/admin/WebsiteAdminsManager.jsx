import { useCallback, useEffect, useState } from 'react';
import AdminIcon from './AdminIcon';
import { EmptyState, Modal, Switch } from './AdminUI';
import { formatDate, formatDateTime } from './formatDate';
import {
  createWebsiteAdmin,
  getWebsiteAdmins,
  updateWebsiteAdminStatus,
} from '../services/website/websiteService';

export function WebsiteAdminsManager({
  websites = [],
  currentWebsite,
  onSelectWebsite,
  toast,
  confirm,
}) {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(
    () => currentWebsite?.websiteId || (websites[0]?.websiteId ?? 1)
  );
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sync selected website if changed from topbar
  useEffect(() => {
    if (currentWebsite?.websiteId) {
      setSelectedWebsiteId(currentWebsite.websiteId);
    }
  }, [currentWebsite]);

  // Load admins for currently selected website
  const loadAdmins = useCallback(async (siteId) => {
    if (!siteId) return;
    setLoading(true);
    const result = await getWebsiteAdmins(siteId);
    if (result && Array.isArray(result.data)) {
      setAdmins(result.data);
    } else {
      setAdmins([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAdmins(selectedWebsiteId);
  }, [selectedWebsiteId, loadAdmins]);

  const handleWebsiteChange = (siteId) => {
    const numericId = Number(siteId);
    setSelectedWebsiteId(numericId);
    if (onSelectWebsite) {
      const match = websites.find((w) => w.websiteId === numericId);
      if (match) onSelectWebsite(match);
    }
  };

  const handleToggleStatus = async (admin) => {
    const nextStatus = !admin.isActive;
    const ok = await confirm({
      title: nextStatus ? 'Activate Admin?' : 'Deactivate Admin?',
      text: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} access for "${admin.userName}"?`,
      confirmText: nextStatus ? 'Activate' : 'Deactivate',
      danger: !nextStatus,
    });
    if (!ok) return;

    const res = await updateWebsiteAdminStatus({
      adminId: admin.adminId,
      isActive: nextStatus,
    });

    if (res?.success) {
      toast(res.message || `Admin status updated for ${admin.userName}`);
      setAdmins((prev) =>
        prev.map((a) => (a.adminId === admin.adminId ? { ...a, isActive: nextStatus } : a))
      );
    } else {
      toast(res?.message || 'Failed to update admin status', 'error');
    }
  };

  const activeSite = websites.find((w) => w.websiteId === selectedWebsiteId) || websites[0];

  return (
    <div className="adm-stack">
      {/* Top Controls Card */}
      <section className="adm-card">
        <div className="adm-card-head adm-card-head--wrap">
          <div>
            <div className="adm-pill adm-pill--gold" style={{ marginBottom: 8 }}>
              <AdminIcon name="shield" size={14} />
              <span>Super Admin Management</span>
            </div>
            <h3>Website Administrators</h3>
            <p className="adm-muted">
              Create and manage administrative user accounts for each client website.
            </p>
          </div>

          <div className="adm-toolbar">
            {/* Website Selector Dropdown */}
            <div className="adm-inline-field">
              <span className="adm-muted" style={{ fontWeight: 600 }}>Select Website:</span>
              <select
                className="adm-input adm-select"
                value={selectedWebsiteId}
                onChange={(e) => handleWebsiteChange(e.target.value)}
              >
                {websites.map((site) => (
                  <option key={site.websiteId} value={site.websiteId}>
                    {site.websiteName} ({site.websiteCode})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="adm-btn adm-btn--primary"
              onClick={() => setShowCreateModal(true)}
            >
              <AdminIcon name="plus" size={16} /> Create Website Admin
            </button>
          </div>
        </div>

        {/* Website Tabs Bar */}
        {websites.length > 0 && (
          <div className="adm-tabs" style={{ marginBottom: 16 }}>
            {websites.map((site) => (
              <button
                key={site.websiteId}
                type="button"
                className={`adm-tab ${selectedWebsiteId === site.websiteId ? 'is-active' : ''}`}
                onClick={() => handleWebsiteChange(site.websiteId)}
              >
                <AdminIcon name="globe" size={15} />
                <span>{site.websiteName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Admins Table / List */}
        {loading ? (
          <div className="adm-loading">
            <span className="adm-spinner adm-spinner--dark" /> Loading website administrators…
          </div>
        ) : admins.length === 0 ? (
          <EmptyState
            icon="users"
            title={`No admins found for ${activeSite?.websiteName || 'this website'}`}
            text="Create an administrator account so the client can manage their website independently."
            action={
              <button
                type="button"
                className="adm-btn adm-btn--primary"
                onClick={() => setShowCreateModal(true)}
              >
                <AdminIcon name="plus" size={16} /> Create First Admin
              </button>
            }
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Website</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Active Access</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.adminId}>
                    <td>
                      <div className="adm-user-cell">
                        <div className="adm-avatar" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
                          {(admin.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{admin.userName}</strong>
                          <span className="adm-muted">ID: #{admin.adminId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="adm-tag">
                        {activeSite?.websiteName || `Website #${admin.websiteId}`}
                      </span>
                    </td>
                    <td>
                      {admin.isSuperAdmin ? (
                        <span className="adm-badge adm-badge--gold">Super Admin</span>
                      ) : (
                        <span className="adm-badge adm-badge--blue">Website Admin</span>
                      )}
                    </td>
                    <td>
                      <span className="adm-muted">{formatDateTime(admin.createdAt)}</span>
                    </td>
                    <td>
                      <span className="adm-muted">
                        {admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : 'Never'}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-status ${admin.isActive ? 'is-live' : 'is-expired'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Switch
                        checked={Boolean(admin.isActive)}
                        onChange={() => handleToggleStatus(admin)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <CreateAdminModal
          websites={websites}
          defaultWebsiteId={selectedWebsiteId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newAdmin) => {
            setShowCreateModal(false);
            toast(`Admin account "${newAdmin.userName}" created successfully!`);
            loadAdmins(selectedWebsiteId);
          }}
          toast={toast}
        />
      )}
    </div>
  );
}

function CreateAdminModal({ websites, defaultWebsiteId, onClose, onSuccess, toast }) {
  const [websiteId, setWebsiteId] = useState(defaultWebsiteId || websites[0]?.websiteId || 1);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userName.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }

    setSubmitting(true);
    const res = await createWebsiteAdmin({
      websiteId,
      userName,
      password,
    });
    setSubmitting(false);

    if (res?.success) {
      onSuccess({ websiteId, userName });
    } else {
      const msg = res?.message || 'Failed to create website admin.';
      setError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <Modal
      title="Create New Website Admin"
      subtitle="Create login credentials for a specific client website."
      size="md"
      onClose={onClose}
    >
      <form className="adm-form" onSubmit={handleSubmit}>
        {error && (
          <div className="adm-alert adm-alert--error">
            {error}
          </div>
        )}

        <label className="adm-field">
          <span className="adm-label">Assign To Website *</span>
          <select
            className="adm-input"
            value={websiteId}
            onChange={(e) => setWebsiteId(Number(e.target.value))}
          >
            {websites.map((site) => (
              <option key={site.websiteId} value={site.websiteId}>
                {site.websiteName} ({site.websiteCode})
              </option>
            ))}
          </select>
        </label>

        <label className="adm-field">
          <span className="adm-label">Username *</span>
          <div className="adm-input-wrap">
            <span className="adm-input-icon">👤</span>
            <input
              type="text"
              className="adm-input"
              placeholder="e.g. meemadmin"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoFocus
            />
          </div>
        </label>

        <label className="adm-field">
          <span className="adm-label">Password *</span>
          <div className="adm-input-wrap">
            <span className="adm-input-icon">🔑</span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="adm-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="adm-input-toggle"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <div className="adm-btn-row" style={{ marginTop: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Admin Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default WebsiteAdminsManager;
