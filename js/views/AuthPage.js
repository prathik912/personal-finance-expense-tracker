/* ==========================================================================
   AUTHENTICATION VIEW WITH REAL REST API LOGIN & REGISTRATION
   ========================================================================== */

import { api } from '../api.js';
import { updateStore, fetchRemoteData } from '../mockData.js';

export const renderAuthPage = () => {
  return `
    <div class="auth-container">
      <!-- Left Banner -->
      <div class="auth-banner">
        <div style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" onclick="window.navigateTo('landing')">
          <img src="assets/code_morphicx_logo.jpg" alt="Code Morphicx Logo" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
          <div class="brand-icon" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
              <rect x="2" y="5" width="20" height="14" rx="3" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <span class="brand-name" style="color: #ffffff;">Finance<span style="color: #60a5fa;">Flow</span></span>
        </div>

        <div style="margin: auto 0; padding-right: 2rem;">
          <div style="width: 140px; height: 140px; background: linear-gradient(135deg, #38bdf8, #818cf8); border-radius: 30px; margin-bottom: 2.5rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 40px rgba(56,189,248,0.3); transform: rotate(-6deg);">
            <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>

          <h2 class="heading-xl" style="font-size: 2.5rem; line-height: 1.2; margin-bottom: 1.5rem; color: #ffffff;">
            Master your financial future with precision.
          </h2>

          <div style="display: flex; flex-direction: column; gap: 1rem; color: rgba(255,255,255,0.85); font-size: 0.9375rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="color: #38bdf8; font-weight: 800;">✓</span> Automated expense tracking and database persistence
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="color: #38bdf8; font-weight: 800;">✓</span> Strict PostgreSQL data isolation per user
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="color: #38bdf8; font-weight: 800;">✓</span> Real-time analytics and category budget tracking
            </div>
          </div>
        </div>

        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">
          &copy; 2026 FinanceFlow Inc. All rights reserved.
        </div>
      </div>

      <!-- Right Form Side -->
      <div class="auth-form-side">
        <div class="auth-form-card">
          <div style="display: flex; justify-content: center; margin-bottom: 2rem;">
            <div class="tab-pills" style="width: 100%; display: flex;">
              <button class="tab-pill active" id="tab-login" style="flex: 1; text-align: center;">Login</button>
              <button class="tab-pill" id="tab-register" style="flex: 1; text-align: center;">Create Account</button>
            </div>
          </div>

          <div id="login-section">
            <h2 class="heading-lg" style="margin-bottom: 0.5rem;" id="auth-heading">Welcome Back</h2>
            <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 1.5rem;" id="auth-sub">
              Enter your credentials to access your financial dashboard.
            </p>

            <div id="auth-error-banner" style="display: none; background: var(--danger-bg); border: 1px solid var(--danger-border); color: var(--danger); padding: 0.875rem; border-radius: var(--radius-md); font-size: 0.8125rem; margin-bottom: 1.25rem; font-weight: 600;">
            </div>

            <form id="form-auth">
              <div class="form-row" id="name-field-group" style="display: none;">
                <div class="form-group">
                  <label class="form-label">First Name</label>
                  <input type="text" class="form-input" id="auth-firstname" placeholder="First Name" />
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name</label>
                  <input type="text" class="form-input" id="auth-lastname" placeholder="Last Name" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" id="auth-email" placeholder="name@company.com" required />
              </div>

              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <label class="form-label">Password</label>
                </div>
                <div style="position: relative;">
                  <input type="password" class="form-input" id="auth-password" placeholder="••••••••" required />
                  <button type="button" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); background: none; border: none; cursor: pointer;" onclick="
                    const inp = document.getElementById('auth-password');
                    inp.type = inp.type === 'password' ? 'text' : 'password';
                  ">👁</button>
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 1rem;" id="btn-auth-submit">
                Sign In &rarr;
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const bindAuthEvents = () => {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const nameGroup = document.getElementById('name-field-group');
  const form = document.getElementById('form-auth');
  const submitBtn = document.getElementById('btn-auth-submit');
  const heading = document.getElementById('auth-heading');
  const sub = document.getElementById('auth-sub');
  const errorBanner = document.getElementById('auth-error-banner');

  let mode = 'login';

  const showError = (msg) => {
    if (errorBanner) {
      errorBanner.innerText = msg;
      errorBanner.style.display = 'block';
    }
  };

  const clearError = () => {
    if (errorBanner) {
      errorBanner.innerText = '';
      errorBanner.style.display = 'none';
    }
  };

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      mode = 'login';
      clearError();
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      if (nameGroup) nameGroup.style.display = 'none';
      if (submitBtn) submitBtn.innerHTML = 'Sign In &rarr;';
      if (heading) heading.innerText = 'Welcome Back';
      if (sub) sub.innerText = 'Enter your credentials to access your financial dashboard.';
    });

    tabRegister.addEventListener('click', () => {
      mode = 'register';
      clearError();
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      if (nameGroup) nameGroup.style.display = 'flex';
      if (submitBtn) submitBtn.innerHTML = 'Create Account &rarr;';
      if (heading) heading.innerText = 'Create Account';
      if (sub) sub.innerText = 'Sign up to start tracking your finances with precision.';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError();

      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value.trim();

      if (!email || !password) {
        showError('Please enter both email and password.');
        return;
      }

      submitBtn.innerText = mode === 'login' ? 'Authenticating...' : 'Creating Account...';
      submitBtn.disabled = true;

      try {
        if (mode === 'login') {
          const res = await api.login({ email, password });
          if (res.data && res.data.user) {
            updateStore(prev => ({ ...prev, user: res.data.user }));
          }
        } else {
          const firstName = document.getElementById('auth-firstname').value.trim() || 'New';
          const lastName = document.getElementById('auth-lastname').value.trim() || 'User';
          const res = await api.register({ firstName, lastName, email, password });
          if (res.data && res.data.user) {
            updateStore(prev => ({ ...prev, user: res.data.user }));
          }
        }

        await fetchRemoteData();
        window.navigateTo('dashboard');
      } catch (err) {
        console.error('[Auth Error]', err);
        showError(err.message || 'Authentication failed. Please check your credentials.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = mode === 'login' ? 'Sign In &rarr;' : 'Create Account &rarr;';
      }
    });
  }
};
