/* ==========================================================================
   SETTINGS & ACCOUNT PREFERENCES VIEW WITH SAFE USER DESTRUCTURING
   ========================================================================== */

export const renderSettingsView = (store) => {
  const user = store.user || {
    firstName: 'User',
    lastName: '',
    email: 'user@financeflow.com',
    phone: '',
    timezone: 'Pacific Standard Time (PST)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    plan: 'Premium',
    nextBilling: 'Active'
  };

  const connectedAccounts = store.connectedAccounts || [];

  return `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="heading-lg">Settings</h1>
          <p>Manage your account preferences, security settings, and personal details.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="alert('Settings saved successfully!')">Save Changes</button>
        </div>
      </div>

      <!-- Settings Top Nav Tabs -->
      <div style="margin-bottom: 2rem;">
        <div class="tab-pills">
          <button class="tab-pill active">👤 Profile</button>
          <button class="tab-pill" id="btn-theme-toggle">🎨 Appearance</button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="grid-2">
        <!-- Personal Information Form -->
        <div>
          <div class="card" style="margin-bottom: 1.75rem;">
            <div style="margin-bottom: 1.5rem;">
              <h2 class="heading-md">Personal Information</h2>
              <p class="text-muted" style="font-size: 0.8125rem;">Update your profile details below.</p>
            </div>

            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);">
              <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}" alt="Avatar" class="avatar" style="width: 72px; height: 72px; border-width: 3px;" />
              <div>
                <div style="font-weight: 700; font-size: 0.875rem; margin-bottom: 0.25rem;">Profile Picture</div>
                <div class="text-muted" style="font-size: 0.75rem; margin-bottom: 0.75rem;">Connected User Avatar</div>
              </div>
            </div>

            <form id="form-settings" onsubmit="event.preventDefault(); alert('Saved!');">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">First Name</label>
                  <input type="text" class="form-input" value="${user.firstName || ''}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name</label>
                  <input type="text" class="form-input" value="${user.lastName || ''}" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <div style="position: relative;">
                  <input type="email" class="form-input" value="${user.email || ''}" style="padding-left: 2.5rem;" readonly />
                  <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);">✉</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <div style="position: relative;">
                    <input type="text" class="form-input" value="${user.phone || ''}" style="padding-left: 2.5rem;" />
                    <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);">📱</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Timezone</label>
                  <div style="position: relative;">
                    <select class="form-select" style="padding-left: 2.5rem;">
                      <option selected>${user.timezone || 'Pacific Standard Time (PST)'}</option>
                    </select>
                    <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);">🌐</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Danger Zone Card -->
          <div class="card" style="border-color: var(--danger-border); background: var(--danger-bg);">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem; color: var(--danger); font-weight: 700;">
              <span>🚨</span>
              <h2 class="heading-md">Danger Zone</h2>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-main); margin-bottom: 1rem;">
              Permanently log out of your session.
            </p>
            <button class="btn btn-danger btn-sm" onclick="window.handleLogout()">
              Log Out of Account
            </button>
          </div>
        </div>

        <!-- Sidebar Right Cards -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card">
            <span class="text-muted" style="font-size: 0.75rem; font-weight: 700;">Plan Details</span>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 0.5rem 0 1rem;">
              <h3 class="heading-lg">${user.plan || 'Premium'}</h3>
              <span class="badge badge-success">Active</span>
            </div>
            <p class="text-muted" style="font-size: 0.8125rem;">
              Account Status: <strong>Verified</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const bindSettingsEvents = () => {
  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
    });
  }
};
