let currentUser = null;

const isAuthenticated = () => currentUser !== null;
const isAdmin = () => currentUser?.role === 'admin';
const getCurrentUser = () => currentUser;

const setCurrentUser = (user) => {
  currentUser = user;
  if (user) {
    sessionStorage.setItem('user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('user');
  }
  updateNavbar();
};

const loadUserFromSession = () => {
  const stored = sessionStorage.getItem('user');
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
    } catch {
      sessionStorage.removeItem('user');
    }
  }
  return currentUser;
};

const initAuth = async () => {
  loadUserFromSession();
  try {
    await fetchCsrfToken();
    const data = await authAPI.getMe();
    if (data.success) {
      setCurrentUser(data.data.user);
      return data.data.user;
    }
  } catch {
    setCurrentUser(null);
  }
  return null;
};

const requireAuth = async (redirectTo = '/login') => {
  const user = await initAuth();
  if (!user) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
};

const requireAdmin = async () => {
  const authenticated = await requireAuth();
  if (!authenticated) return false;
  if (!isAdmin()) {
    window.location.href = '/dashboard';
    return false;
  }
  return true;
};

const redirectIfAuthenticated = async (redirectTo = '/dashboard') => {
  const user = await initAuth();
  if (user) {
    window.location.href = isAdmin() ? '/admin' : redirectTo;
    return true;
  }
  return false;
};

const handleLogout = async () => {
  try {
    showLoading(true);
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    setCurrentUser(null);
    showLoading(false);
    window.location.href = '/login';
  }
};

const updateNavbar = () => {
  const authNav = document.getElementById('auth-nav');
  const guestNav = document.getElementById('guest-nav');
  const userNameEl = document.getElementById('nav-username');
  const adminLink = document.getElementById('admin-nav-link');

  if (!authNav || !guestNav) return;

  if (isAuthenticated()) {
    authNav.classList.remove('hidden');
    guestNav.classList.add('hidden');
    if (userNameEl) userNameEl.textContent = currentUser.name;
    if (adminLink) {
      adminLink.classList.toggle('hidden', !isAdmin());
    }
  } else {
    authNav.classList.add('hidden');
    guestNav.classList.remove('hidden');
  }
};

const setupLogoutButtons = () => {
  document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  loadUserFromSession();
  updateNavbar();
  setupLogoutButtons();
  fetchCsrfToken();
});
