let currentPage = 1;
const usersPerPage = 10;

const loadDashboard = async () => {
  try {
    const data = await adminAPI.getDashboard();
    const { stats, recentUsers } = data.data;

    document.getElementById('stat-total').textContent = stats.totalUsers;
    document.getElementById('stat-active').textContent = stats.activeUsers;
    document.getElementById('stat-inactive').textContent = stats.inactiveUsers;
    document.getElementById('stat-admins').textContent = stats.adminCount;

    const recentList = document.getElementById('recent-users-list');
    if (recentList) {
      recentList.innerHTML = recentUsers
        .map(
          (user) => `
          <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div>
              <strong>${escapeHtml(user.name)}</strong>
              <small class="text-muted d-block">${escapeHtml(user.email)}</small>
            </div>
            <span class="badge ${user.role === 'admin' ? 'badge-role-admin' : 'badge-role-user'}">
              ${escapeHtml(user.role)}
            </span>
          </div>
        `
        )
        .join('');
    }
  } catch (error) {
    showAlert('admin-alert', error.message);
  }
};

const loadUsers = async (page = 1) => {
  currentPage = page;
  try {
    showLoading(true);
    const data = await adminAPI.getUsers(page, usersPerPage);
    const { users, pagination } = data.data;
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = users
      .map(
        (user) => `
        <tr>
          <td>${escapeHtml(user.name)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td><span class="badge ${user.role === 'admin' ? 'badge-role-admin' : 'badge-role-user'}">${escapeHtml(user.role)}</span></td>
          <td><span class="badge ${user.isActive ? 'bg-success' : 'bg-secondary'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
          <td>${formatDate(user.createdAt)}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="toggleUserRole('${user._id}', '${user.role}')">Role</button>
              <button class="btn btn-outline-warning" onclick="toggleUserStatus('${user._id}')">${user.isActive ? 'Deactivate' : 'Activate'}</button>
              <button class="btn btn-outline-danger" onclick="deleteUser('${user._id}', '${escapeHtml(user.name)}')">Delete</button>
            </div>
          </td>
        </tr>
      `
      )
      .join('');

    renderPagination(pagination);
  } catch (error) {
    showAlert('admin-alert', error.message);
  } finally {
    showLoading(false);
  }
};

const renderPagination = (pagination) => {
  const container = document.getElementById('pagination');
  if (!container) return;
  const { page, pages, total } = pagination;
  let html = `<nav><ul class="pagination justify-content-center">`;
  html += `<li class="page-item ${page <= 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="loadUsers(${page - 1}); return false;">Previous</a></li>`;
  for (let i = 1; i <= pages; i++) {
    html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" onclick="loadUsers(${i}); return false;">${i}</a></li>`;
  }
  html += `<li class="page-item ${page >= pages ? 'disabled' : ''}"><a class="page-link" href="#" onclick="loadUsers(${page + 1}); return false;">Next</a></li>`;
  html += `</ul></nav><p class="text-center text-muted small">Page ${page} of ${pages} (${total} users)</p>`;
  container.innerHTML = html;
};

const toggleUserRole = async (userId, currentRole) => {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  if (!confirm(`Change user role to "${newRole}"?`)) return;
  try {
    await adminAPI.updateRole(userId, newRole);
    showAlert('admin-alert', 'Role updated successfully', 'success');
    loadUsers(currentPage);
    loadDashboard();
  } catch (error) {
    showAlert('admin-alert', error.message);
  }
};

const toggleUserStatus = async (userId) => {
  if (!confirm('Toggle user active status?')) return;
  try {
    await adminAPI.toggleStatus(userId);
    showAlert('admin-alert', 'User status updated', 'success');
    loadUsers(currentPage);
    loadDashboard();
  } catch (error) {
    showAlert('admin-alert', error.message);
  }
};

const deleteUser = async (userId, userName) => {
  if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
  try {
    await adminAPI.deleteUser(userId);
    showAlert('admin-alert', 'User deleted successfully', 'success');
    loadUsers(currentPage);
    loadDashboard();
  } catch (error) {
    showAlert('admin-alert', error.message);
  }
};

const initAdminPage = async () => {
  const authorized = await requireAdmin();
  if (!authorized) return;
  await loadDashboard();
  await loadUsers(1);
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-page')) {
    initAdminPage();
  }
});
