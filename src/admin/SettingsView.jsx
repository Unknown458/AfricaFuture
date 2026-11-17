import { useEffect, useRef, useState } from 'react';
import AdminIcon from './AdminIcon';
import { changeCredentials, getSession, logout } from '../services/auth';
import { clearAll, exportAll, importAll } from '../services/contentStore';

function SettingsView({ gallery, promotions, toast, confirm, onNavigate }) {
  const session = getSession();
  const [form, setForm] = useState({
    currentPassword: '',
    newCompany: session?.company || 'AfricaFuture',
    newUsername: session?.username || 'admin',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState(null);
  const fileRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => setUsage(e)).catch(() => {});
  }, [gallery.length, promotions.length]);

  const saveAccount = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) return toast('Enter your current password', 'error');
    if (!form.newCompany.trim()) return toast('Company name cannot be empty', 'error');
    if (!form.newUsername.trim()) return toast('Username cannot be empty', 'error');
    if (form.newPassword) {
      if (form.newPassword.length < 8) return toast('New password must be at least 8 characters', 'error');
      if (form.newPassword !== form.confirmPassword) return toast('New passwords do not match', 'error');
    }
    setSaving(true);
    try {
      await changeCredentials(form);
      toast('Login details updated');
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast(err.message, 'error');
    }
    setSaving(false);
    return undefined;
  };

  const download = async () => {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `africafuture-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup downloaded');
  };

  const restore = async (file) => {
    if (!file) return;
    const ok = await confirm({
      title: 'Restore from backup?',
      text: 'This will replace ALL current images and promotions with the content from the backup file.',
      confirmText: 'Restore',
      danger: true,
    });
    if (!ok) return;
    try {
      await importAll(JSON.parse(await file.text()));
      toast('Backup restored successfully');
    } catch (err) {
      toast(err.message || 'Invalid backup file', 'error');
    }
  };

  const wipe = async () => {
    const ok = await confirm({
      title: 'Delete all content?',
      text: 'All uploaded images, promotions and custom website images will be permanently deleted. Download a backup first if unsure.',
      confirmText: 'Delete everything',
      danger: true,
    });
    if (!ok) return;
    await clearAll();
    toast('All content deleted');
  };

  const mb = (b) => (b / 1024 / 1024).toFixed(1);

  return (
    <div className="adm-stack">
      <div className="adm-grid-2">
        <section className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3>Login Details</h3>
              <p className="adm-muted">Change the email and password used to sign in.</p>
            </div>
          </div>
          <form className="adm-form" onSubmit={saveAccount}>
            <div className="adm-row">
              <label className="adm-field">
                <span className="adm-label">Company Name</span>
                <input
                  className="adm-input"
                  type="text"
                  value={form.newCompany}
                  onChange={(e) => set('newCompany', e.target.value)}
                  autoComplete="organization"
                />
              </label>
              <label className="adm-field">
                <span className="adm-label">Username</span>
                <input
                  className="adm-input"
                  type="text"
                  value={form.newUsername}
                  onChange={(e) => set('newUsername', e.target.value)}
                  autoComplete="username"
                />
              </label>
            </div>
            <div className="adm-row">
              <label className="adm-field">
                <span className="adm-label">New password</span>
                <input className="adm-input" type="password" value={form.newPassword} onChange={(e) => set('newPassword', e.target.value)} placeholder="Leave blank to keep" autoComplete="new-password" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Confirm new password</span>
                <input className="adm-input" type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} autoComplete="new-password" />
              </label>
            </div>
            <label className="adm-field">
              <span className="adm-label">Current password *</span>
              <input className="adm-input" type="password" value={form.currentPassword} onChange={(e) => set('currentPassword', e.target.value)} autoComplete="current-password" />
            </label>
            <div>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
                {saving ? 'Saving…' : 'Update Login Details'}
              </button>
            </div>
          </form>
        </section>

        <section className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3>Backup &amp; Restore</h3>
              <p className="adm-muted">Download all your content as one file, or restore it later.</p>
            </div>
          </div>
          <div className="adm-backup-stats">
            <div>
              <strong>{gallery.length}</strong>
              <span>Images</span>
            </div>
            <div>
              <strong>{promotions.length}</strong>
              <span>Promotions</span>
            </div>
            <div>
              <strong>{usage ? `${mb(usage.usage)} MB` : '—'}</strong>
              <span>Storage used</span>
            </div>
          </div>
          {usage?.quota ? (
            <div className="adm-progress adm-progress--thin">
              <div className="adm-progress-bar" style={{ width: `${Math.min(100, (usage.usage / usage.quota) * 100)}%` }} />
            </div>
          ) : null}
          <div className="adm-btn-row">
            <button type="button" className="adm-btn adm-btn--primary" onClick={download}>
              <AdminIcon name="download" size={16} /> Download Backup
            </button>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => fileRef.current?.click()}>
              <AdminIcon name="upload" size={16} /> Restore Backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                restore(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        </section>
      </div>

      <section className="adm-card adm-danger-zone">
        <div>
          <h3>Danger Zone</h3>
          <p className="adm-muted">Permanently remove all uploaded content from the website.</p>
        </div>
        <div className="adm-btn-row">
          <button
            type="button"
            className="adm-btn adm-btn--ghost"
            onClick={() => {
              logout();
              onNavigate('/login');
            }}
          >
            <AdminIcon name="logout" size={16} /> Sign out
          </button>
          <button type="button" className="adm-btn adm-btn--danger" onClick={wipe}>
            <AdminIcon name="trash" size={16} /> Delete All Content
          </button>
        </div>
      </section>
    </div>
  );
}

export default SettingsView;
