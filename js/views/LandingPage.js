/* ==========================================================================
   LANDING PAGE VIEW (Screenshots 1 & 2)
   ========================================================================== */

export const renderLandingPage = () => {
  return `
    <div style="background-color: var(--bg-main); min-height: 100vh;">
      <!-- Landing Header Navigation -->
      <header class="header" style="background-color: var(--bg-card); border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" onclick="window.navigateTo('landing')">
          <img src="assets/code_morphicx_logo.jpg" alt="Code Morphicx Logo" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="5" width="20" height="14" rx="3" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <span class="brand-name">Finance<span>Flow</span></span>
        </div>

        <nav style="display: flex; gap: 2rem; align-items: center;" class="hide-mobile">
          <a href="#features" style="font-weight: 600; font-size: 0.875rem; color: var(--text-muted);">Features</a>
          <a href="#how-it-works" style="font-weight: 600; font-size: 0.875rem; color: var(--text-muted);">How it Works</a>
          <a href="#testimonials" style="font-weight: 600; font-size: 0.875rem; color: var(--text-muted);">Testimonials</a>
          <a href="#faq" style="font-weight: 600; font-size: 0.875rem; color: var(--text-muted);">FAQ</a>
        </nav>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <button class="btn btn-secondary" onclick="window.navigateTo('auth')">Sign In</button>
          <button class="btn btn-primary btn-pill" onclick="window.navigateTo('auth')">Get Started</button>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="landing-hero">
        <div>
          <div class="landing-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Trusted by 50,000+ Users
          </div>
          <h1 class="heading-xl" style="font-size: 3.25rem; margin-bottom: 1.25rem;">
            Master Your Money <br>
            <span style="color: var(--primary);">With Confidence</span>
          </h1>
          <p class="text-muted" style="font-size: 1.125rem; max-width: 520px; margin-bottom: 2rem;">
            The comprehensive financial companion for tracking expenses, managing budgets, and reaching your savings goals faster than ever.
          </p>

          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-lg btn-pill" onclick="window.navigateTo('auth')">
              Get Started Free &rarr;
            </button>
            <button class="btn btn-secondary btn-lg" onclick="window.navigateTo('dashboard')">
              View Demo
            </button>
          </div>

          <div class="landing-hero-stats">
            <div class="landing-stat-item">
              <h4>₹2B+</h4>
              <p>MANAGED</p>
            </div>
            <div class="landing-stat-item">
              <h4>99.9%</h4>
              <p>UPTIME</p>
            </div>
            <div class="landing-stat-item">
              <h4>256-bit</h4>
              <p>ENCRYPTION</p>
            </div>
          </div>
        </div>

        <!-- Hero Mockup Illustration -->
        <div style="position: relative;">
          <div class="card" style="padding: 1.5rem; background: linear-gradient(145deg, #ffffff, #f1f5f9); box-shadow: var(--shadow-lg); border-radius: var(--radius-xl);">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span>
              <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></span>
              <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span>
            </div>
            <div style="background: var(--bg-card); border-radius: var(--radius-md); padding: 1.5rem; border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                  <span style="font-weight: 700; font-size: 0.875rem;">YOUR PERFORMANCE</span>
                  <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">₹45,231.89</div>
                </div>
                <span class="badge badge-success">+12.5%</span>
              </div>
              <svg viewBox="0 0 400 120" style="width: 100%;">
                <path d="M0,90 Q80,20 160,70 T320,30 T400,60" fill="none" stroke="#2563eb" stroke-width="4" />
                <path d="M0,90 Q80,20 160,70 T320,30 T400,60 L400,120 L0,120 Z" fill="rgba(37,99,235,0.1)" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Capabilities Section -->
      <section id="features" style="padding: 5rem 2rem; background-color: var(--bg-card); border-top: 1px solid var(--border-color);">
        <div style="max-width: 1400px; margin: 0 auto; text-align: center;">
          <div class="landing-badge" style="margin: 0 auto 1rem;">CAPABILITIES</div>
          <h2 class="heading-xl" style="margin-bottom: 0.75rem;">Designed for Modern Wealth</h2>
          <p class="text-muted" style="max-width: 600px; margin: 0 auto 3rem;">
            Everything you need to visualize your cash flow, eliminate debt, and build lasting financial habits without the complexity.
          </p>

          <div class="capabilities-grid">
            <div class="capability-card" style="text-align: left;">
              <div class="capability-icon">📊</div>
              <h3 class="heading-md" style="margin-bottom: 0.5rem;">Intelligent Analytics</h3>
              <p class="text-muted" style="font-size: 0.875rem;">
                Gain deep insights into your spending patterns with interactive charts and automated categorization.
              </p>
            </div>

            <div class="capability-card" style="text-align: left;">
              <div class="capability-icon">⚡</div>
              <h3 class="heading-md" style="margin-bottom: 0.5rem;">Real-time Tracking</h3>
              <p class="text-muted" style="font-size: 0.875rem;">
                Instantly sync with your bank accounts for a live view of your transactions and balances.
              </p>
            </div>

            <div class="capability-card" style="text-align: left;">
              <div class="capability-icon">📱</div>
              <h3 class="heading-md" style="margin-bottom: 0.5rem;">Budget Planning</h3>
              <p class="text-muted" style="font-size: 0.875rem;">
                Create customized monthly budgets and receive alerts before you exceed your limits.
              </p>
            </div>

            <div class="capability-card" style="text-align: left;">
              <div class="capability-icon">🛡️</div>
              <h3 class="heading-md" style="margin-bottom: 0.5rem;">Bank-Grade Security</h3>
              <p class="text-muted" style="font-size: 0.875rem;">
                Your data is protected with the highest level of encryption and multi-factor authentication.
              </p>
            </div>

            <div class="capability-card" style="text-align: left;">
              <div class="capability-icon">🎯</div>
              <h3 class="heading-md" style="margin-bottom: 0.5rem;">Goal Oriented</h3>
              <p class="text-muted" style="font-size: 0.875rem;">
                Set specific savings goals and track your progress with visual milestones and projections.
              </p>
            </div>

            <div class="capability-card" style="text-align: left;">
              <div class="capability-icon">➕</div>
              <h3 class="heading-md" style="margin-bottom: 0.5rem;">Global Currency Support</h3>
              <p class="text-muted" style="font-size: 0.875rem;">
                Manage accounts across multiple currencies with real-time exchange rate updates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
};
