const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const showAlert = (containerId, message, type = 'danger') => {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="alert alert-${type} alert-custom alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
};

const clearAlert = (containerId) => {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
};

const showLoading = (show = true) => {
  let overlay = document.getElementById('loading-overlay');

  if (show) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.className = 'spinner-overlay';
      overlay.innerHTML = `
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  } else if (overlay) {
    overlay.remove();
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const validatePasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

const updatePasswordStrengthIndicator = (password, elementId) => {
  const el = document.getElementById(elementId);
  if (!el) return;
  const strength = validatePasswordStrength(password);
  el.className = `password-strength ${strength}`;
};

const setButtonLoading = (button, loading, originalText) => {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
      Please wait...
    `;
  } else {
    button.disabled = false;
    button.innerHTML = originalText || button.dataset.originalText || 'Submit';
  }
};
