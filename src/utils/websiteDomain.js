// -------------------------------------------------------------------------------------------
// Website Domain Mapping & Dynamic Website ID Resolution
// -------------------------------------------------------------------------------------------

export const WEBSITE_DOMAINS = {
  1: 'https://www.meemcurtain.co.za',
  // Additional website domains can be added here
};

/**
 * Dynamically resolves the currently active website ID from session, localStorage, or user session.
 * Does not hardcode any ID.
 */
export const getActiveWebsiteId = () => {
  try {
    // 1. Check sessionStorage (active context set in AdminPanel)
    const sessionSiteId = sessionStorage.getItem('af-admin-active-website-id');
    if (sessionSiteId) {
      const num = Number(sessionSiteId);
      if (!isNaN(num) && num > 0) return num;
    }

    // 2. Check localStorage
    const localSiteId = localStorage.getItem('af-admin-active-website-id');
    if (localSiteId) {
      const num = Number(localSiteId);
      if (!isNaN(num) && num > 0) return num;
    }

    // 3. Check tokens / logged in user session
    const rawTokens =
      sessionStorage.getItem('af_admin_tokens') ||
      localStorage.getItem('af_admin_tokens') ||
      sessionStorage.getItem('af-admin-tokens') ||
      localStorage.getItem('af-admin-tokens');
    if (rawTokens) {
      const parsed = JSON.parse(rawTokens);
      const tokenSiteId =
        parsed.websiteId ||
        parsed.user?.websiteId ||
        parsed.admin?.websiteId;
      if (tokenSiteId) {
        const num = Number(tokenSiteId);
        if (!isNaN(num) && num > 0) return num;
      }
    }
  } catch (err) {
    console.warn('Could not resolve active website ID dynamically:', err);
  }

  return null;
};

/**
 * Dynamically saves the active website ID into session & local storage.
 */
export const setActiveWebsiteId = (id) => {
  if (id !== undefined && id !== null && id !== '') {
    const num = Number(id);
    if (!isNaN(num)) {
      sessionStorage.setItem('af-admin-active-website-id', String(num));
      localStorage.setItem('af-admin-active-website-id', String(num));
    }
  }
};

/**
 * Returns the website domain for a given websiteId.
 */
export const getWebsiteDomain = (websiteId) => {
  const dynamicId = websiteId || getActiveWebsiteId();
  if (dynamicId && WEBSITE_DOMAINS[Number(dynamicId)]) {
    return WEBSITE_DOMAINS[Number(dynamicId)];
  }
  return '';
};

export default {
  WEBSITE_DOMAINS,
  getWebsiteDomain,
  getActiveWebsiteId,
  setActiveWebsiteId,
};
