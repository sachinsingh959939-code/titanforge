(() => {
  const API_BASE = window.location.port === '8000' ? '' : 'http://localhost:8000';
  const loginButton = document.getElementById('google-login-btn');
  const logoutButton = document.getElementById('google-logout-btn');

  async function loadGoogleUser() {
    if (!loginButton || !logoutButton) return;
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`);
      const data = await response.json();
      if (!data.authenticated) return;

      loginButton.textContent = data.user.name || data.user.email || 'Google account';
      loginButton.removeAttribute('href');
      loginButton.style.cursor = 'default';
      logoutButton.style.display = 'inline-flex';
    } catch (error) {
      console.warn('Could not load Google login state:', error);
    }
  }

  logoutButton?.addEventListener('click', async () => {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    window.location.reload();
  });

  loadGoogleUser();
})();
