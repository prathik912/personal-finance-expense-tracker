/* ==========================================================================
   SAVINGS GOALS VIEW WITH REAL DATABASE DATA & EMPTY STATES
   ========================================================================== */

import { renderCircularProgress } from '../components/SVGCharts.js';

export const renderSavingsGoalsView = (store) => {
  const goals = store.savingsGoals || [];

  const totalSaved = goals.reduce((sum, g) => sum + (parseFloat(g.current) || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + (parseFloat(g.target) || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return `
    <div class="page-container">
      <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary); letter-spacing: 0.05em; margin-bottom: 0.25rem;">
        FINANCIAL PLANNING
      </div>
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="heading-lg">Savings Goals</h1>
          <p>Track your progress towards major life milestones with real-time target monitoring.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.exportCSV()">🔄 Export Data</button>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('modal-savings-goal').classList.add('active')">
            + Create New Goal
          </button>
        </div>
      </div>

      <!-- Goal Stats Grid -->
      <div class="stats-grid">
        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">👛</div>
            <span class="badge badge-success">Saved</span>
          </div>
          <span class="stat-title">TOTAL SAVINGS</span>
          <span class="stat-value">$${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">🎯</div>
            <span class="badge badge-primary">Target</span>
          </div>
          <span class="stat-title">TOTAL TARGET</span>
          <span class="stat-value">$${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">📈</div>
            <span class="badge badge-success">Progress</span>
          </div>
          <span class="stat-title">OVERALL PROGRESS</span>
          <span class="stat-value">${overallProgress}%</span>
        </div>
      </div>

      <!-- Goals Grid (SVG Circular Ring Cards) -->
      <div class="grid-3" style="margin-top: 1.5rem;">
        ${goals.length > 0 ? goals.map(goal => {
          const current = parseFloat(goal.current) || 0;
          const target = parseFloat(goal.target) || 1;
          const remaining = Math.max(0, target - current);
          const progress = goal.progress || Math.round((current / target) * 100);

          return `
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                  <div>
                    <h3 class="heading-md">${goal.title}</h3>
                    <span class="badge badge-neutral" style="margin-top: 0.25rem;">${goal.category || 'GENERAL'}</span>
                  </div>
                </div>

                <div style="margin: 1.5rem 0;">
                  ${renderCircularProgress(progress, 130, '#2563eb')}
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
                  <div>
                    <span class="text-muted" style="font-size: 0.75rem;">Current Savings</span>
                    <div style="font-weight: 800; font-size: 1.125rem;">$${current.toLocaleString()}</div>
                  </div>
                  <div style="text-align: right;">
                    <span class="text-muted" style="font-size: 0.75rem;">Target</span>
                    <div style="font-weight: 800; font-size: 1.125rem; color: var(--text-muted);">$${target.toLocaleString()}</div>
                  </div>
                </div>

                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
                  📅 Deadline: ${goal.deadline}
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; font-size: 0.8125rem;">
                <span style="font-weight: 700; color: var(--primary);">$${remaining.toLocaleString()} remaining</span>
              </div>
            </div>
          `;
        }).join('') : `
          <div style="grid-column: span 3; text-align: center; padding: 3rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
            <div style="font-weight: 600;">No savings goals created yet</div>
            <div style="font-size: 0.8125rem; margin-top: 0.25rem;">Click "+ Create New Goal" above to start tracking your targets!</div>
          </div>
        `}
      </div>
    </div>
  `;
};
