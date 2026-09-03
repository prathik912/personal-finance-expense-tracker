/* ==========================================================================
   MONTHLY BUDGET PLANNER VIEW WITH REAL DATABASE DATA & EMPTY STATES
   ========================================================================== */

export const renderBudgetPlannerView = (store) => {
  const categories = store.budgetCategories || [];
  const adjustments = store.budgetAdjustments || [];

  const totalBudget = categories.reduce((sum, c) => sum + (parseFloat(c.limit) || 0), 0);
  const totalSpent = categories.reduce((sum, c) => sum + (parseFloat(c.spent) || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const pctUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return `
    <div class="page-container">
      <!-- Subhead & Title -->
      <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary); letter-spacing: 0.05em; margin-bottom: 0.25rem;">
        FINANCIAL PLANNING
      </div>
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="heading-lg">Monthly Budget Planner</h1>
          <p>Organize your finances by setting limits on your spending categories. Monitor progress in real-time.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.exportCSV()">
            📥 Export Report
          </button>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('modal-budget-category').classList.add('active')">
            + Create Category
          </button>
        </div>
      </div>

      <!-- Summary Stat Cards -->
      <div class="stats-grid">
        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">🧮</div>
            <span class="badge badge-primary">Total</span>
          </div>
          <span class="stat-title">TOTAL BUDGET</span>
          <span class="stat-value">${formatCurrency(totalBudget)}</span>
          <span class="text-muted" style="font-size: 0.75rem;">Set for ${categories.length} categories</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">💸</div>
            <span class="badge ${pctUsed > 100 ? 'badge-danger' : 'badge-success'}">${pctUsed}%</span>
          </div>
          <span class="stat-title">TOTAL SPENT</span>
          <span class="stat-value">${formatCurrency(totalSpent)}</span>
          <span class="text-muted" style="font-size: 0.75rem;">${pctUsed}% of monthly limit</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">👛</div>
            <span class="badge badge-neutral">Net</span>
          </div>
          <span class="stat-title">REMAINING BUDGET</span>
          <span class="stat-value">${formatCurrency(totalRemaining)}</span>
          <span class="text-muted" style="font-size: 0.75rem;">Available balance</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">🎯</div>
            <span class="badge badge-success">Target</span>
          </div>
          <span class="stat-title">SAVINGS RATE</span>
          <span class="stat-value">${store.stats?.savingsRate || 0}%</span>
          <span class="text-muted" style="font-size: 0.75rem;">Target for this period</span>
        </div>
      </div>

      <!-- Budget Categories Cards Grid -->
      <div style="margin-bottom: 2rem;">
        <h2 class="heading-md" style="margin-bottom: 1rem;">Budget Categories</h2>
        <div class="grid-3">
          ${categories.length > 0 ? categories.map(cat => {
            const limit = parseFloat(cat.limit) || 1;
            const spent = parseFloat(cat.spent) || 0;
            const pct = Math.round((spent / limit) * 100);
            const isExceeded = spent > limit;
            const diff = Math.abs(limit - spent);

            return `
              <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                  <div>
                    <h3 class="heading-sm">${cat.name}</h3>
                    <span class="text-muted" style="font-size: 0.75rem;">Monthly Limit: ${formatCurrency(limit)}</span>
                  </div>
                  <span class="badge ${isExceeded ? 'badge-danger' : 'badge-primary'}">${pct}% used</span>
                </div>

                <div style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">
                  ${formatCurrency(spent)}
                </div>

                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${Math.min(100, pct)}%; background: ${isExceeded ? 'var(--danger)' : 'var(--primary)'};"></div>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; margin-top: 0.5rem;">
                  <span class="text-muted">SPENT</span>
                  <span style="color: ${isExceeded ? 'var(--danger)' : 'var(--text-muted)'};">
                    ${isExceeded ? `OVER BY ${formatCurrency(diff)}` : `${formatCurrency(diff)} LEFT`}
                  </span>
                </div>
              </div>
            `;
          }).join('') : `
            <div style="grid-column: span 3; text-align: center; padding: 3rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
              <div style="font-weight: 600;">No budget categories configured yet</div>
              <div style="font-size: 0.8125rem; margin-top: 0.25rem;">Click "+ Create Category" above to set your first spending limit</div>
            </div>
          `}
        </div>
      </div>

      <!-- Recent Budget Adjustments Table -->
      ${adjustments.length > 0 ? `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h2 class="heading-md">Recent Budget Adjustments</h2>
              <p class="text-muted" style="font-size: 0.8125rem;">Track changes made to your planning limits</p>
            </div>
          </div>

          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Date Changed</th>
                  <th>Adjustment</th>
                  <th>Previous Limit</th>
                  <th>New Limit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${adjustments.map(adj => `
                  <tr>
                    <td style="font-weight: 700;">${adj.category}</td>
                    <td style="color: var(--text-muted); font-size: 0.8125rem;">${adj.date}</td>
                    <td style="font-weight: 600; color: var(--primary);">${adj.adjustment}</td>
                    <td style="color: var(--text-muted);">${adj.prev}</td>
                    <td style="font-weight: 700;">${adj.newLimit}</td>
                    <td>
                      <span class="badge ${adj.status === 'Approved' ? 'badge-primary' : 'badge-neutral'}">
                        ${adj.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};
