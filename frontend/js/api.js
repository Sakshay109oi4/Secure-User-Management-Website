const API_BASE = '/api';
let csrfToken = null;

const fetchCsrfToken = async () => {
  try {
    const response = await fetch(`${API_BASE}/csrf-token`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (data.success) {
      csrfToken = data.csrfToken;
    }
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

const apiRequest = async (endpoint, options = {}) => {
  if (!csrfToken && options.method && options.method !== 'GET') {
    await fetchCsrfToken();
  }

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && options.method && options.method !== 'GET'
        ? { 'X-CSRF-Token': csrfToken }
        : {}),
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  let response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    if (data.code === 'TOKEN_EXPIRED') {
      const refreshed = await refreshToken();
      if (refreshed) {
        response = await fetch(`${API_BASE}${endpoint}`, config);
      }
    }
  }

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Invalid server response',
  }));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
};

const refreshToken = async () => {
  try {
    if (!csrfToken) await fetchCsrfToken();
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
    });
    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
};

const authAPI = {
  register: (userData) =>
    apiRequest('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) =>
    apiRequest('/auth/login', { method: 'POST', body: credentials }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
  refresh: () => apiRequest('/auth/refresh', { method: 'POST' }),
};

const userAPI = {
  getProfile: () => apiRequest('/users/profile'),
  updateProfile: (data) =>
    apiRequest('/users/profile', { method: 'PUT', body: data }),
  changePassword: (data) =>
    apiRequest('/users/change-password', { method: 'PUT', body: data }),
};

const adminAPI = {
  getDashboard: () => apiRequest('/admin/dashboard'),
  getUsers: (page = 1, limit = 10) =>
    apiRequest(`/admin/users?page=${page}&limit=${limit}`),
  getUser: (id) => apiRequest(`/admin/users/${id}`),
  updateRole: (id, role) =>
    apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),
  toggleStatus: (id) =>
    apiRequest(`/admin/users/${id}/toggle-status`, { method: 'PATCH' }),
  deleteUser: (id) =>
    apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
};

const healthCheck = () => apiRequest('/health');
