/* ==========================================================================
   FINANCEFLOW - CORE APPLICATION LOGIC & VIEW CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  FinanceApp.init();
});

const FinanceApp = {
  currentView: 'landing', // 'landing', 'auth', 'dashboard', 'expenses', 'budget', 'analytics', 'goals', 'settings'
  activeAuthTab: 'login',
  activeSettingsTab: 'profile',
  transactionFilter: 'All',
  searchQuery: '',

  async init() {
    this.bindEvents();
    if (window.api && window.api.getToken()) {
      try {
        const meRes = await window.api.getCurrentUser();
        if (meRes && meRes.success && meRes.data && meRes.data.user) {
          const u = meRes.data.user;
          FinanceData.user.firstName = u.firstName || '';
          FinanceData.user.lastName = u.lastName || '';
          FinanceData.user.name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
          FinanceData.user.email = u.email;
          FinanceData.user.phone = u.phone || '';
          if (u.avatar) FinanceData.user.avatar = u.avatar;
          if (u.plan) FinanceData.user.plan = u.plan;
          await this.loadAppData();
          this.currentView = 'dashboard';
        }
      } catch (e) {
        if (window.api) window.api.setToken(null);
      }
    }
    this.render();
  },

  async loadAppData() {
    if (!window.api || !window.api.getToken()) return;
    try {
      const summaryRes = await window.api.getDashboardSummary();
      if (summaryRes && summaryRes.success && summaryRes.data) {
        const d = summaryRes.data;
        if (d.stats) {
          FinanceData.dashboardStats.totalBalance = d.stats.totalBalance || 0;
          FinanceData.dashboardStats.monthlyIncome = d.stats.monthlyIncome || 0;
          FinanceData.dashboardStats.monthlyExpense = d.stats.monthlyExpense || 0;
          FinanceData.dashboardStats.savingsRate = d.stats.savingsRate || 0;
        }
        if (d.transactions && d.transactions.length > 0) {
          FinanceData.transactions = d.transactions.map(t => ({
            id: t.id,
            date: t.date,
            rawDate: t.date,
            merchant: t.merchant,
            description: t.note || t.merchant,
            category: t.category,
            status: t.status,
            amount: t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount),
            type: t.flag || 'One-Time',
            icon: t.category === 'Groceries' ? 'shopping-cart' : t.category === 'Dining' ? 'coffee' : 'credit-card'
          }));
        }
        if (d.spendingCategoryBreakdown && d.spendingCategoryBreakdown.length > 0) {
          FinanceData.spendingByCategory = d.spendingCategoryBreakdown;
        }
      }

      const goalsRes = await window.api.getSavingsGoals();
      if (goalsRes && goalsRes.success && goalsRes.data) {
        FinanceData.savingsGoals.goalsList = goalsRes.data.map(g => ({
          id: g.id,
          name: g.title,
          currentAmount: g.current,
          targetAmount: g.target,
          targetDate: g.deadline,
          category: g.category,
          status: g.status
        }));
      }
    } catch (err) {
      console.warn('[API Sync Notice]', err.message);
    }
  },

  bindEvents() {
    // Global delegation for navigation & buttons
    document.addEventListener('click', (e) => {
      const navBtn = e.target.closest('[data-view]');
      if (navBtn) {
        e.preventDefault();
        const view = navBtn.getAttribute('data-view');
        this.switchView(view);
      }

      // Filter tabs in transactions table
      const filterTab = e.target.closest('[data-tx-filter]');
      if (filterTab) {
        const filter = filterTab.getAttribute('data-tx-filter');
        this.filterTransactions(filter);
      }

      // Settings sub-tabs
      const settingTab = e.target.closest('[data-setting-tab]');
      if (settingTab) {
        const tab = settingTab.getAttribute('data-setting-tab');
        this.switchSettingsTab(tab);
      }

      // Auth tab toggle
      const authSegment = e.target.closest('[data-auth-tab]');
      if (authSegment) {
        const tab = authSegment.getAttribute('data-auth-tab');
        this.switchAuthTab(tab);
      }

      // Modal open / close handlers
      const modalTrigger = e.target.closest('[data-open-modal]');
      if (modalTrigger) {
        const modalId = modalTrigger.getAttribute('data-open-modal');
        this.openModal(modalId);
      }

      const modalClose = e.target.closest('[data-close-modal]');
      if (modalClose) {
        this.closeModals();
      }

      // Theme toggle
      const themeToggle = e.target.closest('#theme-toggle');
      if (themeToggle) {
        this.toggleTheme();
      }
    });

    // Real-time search filtering
    document.addEventListener('input', (e) => {
      if (e.target.matches('#search-input, .table-search-input')) {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderTransactionTableRows();
      }
    });

    // Handle Form Submissions
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'auth-form') {
        e.preventDefault();
        this.handleAuthSubmit();
      } else if (e.target.id === 'new-expense-form' || e.target.id === 'modal-expense-form') {
        e.preventDefault();
        this.handleNewExpenseSubmit(e.target);
      } else if (e.target.id === 'modal-goal-form') {
        e.preventDefault();
        this.handleNewGoalSubmit(e.target);
      } else if (e.target.id === 'settings-profile-form') {
        e.preventDefault();
        this.handleProfileUpdate(e.target);
      }
    });
  },

  switchView(viewName) {
    this.currentView = viewName;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  switchAuthTab(tab) {
    this.activeAuthTab = tab;
    this.render();
  },

  async handleAuthSubmit() {
    const form = document.getElementById('auth-form');
    if (!form) return;

    const email = form.querySelector('[name="email"]')?.value.trim();
    const password = form.querySelector('[name="password"]')?.value;

    try {
      let res;
      if (this.activeAuthTab === 'signup') {
        const firstName = form.querySelector('[name="firstName"]')?.value.trim();
        const lastName = form.querySelector('[name="lastName"]')?.value.trim();
        const rawPhone = form.querySelector('[name="phone"]')?.value || '';
        const phone = rawPhone.replace(/\D/g, '');
        const confirmPassword = form.querySelector('[name="confirmPassword"]')?.value;

        if (!firstName) {
          this.showToast('Please enter your First Name.');
          return;
        }
        if (!lastName) {
          this.showToast('Please enter your Last Name.');
          return;
        }
        if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
          this.showToast('Please enter a valid 10-digit Indian mobile number.');
          return;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          this.showToast('Please enter a valid email address.');
          return;
        }
        if (!password || password.length < 6) {
          this.showToast('Password must be at least 6 characters long.');
          return;
        }
        if (password !== confirmPassword) {
          this.showToast('Passwords do not match. Please confirm your password.');
          return;
        }

        res = await window.api.register({ firstName, lastName, phone, email, password });
      } else {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          this.showToast('Please enter a valid email address.');
          return;
        }
        if (!password) {
          this.showToast('Please enter your password.');
          return;
        }
        res = await window.api.login({ email, password });
      }

      if (res && res.success && res.data) {
        if (res.data.user) {
          FinanceData.user.firstName = res.data.user.firstName || '';
          FinanceData.user.lastName = res.data.user.lastName || '';
          FinanceData.user.name = `${res.data.user.firstName || ''} ${res.data.user.lastName || ''}`.trim() || res.data.user.email;
          FinanceData.user.email = res.data.user.email;
          FinanceData.user.phone = res.data.user.phone || '';
          if (res.data.user.avatar) FinanceData.user.avatar = res.data.user.avatar;
          if (res.data.user.plan) FinanceData.user.plan = res.data.user.plan;
        }
        this.showToast('Authentication successful! Loading dashboard...');
        await this.loadAppData();
        setTimeout(() => {
          this.switchView('dashboard');
        }, 400);
      }
    } catch (err) {
      console.error('Auth error:', err);
      this.showToast(err.message || 'Authentication failed. Please check credentials.');
    }
  },

  async handleProfileUpdate(form) {
    const firstName = form.querySelector('[name="firstName"]').value.trim();
    const lastName = form.querySelector('[name="lastName"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.replace(/\D/g, '');
    if (!firstName || !lastName || !email || !/^[6-9]\d{9}$/.test(phone)) {
      this.showToast('Enter valid profile details and a 10-digit Indian mobile number.');
      return;
    }
    try {
      const res = await window.api.updateProfile({ firstName, lastName, email, phone });
      const user = res.data;
      FinanceData.user.firstName = user.firstName;
      FinanceData.user.lastName = user.lastName;
      FinanceData.user.name = `${user.firstName} ${user.lastName}`.trim();
      FinanceData.user.email = user.email;
      FinanceData.user.phone = user.phone;
      this.showToast('Profile updated successfully!');
      this.render();
    } catch (err) {
      this.showToast(err.message || 'Unable to update profile.');
    }
  },

  handleLogout() {
    window.api.setToken(null);
    FinanceData.user = { name: '', email: '', firstName: '', lastName: '', phone: '', avatar: '', plan: '' };
    this.currentView = 'auth';
    this.activeAuthTab = 'login';
    this.render();
  },

  async handleNewExpenseSubmit(form) {
    const merchant = form.querySelector('[name="merchant"]').value;
    const date = form.querySelector('[name="date"]').value;
    const amount = parseFloat(form.querySelector('[name="amount"]').value);
    const category = form.querySelector('[name="category"]').value;
    const notes = form.querySelector('[name="notes"]')?.value || '';

    if (!merchant || isNaN(amount) || amount <= 0) {
      this.showToast('Please fill out all required fields with valid values.');
      return;
    }

    try {
      const res = await window.api.createExpense({
        merchant,
        amount,
        categoryName: category,
        note: notes,
        date
      });

      if (res && res.success) {
        this.showToast(`Logged ${formatCurrency(amount)} expense for ${merchant}`);
        form.reset();
        this.closeModals();
        await this.loadAppData();
        this.render();
        return;
      }
    } catch (err) {
      console.warn('API expense logging fallback:', err.message);
    }

    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
      rawDate: date || new Date().toISOString().split('T')[0],
      merchant: merchant,
      description: notes || 'New Expense',
      category: category || 'General',
      status: 'Completed',
      amount: -Math.abs(amount),
      type: 'One-Time',
      icon: category === 'Groceries' ? 'shopping-cart' : category === 'Dining' ? 'coffee' : 'credit-card'
    };

    FinanceData.transactions.unshift(newTx);
    FinanceData.dashboardStats.monthlyExpense += Math.abs(amount);
    FinanceData.dashboardStats.totalBalance -= Math.abs(amount);

    form.reset();
    this.closeModals();
    this.showToast(`Logged ${formatCurrency(amount)} expense for ${merchant}`);

    if (this.currentView === 'expenses' || this.currentView === 'dashboard') {
      this.render();
    }
  },

  async handleNewGoalSubmit(form) {
    const name = form.querySelector('[name="goalName"]').value;
    const target = parseFloat(form.querySelector('[name="targetAmount"]').value);
    const current = parseFloat(form.querySelector('[name="currentAmount"]').value) || 0;
    const date = form.querySelector('[name="targetDate"]').value || '2025-12-31';
    const category = form.querySelector('[name="category"]').value;

    if (!name || isNaN(target) || target <= 0) {
      this.showToast('Please enter a valid goal name and target amount.');
      return;
    }

    try {
      const res = await window.api.createSavingsGoal({
        title: name,
        targetAmount: target,
        currentAmount: current,
        deadline: date,
        category: category || 'GENERAL'
      });

      if (res && res.success) {
        this.showToast(`Goal "${name}" created successfully!`);
        form.reset();
        this.closeModals();
        await this.loadAppData();
        this.render();
        return;
      }
    } catch (err) {
      console.warn('API goal logging fallback:', err.message);
    }

    const newGoal = {
      id: `goal-${Date.now()}`,
      name: name,
      currentAmount: current,
      targetAmount: target,
      targetDate: date || 'Dec 2024',
      category: category || 'Milestone',
      status: 'In Progress'
    };

    FinanceData.savingsGoals.goalsList.unshift(newGoal);
    form.reset();
    this.closeModals();
    this.showToast(`Goal "${name}" created successfully!`);

    if (this.currentView === 'goals') {
      this.render();
    }
  },

  filterTransactions(filter) {
    this.transactionFilter = filter;
    document.querySelectorAll('[data-tx-filter]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tx-filter') === filter);
    });
    this.renderTransactionTableRows();
  },

  switchSettingsTab(tab) {
    this.activeSettingsTab = tab;
    document.querySelectorAll('[data-setting-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-setting-tab') === tab);
    });
  },

  openModal(modalId) {
    const backdrop = document.getElementById('modal-backdrop');
    const target = document.getElementById(modalId);
    if (backdrop && target) {
      backdrop.style.display = 'flex';
      document.querySelectorAll('.modal-window').forEach(m => m.style.display = 'none');
      target.style.display = 'block';
    }
  },

  closeModals() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.style.display = 'none';
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    this.showToast(`Switched to ${next} mode`);
  },

  showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  render() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    if (this.currentView === 'landing') {
      appEl.innerHTML = this.getLandingHTML();
    } else if (this.currentView === 'auth') {
      appEl.innerHTML = this.getAuthHTML();
    } else {
      // Dashboard views shell
      appEl.innerHTML = `
        <div class="dashboard-layout">
          ${this.getSidebarHTML()}
          <div class="main-wrapper">
            ${this.getTopbarHTML()}
            <div class="content-area" id="main-content">
              ${this.getViewContentHTML(this.currentView)}
            </div>
          </div>
        </div>
        ${this.getModalsHTML()}
      `;

      // Trigger chart initializations
      setTimeout(() => {
        if (this.currentView === 'dashboard') {
          FinanceCharts.renderCashFlowChart('cashFlowChart');
          FinanceCharts.renderDonutChart('donutChart');
        } else if (this.currentView === 'budget') {
          FinanceCharts.renderCumulativeChart('cumulativeChart');
        } else if (this.currentView === 'analytics') {
          FinanceCharts.renderAnalyticsChart('analyticsChart');
        }
      }, 50);
    }
  },

  // ----------------------------------------------------
  // HTML TEMPLATES FOR ALL VIEWS
  // ----------------------------------------------------

  // 1. Landing Page (Screen 1)
  getLandingHTML() {
    return `
      <div class="page-public">
        <header class="public-nav">
          <div class="logo-brand" data-view="landing">
            <div class="logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
            </div>
            FinanceFlow
          </div>
          <div class="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
          </div>
          <div class="nav-actions">
            <button class="btn btn-outline" data-view="auth">Sign In</button>
            <button class="btn btn-primary" data-view="auth">Get Started</button>
          </div>
        </header>

        <main class="hero-container">
          <div class="hero-content">
            <div class="badge-trust">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              Trusted by 50,000+ Users
            </div>
            <h1 class="hero-title">Master Your Money <br><span class="text-gradient">With Confidence</span></h1>
            <p class="hero-desc">The comprehensive financial companion for tracking expenses, managing budgets, and reaching your savings goals faster than ever.</p>
            <div class="hero-cta">
              <button class="btn btn-primary btn-lg" data-view="auth">
                Get Started Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button class="btn btn-secondary btn-lg" data-view="dashboard">View Demo</button>
            </div>
            <div class="hero-stats">
              <div class="stat-item">
                <h4>₹2B+</h4>
                <p>MANAGED</p>
              </div>
              <div class="stat-item">
                <h4>99.9%</h4>
                <p>UPTIME</p>
              </div>
              <div class="stat-item">
                <h4>256-bit</h4>
                <p>ENCRYPTION</p>
              </div>
            </div>
          </div>

          <div class="hero-visual">
            <div class="hero-image-wrapper">
              <svg width="600" height="420" viewBox="0 0 600 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="600" height="420" fill="#F8FAFC" rx="16"/>
                <!-- Desk Surface -->
                <rect y="260" width="600" height="160" fill="#E2E8F0"/>
                <!-- Laptop -->
                <rect x="120" y="80" width="360" height="230" rx="12" fill="#1E293B" stroke="#64748B" stroke-width="4"/>
                <rect x="135" y="95" width="330" height="200" rx="6" fill="#0F172A"/>
                <!-- Laptop Screen Elements -->
                <path d="M150 240 Q 210 180, 270 200 T 390 150 T 450 170" stroke="#10B981" stroke-width="4" fill="none"/>
                <path d="M150 260 Q 210 220, 270 230 T 390 190 T 450 210" stroke="#2563EB" stroke-width="4" fill="none"/>
                <rect x="150" y="115" width="80" height="45" rx="6" fill="#1E293B"/>
                <rect x="245" y="115" width="80" height="45" rx="6" fill="#1E293B"/>
                <rect x="340" y="115" width="80" height="45" rx="6" fill="#1E293B"/>
                <!-- Laptop Base -->
                <path d="M90 310 L510 310 L480 325 L120 325 Z" fill="#94A3B8"/>
                <!-- Smartphone -->
                <rect x="470" y="240" width="60" height="110" rx="10" fill="#0F172A" stroke="#475569" stroke-width="3"/>
                <rect x="478" y="250" width="44" height="90" rx="4" fill="#1E293B"/>
              </svg>
            </div>
          </div>
        </main>
      </div>
    `;
  },

  // 2. Auth Page (Screen 2)
  getAuthHTML() {
    return `
      <div class="auth-page">
        <div class="auth-hero-panel">
          <div class="logo-brand" data-view="landing" style="color: #ffffff;">
            <div class="logo-icon" style="background: rgba(255,255,255,0.25);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
            </div>
            FinanceFlow
          </div>

          <div class="auth-hero-art">
            <svg viewBox="0 0 400 320" fill="none">
              <circle cx="200" cy="160" r="120" fill="url(#grad1)" opacity="0.4"/>
              <path d="M140 240 Q 200 60, 260 180 T 320 120" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round"/>
              <circle cx="260" cy="180" r="14" fill="#ffffff"/>
              <circle cx="170" cy="190" r="28" fill="rgba(255,255,255,0.3)"/>
              <circle cx="230" cy="100" r="18" fill="rgba(255,255,255,0.2)"/>
              <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div class="auth-hero-content">
            <h2>Master your financial future with precision.</h2>
            <div class="auth-features">
              <div class="auth-feature-item">
                <div class="auth-feature-icon">✓</div>
                <span>Automated expense tracking and categorization</span>
              </div>
              <div class="auth-feature-item">
                <div class="auth-feature-icon">✓</div>
                <span>Advanced budget planning with goal setting</span>
              </div>
              <div class="auth-feature-item">
                <div class="auth-feature-icon">✓</div>
                <span>Real-time analytics and spending insights</span>
              </div>
            </div>
            <p style="font-size: 0.8rem; opacity: 0.7;">© 2024 FinanceFlow Inc. All rights reserved.</p>
          </div>
        </div>

        <div class="auth-form-panel">
          <div class="auth-form-container">
            <div class="segmented-control">
              <button class="segment-btn ${this.activeAuthTab === 'login' ? 'active' : ''}" data-auth-tab="login">Login</button>
              <button class="segment-btn ${this.activeAuthTab === 'signup' ? 'active' : ''}" data-auth-tab="signup">Create Account</button>
            </div>

            <h2 id="auth-title">${this.activeAuthTab === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
            <p class="subhead" id="auth-desc" style="margin-bottom: 1.75rem;">${this.activeAuthTab === 'login' ? 'Enter your credentials to access your financial dashboard.' : 'Start tracking expenses and building wealth today.'}</p>

            <form id="auth-form">
              ${this.activeAuthTab === 'signup' ? `
                <div class="form-group">
                  <label class="form-label">First Name</label>
                  <input type="text" name="firstName" class="form-input" placeholder="First name" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name</label>
                  <input type="text" name="lastName" class="form-input" placeholder="Last name" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Mobile Number</label>
                  <input type="tel" name="phone" class="form-input" placeholder="Enter 10-digit mobile number" pattern="[6-9][0-9]{9}" maxlength="10" required>
                  <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Enter 10-digit mobile number</span>
                </div>
              ` : ''}
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input type="email" name="email" class="form-input" placeholder="name@company.com" required>
                </div>
              </div>

              <div class="form-group">
                <div style="display: flex; justify-content: space-between;">
                  <label class="form-label">Password</label>
                  ${this.activeAuthTab === 'login' ? '<a href="#" class="forgot-link">Forgot password?</a>' : ''}
                </div>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input type="password" name="password" class="form-input" placeholder="••••••••••••" required>
                </div>
              </div>

              ${this.activeAuthTab === 'signup' ? `
                <div class="form-group">
                  <label class="form-label">Confirm Password</label>
                  <div class="input-wrapper">
                    <span class="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input type="password" name="confirmPassword" class="form-input" placeholder="••••••••••••" required>
                  </div>
                </div>
              ` : ''}

              <div class="form-options">
                <label class="checkbox-label">
                  <input type="checkbox" checked>
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              <button type="submit" class="btn btn-primary" id="auth-submit-btn" style="width: 100%; padding: 0.85rem;">
                ${this.activeAuthTab === 'login' ? 'Sign In' : 'Get Started'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  // Navigation Sidebar
  getSidebarHTML() {
    const views = [
      { id: 'dashboard', label: 'Dashboard', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
      { id: 'expenses', label: 'Expenses', icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>' },
      { id: 'budget', label: 'Budget Planner', icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>' },
      { id: 'analytics', label: 'Analytics', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
      { id: 'goals', label: 'Savings Goals', icon: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' },
      { id: 'settings', label: 'Settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' }
    ];

    return `
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-brand" data-view="landing">
            <div class="logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
            </div>
            <span>FinanceFlow</span>
          </div>
        </div>

        <nav class="sidebar-menu">
          ${views.map(v => `
            <button class="menu-item ${this.currentView === v.id ? 'active' : ''}" data-view="${v.id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${v.icon}</svg>
              <span class="menu-text">${v.label}</span>
            </button>
          `).join('')}
        </nav>
      </aside>
    `;
  },

  // Topbar Header
  getTopbarHTML() {
    const pageTitle = this.currentView.charAt(0).toUpperCase() + this.currentView.slice(1);
    return `
      <header class="dashboard-topbar">
        <div class="topbar-title">${pageTitle === 'Budget' ? 'Budget Planner' : pageTitle}</div>
        <div class="search-box">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" id="search-input" class="form-input" placeholder="Search transactions..." value="${this.searchQuery}">
        </div>

        <div class="topbar-right">
          <button class="btn-icon" id="theme-toggle" title="Toggle Dark/Light Mode">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
          </button>

          <button class="btn-icon notification-bell">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="bell-badge"></span>
          </button>

          <div class="user-profile" data-view="settings">
            <img src="${FinanceData.user.avatar}" alt="User" class="avatar">
            <div class="user-info">
              <span class="user-name">${FinanceData.user.name}</span>
              <span class="user-email">${FinanceData.user.email}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </header>
    `;
  },

  // View Router Content Switcher
  getViewContentHTML(view) {
    switch (view) {
      case 'dashboard': return this.getDashboardOverviewHTML();
      case 'expenses': return this.getExpenseManagementHTML();
      case 'budget': return this.getBudgetPlannerHTML();
      case 'analytics': return this.getAnalyticsEngineHTML();
      case 'goals': return this.getSavingsGoalsHTML();
      case 'settings': return this.getSettingsHTML();
      default: return this.getDashboardOverviewHTML();
    }
  },

  // 3. Page 3: Dashboard Overview
  getDashboardOverviewHTML() {
    const s = FinanceData.dashboardStats;
    return `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Welcome back, ${FinanceData.user.firstName || FinanceData.user.name || 'User'}</h1>
          <p class="subhead">Here's a summary of your financial health today.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter
          </button>
          <button class="btn btn-secondary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button class="btn btn-primary btn-sm" data-open-modal="modal-add-expense">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Transaction
          </button>
        </div>
      </div>

      <!-- 4 Stat Cards -->
      <div class="stat-grid-4">
        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
            </div>
            <span class="trend-badge trend-up">↗ ${s.balanceChange}%</span>
          </div>
          <div class="stat-label">TOTAL BALANCE</div>
          <div class="stat-value">${formatCurrency(s.totalBalance)}</div>
        </div>

        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg" style="background: #f0fdf4; color: #10b981;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <span class="trend-badge trend-up">↗ ${s.incomeChange}%</span>
          </div>
          <div class="stat-label">MONTHLY INCOME</div>
          <div class="stat-value">${formatCurrency(s.monthlyIncome)}</div>
        </div>

        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg" style="background: #fef2f2; color: #ef4444;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <span class="trend-badge trend-down">↘ ${Math.abs(s.expenseChange)}%</span>
          </div>
          <div class="stat-label">MONTHLY EXPENSE</div>
          <div class="stat-value">${formatCurrency(s.monthlyExpense)}</div>
        </div>

        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg" style="background: #eff6ff; color: #2563eb;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <span class="trend-badge trend-up">↗ ${s.savingsRateChange}%</span>
          </div>
          <div class="stat-label">SAVINGS RATE</div>
          <div class="stat-value">${s.savingsRate}%</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2-1">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Cash Flow Analysis</div>
              <p class="subhead" style="font-size: 0.8rem;">Monthly income vs. expense trends</p>
            </div>
            <div class="pill-toggles">
              <button class="pill-btn active">6M</button>
              <button class="pill-btn">1Y</button>
              <button class="pill-btn">All</button>
            </div>
          </div>
          <div style="height: 280px; position: relative;">
            <canvas id="cashFlowChart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Spending by Category</div>
              <p class="subhead" style="font-size: 0.8rem;">Distribution of expenses this month</p>
            </div>
          </div>
          <div style="height: 180px; position: relative;">
            <canvas id="donutChart"></canvas>
          </div>
          <div class="legend-list">
            ${FinanceData.spendingByCategory.map(c => `
              <div class="legend-item">
                <div class="legend-info">
                  <div class="legend-color" style="background: ${c.color};"></div>
                  <span>${c.name}</span>
                </div>
                <span class="legend-val">${c.percentage}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // 4. Page 4: Expense Management
  getExpenseManagementHTML() {
    return `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Expense Management</h1>
          <p class="subhead">Track, categorize, and manage your institutional spending with precision.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button class="btn btn-primary btn-sm" data-open-modal="modal-add-expense">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Entry
          </button>
        </div>
      </div>

      <div class="stat-grid-4">
        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg></div>
            <span class="trend-badge trend-down">↘ 12.5%</span>
          </div>
          <div class="stat-label">TOTAL MONTHLY SPEND</div>
          <div class="stat-value">${formatCurrency(FinanceData.dashboardStats.monthlyExpense)}</div>
        </div>

        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <span class="trend-badge trend-up">↗ 3.2%</span>
          </div>
          <div class="stat-label">AVERAGE DAILY SPEND</div>
          <div class="stat-value">${formatCurrency(142.85)}</div>
        </div>

        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div>
            <span class="trend-badge trend-up">↗ 2.1%</span>
          </div>
          <div class="stat-label">LARGEST CATEGORY</div>
          <div class="stat-value" style="font-size: 1.4rem;">Groceries</div>
        </div>

        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <span class="trend-badge trend-up">↗ 0.0%</span>
          </div>
          <div class="stat-label">FIXED EXPENSES</div>
          <div class="stat-value">${formatCurrency(2100)}</div>
        </div>
      </div>

      <div class="grid-1-2">
        <div class="card">
          <div class="card-header">
            <div class="card-title">+ Log New Expense</div>
          </div>
          <p class="subhead" style="font-size: 0.8rem; margin-bottom: 1.25rem;">Enter the details of your recent transaction below.</p>

          <form id="new-expense-form">
            <div class="grid-2-equal" style="gap: 10px;">
              <div class="form-group">
                <label class="form-label">Merchant / Payee</label>
                <input type="text" name="merchant" class="form-input" style="padding-left: 1rem;" placeholder="e.g. Starbucks" required>
              </div>
              <div class="form-group">
                <label class="form-label">Transaction Date</label>
                <input type="date" name="date" class="form-input" style="padding-left: 1rem;" value="2026-07-27" required>
              </div>
            </div>

            <div class="grid-2-equal" style="gap: 10px;">
              <div class="form-group">
                <label class="form-label">Amount</label>
                <input type="number" step="0.01" name="amount" class="form-input" style="padding-left: 1rem;" placeholder="₹ 0.00" required>
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select name="category" class="form-input" style="padding-left: 1rem;">
                  <option>General</option>
                  <option>Groceries</option>
                  <option>Software</option>
                  <option>Dining</option>
                  <option>Transport</option>
                  <option>Utilities</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes (Optional)</label>
              <textarea name="notes" class="form-input" style="padding-left: 1rem; height: 70px; resize: none;" placeholder="Brief description of the expense..."></textarea>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 1rem;">
              <button type="submit" class="btn btn-primary btn-sm" style="flex: 1;">Save Transaction</button>
              <button type="reset" class="btn btn-outline btn-sm">Clear</button>
            </div>
          </form>

          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <div style="font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Quick Insights
            </div>
            <p style="font-size: 0.775rem; color: var(--text-muted); margin-top: 4px;">Software subscriptions decreased by 8% compared to last month.</p>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Transactions</div>
              <p class="subhead" style="font-size: 0.8rem;">Detailed history of your recent spending activity.</p>
            </div>
            <div style="display: flex; gap: 10px;">
              <div class="search-box" style="width: 180px;">
                <input type="text" class="form-input table-search-input" placeholder="Find merchant..." style="font-size: 0.8rem; padding-top: 6px; padding-bottom: 6px;" value="${this.searchQuery}">
              </div>
              <button class="btn btn-outline btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter
              </button>
            </div>
          </div>

          <div class="pill-toggles" style="margin-bottom: 1.25rem;">
            <button class="pill-btn ${this.transactionFilter === 'All' ? 'active' : ''}" data-tx-filter="All">All</button>
            <button class="pill-btn ${this.transactionFilter === 'Recurring' ? 'active' : ''}" data-tx-filter="Recurring">Recurring</button>
            <button class="pill-btn ${this.transactionFilter === 'One-Time' ? 'active' : ''}" data-tx-filter="One-Time">One-Time</button>
            <button class="pill-btn ${this.transactionFilter === 'Flagged' ? 'active' : ''}" data-tx-filter="Flagged">Flagged <span style="background: #ef4444; color: #fff; padding: 1px 6px; border-radius: 50%; font-size: 0.65rem;">2</span></button>
          </div>

          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TRANSACTION</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody id="transaction-table-body">
                ${this.getTransactionRowsHTML()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  getTransactionRowsHTML() {
    let list = FinanceData.transactions.filter(t => {
      if (this.transactionFilter === 'All') return true;
      return t.type === this.transactionFilter;
    });

    if (this.searchQuery) {
      list = list.filter(t => 
        t.merchant.toLowerCase().includes(this.searchQuery) ||
        t.category.toLowerCase().includes(this.searchQuery) ||
        t.description.toLowerCase().includes(this.searchQuery)
      );
    }

    if (list.length === 0) {
      return `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching transactions found.</td></tr>`;
    }

    return list.map(t => `
      <tr>
        <td style="color: var(--text-muted); font-size: 0.85rem;">
          ${t.date}<br>
          <span style="font-size: 0.725rem; opacity: 0.7;">${t.id}</span>
        </td>
        <td>
          <div class="merchant-cell">
            <div class="merchant-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div>
              <div class="merchant-name">${t.merchant}</div>
              <div class="merchant-sub">${t.description}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-category">${t.category}</span></td>
        <td><span class="badge ${t.status === 'Completed' ? 'badge-completed' : 'badge-pending'}">• ${t.status}</span></td>
        <td style="font-weight: 700; color: ${t.amount < 0 ? 'var(--text-dark)' : '#10b981'};">
                    ${t.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(t.amount))}
        </td>
      </tr>
    `).join('');
  },

  renderTransactionTableRows() {
    const body = document.getElementById('transaction-table-body');
    if (body) body.innerHTML = this.getTransactionRowsHTML();
  },

  // 5. Page 5: Monthly Budget Planner
  getBudgetPlannerHTML() {
    const b = FinanceData.budgetPlanner;
    return `
      <div class="page-header">
        <div class="page-title-group">
          <div class="section-tag">FINANCIAL PLANNING</div>
          <h1>Monthly Budget Planner</h1>
          <p class="subhead">Organize your finances by setting limits on your spending categories. Monitor progress in real-time to stay on track.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm">Export Report</button>
          <button class="btn btn-primary btn-sm" data-open-modal="modal-add-expense">+ Create Category</button>
        </div>
      </div>

      <div class="hero-banner-card">
        <div>
          <span class="badge" style="background: rgba(255,255,255,0.2); color: #fff; margin-bottom: 1rem;">Active Period: ${b.activePeriod}</span>
          <h2>Optimize Your Monthly Cash Flow</h2>
          <p>${b.recommendation}</p>
          <button class="btn btn-secondary btn-sm" style="color: var(--primary-blue);" onclick="FinanceApp.showToast('AI analysis up to date!')">View Personalized Insights ></button>
        </div>
        <div class="banner-img-container">
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.15)"/>
            <rect x="60" y="60" width="80" height="80" rx="12" fill="#ffffff" fill-opacity="0.9"/>
            <path d="M75 120 L95 95 L115 110 L135 75" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <div class="stat-grid-4">
        <div class="card">
          <div class="stat-label">Total Budget</div>
          <div class="stat-value">${formatCurrency(b.totalBudget)}</div>
          <p class="subhead" style="font-size: 0.75rem; margin-top: 4px;">Set for 8 categories</p>
        </div>
        <div class="card">
          <div class="stat-label">Total Spent</div>
          <div class="stat-value">${formatCurrency(b.totalSpent)} <span style="font-size: 0.85rem; color: #ef4444;">+12%</span></div>
          <p class="subhead" style="font-size: 0.75rem; margin-top: 4px;">83% of monthly limit</p>
        </div>
        <div class="card">
          <div class="stat-label">Remaining</div>
          <div class="stat-value" style="color: #10b981;">${formatCurrency(b.remaining)}</div>
          <p class="subhead" style="font-size: 0.75rem; margin-top: 4px;">Average ${formatCurrency(97, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/day</p>
        </div>
        <div class="card">
          <div class="stat-label">Savings Goal</div>
          <div class="stat-value">${formatCurrency(b.savingsGoalTarget)}</div>
          <p class="subhead" style="font-size: 0.75rem; margin-top: 4px;">Target for this month</p>
        </div>
      </div>

      <div class="grid-2-1">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Cumulative Spending</div>
              <p class="subhead" style="font-size: 0.8rem;">Visualizing your daily spending vs. ideal budget pace</p>
            </div>
            <div class="pill-toggles">
              <button class="pill-btn active">Daily</button>
              <button class="pill-btn">Weekly</button>
            </div>
          </div>
          <div style="height: 260px; position: relative;">
            <canvas id="cumulativeChart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Smart Notifications</div>
              <p class="subhead" style="font-size: 0.8rem;">Real-time alerts for your wallet</p>
            </div>
          </div>

          ${b.alerts.map(a => `
            <div class="notification-card ${a.type}">
              <div style="color: ${a.type === 'warning' ? '#dc2626' : '#059669'}; font-weight: 700;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.875rem; color: var(--text-dark);">${a.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${a.message}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 6. Page 6: Analytics Engine
  getAnalyticsEngineHTML() {
    const a = FinanceData.analytics;
    return `
      <div class="page-header">
        <div class="page-title-group">
          <div class="section-tag">ANALYTICS ENGINE</div>
          <h1>Financial Intelligence</h1>
          <p class="subhead">Deep-dive insights into your spending habits and wealth accumulation.</p>
        </div>
        <div class="page-actions">
          <select class="form-input" style="padding: 6px 12px; font-size: 0.85rem;">
            <option>June 2024</option>
            <option>May 2024</option>
            <option>April 2024</option>
          </select>
          <button class="btn btn-secondary btn-sm">Filter</button>
          <button class="btn btn-primary btn-sm">Export Report</button>
        </div>
      </div>

      <div class="stat-grid-4">
        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
            <span class="trend-badge trend-up">↗ +${a.incomeChange}%</span>
          </div>
          <div class="stat-label">TOTAL INCOME</div>
          <div class="stat-value">${formatCurrency(a.totalIncome)}</div>
        </div>

        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
            <span class="trend-badge trend-down">↘ +${a.expenseChange}%</span>
          </div>
          <div class="stat-label">TOTAL EXPENSES</div>
          <div class="stat-value">${formatCurrency(a.totalExpenses)}</div>
        </div>

        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
            <span class="trend-badge trend-up">↗ +${a.savingsChange}%</span>
          </div>
          <div class="stat-label">NET SAVINGS</div>
          <div class="stat-value">${formatCurrency(a.netSavings)}</div>
        </div>

        <div class="card">
          <div class="stat-card-header">
            <div class="stat-icon-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
            <span class="trend-badge trend-up">↗ +${a.savingsRateChange}%</span>
          </div>
          <div class="stat-label">SAVINGS RATE</div>
          <div class="stat-value">${a.savingsRate}%</div>
        </div>
      </div>

      <div class="grid-2-1">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Cash Flow Trends</div>
              <p class="subhead" style="font-size: 0.8rem;">Monthly comparison of revenue vs expenditures</p>
            </div>
            <div class="pill-toggles">
              <button class="pill-btn">1M</button>
              <button class="pill-btn active">6M</button>
              <button class="pill-btn">1Y</button>
              <button class="pill-btn">ALL</button>
            </div>
          </div>
          <div style="height: 280px; position: relative;">
            <canvas id="analyticsChart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Automated Insights</div>
              <p class="subhead" style="font-size: 0.8rem;">AI-generated financial health assessment</p>
            </div>
          </div>

          ${a.insights.map(i => `
            <div class="notification-card ${i.type === 'success' ? 'success' : i.type === 'info' ? 'info' : 'warning'}">
              <div style="font-size: 1.1rem; color: var(--primary-blue);">ℹ</div>
              <div style="font-size: 0.825rem; color: var(--text-dark); align-self: center;">${i.text}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 7. Page 7: Savings Goals
  getSavingsGoalsHTML() {
    const g = FinanceData.savingsGoals;
    return `
      <div class="page-header">
        <div class="page-title-group">
          <div class="section-tag">FINANCIAL PLANNING</div>
          <h1>Savings Goals</h1>
          <p class="subhead">Track your progress towards major life milestones. Set targets, automate your savings, and watch your future grow.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm">View History</button>
          <button class="btn btn-primary btn-sm" data-open-modal="modal-add-goal">+ Create New Goal</button>
        </div>
      </div>

      <div class="hero-banner-card">
        <div>
          <span class="badge" style="background: rgba(255,255,255,0.2); color: #fff; margin-bottom: 1rem;">Smart Savings Insights</span>
          <h2>${g.heroTarget}</h2>
          <p>${g.heroDetail}</p>
          <button class="btn btn-secondary btn-sm" style="color: var(--primary-blue);" onclick="FinanceApp.showToast('Plan optimized!')">Optimize My Plan ↗</button>
        </div>
        <div class="banner-img-container">
          <svg viewBox="0 0 200 200" fill="none">
            <ellipse cx="100" cy="140" rx="60" ry="20" fill="rgba(0,0,0,0.15)"/>
            <path d="M70 70 Q 100 40, 130 70 L140 140 Q 100 160, 60 140 Z" fill="#ffffff" fill-opacity="0.95"/>
            <circle cx="100" cy="90" r="14" fill="#f59e0b"/>
            <circle cx="115" cy="115" r="10" fill="#f59e0b"/>
            <circle cx="85" cy="110" r="12" fill="#f59e0b"/>
          </svg>
        </div>
      </div>

      <div class="stat-grid-4" style="grid-template-columns: repeat(3, 1fr);">
        <div class="card">
          <div class="stat-label">Total Savings</div>
          <div class="stat-value">$${g.totalSavings.toLocaleString()} <span style="font-size: 0.85rem; color: #10b981;">+${g.totalSavingsChange}%</span></div>
        </div>
        <div class="card">
          <div class="stat-label">Monthly Contribution</div>
          <div class="stat-value">$${g.monthlyContribution.toLocaleString()} <span style="font-size: 0.85rem; color: #10b981;">+$${g.monthlyContribChange}</span></div>
        </div>
        <div class="card">
          <div class="stat-label">Goals Reached</div>
          <div class="stat-value">${g.goalsReached} <span style="font-size: 0.85rem; color: var(--text-muted);">Last 6 mos</span></div>
        </div>
      </div>

      <div class="grid-2-equal">
        ${g.goalsList.map(goal => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          return `
            <div class="card">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <div>
                  <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-dark);">${goal.name}</div>
                  <span class="badge badge-category" style="margin-top: 4px;">${goal.category}</span>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 800; font-size: 1.2rem; color: var(--primary-blue);">${percent}%</div>
                  <span class="subhead" style="font-size: 0.75rem;">Target: ${goal.targetDate}</span>
                </div>
              </div>

              <div class="progress-bar-bg" style="margin-bottom: 1rem;">
                <div class="progress-bar-fill" style="width: ${percent}%;"></div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                <span style="color: var(--text-muted);">Current: <strong style="color: var(--text-dark);">${formatCurrency(goal.currentAmount)}</strong></span>
                <span style="color: var(--text-muted);">Goal: <strong style="color: var(--text-dark);">${formatCurrency(goal.targetAmount)}</strong></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // 8. Page 8: Settings
  getSettingsHTML() {
    const u = FinanceData.user;
    return `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Settings</h1>
          <p class="subhead">Manage your account preferences, security settings, and notification frequency.</p>
        </div>
        <div class="page-actions">
          <button type="submit" form="settings-profile-form" class="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </div>

      <div class="sub-tabs">
        <button class="sub-tab-btn ${this.activeSettingsTab === 'profile' ? 'active' : ''}" data-setting-tab="profile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profile
        </button>
        <button class="sub-tab-btn ${this.activeSettingsTab === 'security' ? 'active' : ''}" data-setting-tab="security">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Security
        </button>
        <button class="sub-tab-btn ${this.activeSettingsTab === 'notifications' ? 'active' : ''}" data-setting-tab="notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          Notifications
        </button>
        <button class="sub-tab-btn ${this.activeSettingsTab === 'appearance' ? 'active' : ''}" data-setting-tab="appearance">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
          Appearance
        </button>
      </div>

      <div class="grid-2-1">
        <div class="card">
          <div class="card-title" style="margin-bottom: 0.25rem;">Personal Information</div>
          <p class="subhead" style="font-size: 0.8rem; margin-bottom: 1.5rem;">Update your photo and personal details here.</p>

          <div class="avatar-edit-box">
            <div class="avatar-large-container">
              <img src="${u.avatar}" alt="Avatar" class="avatar-large">
              <div class="avatar-upload-icon">📷</div>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">Profile Picture</div>
              <p class="subhead" style="font-size: 0.775rem;">JPG, GIF or PNG. Max size of 2MB.</p>
              <div style="display: flex; gap: 10px; margin-top: 8px;">
                <button class="btn btn-outline btn-sm" onclick="FinanceApp.showToast('Select image file')">Change</button>
                <button class="btn btn-outline btn-sm" style="color: var(--danger-red); border-color: transparent;">Remove</button>
              </div>
            </div>
          </div>

          <form id="settings-profile-form">
            <div class="grid-2-equal">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input type="text" name="firstName" class="form-input" style="padding-left: 1rem;" value="${u.firstName || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input type="text" name="lastName" class="form-input" style="padding-left: 1rem;" value="${u.lastName || ''}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" name="email" class="form-input" style="padding-left: 1rem;" value="${u.email}" required>
            </div>

            <div class="grid-2-equal">
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" name="phone" class="form-input" style="padding-left: 1rem;" value="${u.phone || ''}" pattern="[6-9][0-9]{9}" maxlength="10" required>
              </div>
              <div class="form-group">
                <label class="form-label">Timezone</label>
                <select class="form-input" style="padding-left: 1rem;">
                  <option selected>${u.timezone}</option>
                  <option>Eastern Standard Time (EST)</option>
                  <option>Greenwich Mean Time (GMT)</option>
                </select>
              </div>
            </div>
          </form>

          <div class="danger-zone">
            <h4>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Danger Zone
            </h4>
            <p style="font-size: 0.8rem; color: #991b1b;">Permanently delete your account and all associated financial data.</p>
            <button type="button" class="btn btn-outline btn-sm" onclick="FinanceApp.handleLogout()">Log Out</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card">
            <div class="subhead" style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">Plan Details</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0 1rem;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark);">${u.plan}</div>
              <span class="badge badge-completed">Active</span>
            </div>
            <p class="subhead" style="font-size: 0.8rem; margin-bottom: 1rem;">Next billing date: <strong>${u.nextBilling}</strong></p>
            <button class="btn btn-outline btn-sm" style="width: 100%;" onclick="FinanceApp.showToast('Subscription settings loaded')">Manage Subscription</button>
          </div>

          <div class="card">
            <div class="card-title" style="font-size: 1rem; margin-bottom: 1rem;">Connected Accounts</div>
            ${FinanceData.connectedAccounts.map(acc => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 6px; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary-blue);">💳</div>
                  <div>
                    <div style="font-weight: 700; font-size: 0.875rem;">${acc.bank}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${acc.accountType}</div>
                  </div>
                </div>
                <div style="color: #10b981;">✓</div>
              </div>
            `).join('')}
            <button class="btn btn-outline btn-sm" style="width: 100%; margin-top: 1rem; color: var(--primary-blue);" onclick="FinanceApp.showToast('Bank connection portal opening...')">+ Connect New Account</button>
          </div>
        </div>
      </div>
    `;
  },

  // Modals markup
  getModalsHTML() {
    return `
      <div id="modal-backdrop" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 90; align-items: center; justify-content: center;">
        
        <!-- Add Expense Modal -->
        <div id="modal-add-expense" class="modal-window card" style="max-width: 480px; width: 90%; display: none; box-shadow: var(--shadow-xl);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.2rem;">Add Transaction</h3>
            <button class="btn-icon" data-close-modal style="width: 32px; height: 32px;">✕</button>
          </div>

          <form id="modal-expense-form">
            <div class="form-group">
              <label class="form-label">Merchant / Payee</label>
              <input type="text" name="merchant" class="form-input" style="padding-left: 1rem;" placeholder="e.g. Starbucks" required>
            </div>

            <div class="grid-2-equal">
              <div class="form-group">
                <label class="form-label">Amount (₹)</label>
                <input type="number" step="0.01" name="amount" class="form-input" style="padding-left: 1rem;" placeholder="0.00" required>
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select name="category" class="form-input" style="padding-left: 1rem;">
                  <option>Groceries</option>
                  <option>Software</option>
                  <option>Dining</option>
                  <option>Transport</option>
                  <option>Utilities</option>
                  <option>General</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Transaction Date</label>
              <input type="date" name="date" class="form-input" style="padding-left: 1rem;" value="${new Date().toISOString().split('T')[0]}" required>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary" style="flex: 1;">Save Transaction</button>
              <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
            </div>
          </form>
        </div>

        <!-- Add Savings Goal Modal -->
        <div id="modal-add-goal" class="modal-window card" style="max-width: 480px; width: 90%; display: none; box-shadow: var(--shadow-xl);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.2rem;">Create Savings Goal</h3>
            <button class="btn-icon" data-close-modal style="width: 32px; height: 32px;">✕</button>
          </div>

          <form id="modal-goal-form">
            <div class="form-group">
              <label class="form-label">Goal Name</label>
              <input type="text" name="goalName" class="form-input" style="padding-left: 1rem;" placeholder="e.g. New Laptop" required>
            </div>

            <div class="grid-2-equal">
              <div class="form-group">
                <label class="form-label">Target Amount (₹)</label>
                <input type="number" name="targetAmount" class="form-input" style="padding-left: 1rem;" placeholder="2500" required>
              </div>
              <div class="form-group">
                <label class="form-label">Initial Amount (₹)</label>
                <input type="number" name="currentAmount" class="form-input" style="padding-left: 1rem;" placeholder="500">
              </div>
            </div>

            <div class="grid-2-equal">
              <div class="form-group">
                <label class="form-label">Target Date</label>
                <input type="text" name="targetDate" class="form-input" style="padding-left: 1rem;" placeholder="Dec 2024">
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" name="category" class="form-input" style="padding-left: 1rem;" placeholder="Gadgets">
              </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary" style="flex: 1;">Create Goal</button>
              <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
            </div>
          </form>
        </div>

      </div>
    `;
  }
};

window.FinanceApp = FinanceApp;
