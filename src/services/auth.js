/**
 * Admin authentication (client-side design mode).
 * --------------------------------------------------------------
 * Default login:
 *   Company:  AfricaFuture
 *   Username: admin
 *   Password: Admin@123
 *
 * Can be customized from Admin Panel → Settings.
 */

const DEFAULT_COMPANY = 'AfricaFuture';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'Admin@123';
const CREDS_KEY = 'af-admin-credentials-v2';
const SESSION_KEY = 'af-admin-session-v2';
const SESSION_HOURS = 8;
const REMEMBER_DAYS = 7;

async function hash(text) {
  if (window.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return `fb_${h}`;
}

async function getCredentials() {
  try {
    const saved = JSON.parse(localStorage.getItem(CREDS_KEY));
    if (saved?.username && saved?.passwordHash) return saved;
  } catch {
    /* ignore */
  }
  return {
    company: DEFAULT_COMPANY,
    username: DEFAULT_USERNAME,
    passwordHash: await hash(DEFAULT_PASSWORD),
  };
}

export async function login(company = '', username = '', password = '', remember = false) {
  // TEST / PREVIEW MODE: Allow any credentials or empty values
  const userCompany = company.trim() || DEFAULT_COMPANY;
  const userUsername = username.trim() || DEFAULT_USERNAME;

  const ms = remember ? REMEMBER_DAYS * 864e5 : SESSION_HOURS * 36e5;
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      company: userCompany,
      username: userUsername,
      expiresAt: Date.now() + ms,
      loginAt: Date.now(),
    })
  );
  return true;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (s && s.expiresAt > Date.now()) return s;
  } catch {
    /* ignore */
  }
  localStorage.removeItem(SESSION_KEY);
  return null;
}

export const isAuthenticated = () => Boolean(getSession());

export async function changeCredentials({ currentPassword, newCompany, newUsername, newPassword }) {
  const creds = await getCredentials();
  if ((await hash(currentPassword)) !== creds.passwordHash) {
    throw new Error('Current password is incorrect.');
  }
  const next = {
    company: (newCompany || creds.company || DEFAULT_COMPANY).trim(),
    username: (newUsername || creds.username).trim(),
    passwordHash: newPassword ? await hash(newPassword) : creds.passwordHash,
  };
  localStorage.setItem(CREDS_KEY, JSON.stringify(next));
  const session = getSession();
  if (session) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        ...session,
        company: next.company,
        username: next.username,
      })
    );
  }
}
