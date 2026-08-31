/* ==========================================================================
   MAIN DASHBOARD OVERVIEW VIEW WITH REAL DATABASE DATA & EMPTY STATES
   ========================================================================== */

import { renderCashFlowAreaChart, renderDonutChart } from '../components/SVGCharts.js';

export const renderDashboardView = (store) => {
  const { stats, transactions, savingsGoals, monthlyTrend, spendingCategoryBreakdown, user } = store;

  const userName = user && user.firstName ? user.firstName : 'User';
  const safeStats = stats || { totalBalance: 0, monthlyIncome: 0, monthlyExpense: 0, savingsRate: 0 };
  const safeTx = transactions || [];
  const safeGoals = savingsGoals || [];
  const safeBreakdown = spendingCategoryBreakdown || [];
  const safeTrend = monthlyTrend || [];

  return `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="heading-lg">Welcome back, ${userName}</h1>
          <p>Here's a real-time summary of your financial health today.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.exportCSV()">
            <span>📥</span> Export CSV
          </button>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('modal-receipt-sync').classList.add('active')">
            + Add Transaction
          </button>
        </div>
      </div>

      <!-- Stat Metric Cards (4 Cards) -->
      <div class="stats-grid">
        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">💳</div>
            <span class="badge badge-success">Live</span>
          </div>
          <span class="stat-title">TOTAL BALANCE</span>
          <span class="stat-value">$${(safeStats.totalBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">📈</div>
            <span class="badge badge-success">Income</span>
          </div>
          <span class="stat-title">MONTHLY INCOME</span>
          <span class="stat-value">$${(safeStats.monthlyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">📉</div>
            <span class="badge badge-danger">Expense</span>
          </div>
          <span class="stat-title">MONTHLY EXPENSE</span>
          <span class="stat-value">$${(safeStats.monthlyExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">🎯</div>
            <span class="badge badge-success">Rate</span>
          </div>
          <span class="stat-title">SAVINGS RATE</span>
          <span class="stat-value">${safeStats.savingsRate || 0}%</span>
        </div>
      </div>

      <!-- Main Charts Row -->
      <div class="grid-2">
        <!-- Cash Flow Analysis Chart -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
            <div>
              <h2 class="heading-md">Cash Flow Analysis</h2>
              <p class="text-muted" style="font-size: 0.8125rem;">Monthly income vs. expense trends</p>
            </div>
          </div>

          ${renderCashFlowAreaChart(safeTrend)}

          <div style="display: flex; gap: 1.5rem; justify-content: center; margin-top: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600;">
              <span style="width: 10px; height: 10px; border-radius: 2px; background: #10b981;"></span> Income
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600;">
              <span style="width: 10px; height: 10px; border-radius: 2px; background: #2563eb;"></span> Expenses
            </div>
          </div>
        </div>

        <!-- Spending by Category Donut Chart -->
        <div class="card">
          <div style="margin-bottom: 1.5rem;">
            <h2 class="heading-md">Spending by Category</h2>
            <p class="text-muted" style="font-size: 0.8125rem;">Distribution of expenses</p>
          </div>

          ${safeBreakdown.length > 0 ? `
            ${renderDonutChart(safeBreakdown)}
            <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
              ${safeBreakdown.map(cat => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: ${cat.color || '#2563eb'};"></span>
                    <span style="font-weight: 600;">${cat.name}</span>
                  </div>
                  <span style="font-weight: 700; color: var(--text-main);">${cat.percentage}%</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
              <div style="font-weight: 600;">No spending records yet</div>
              <div style="font-size: 0.8125rem; margin-top: 0.25rem;">Log an expense to see your category breakdown</div>
            </div>
          `}
        </div>
      </div>

      <!-- Lower Content Row: Recent Transactions & Savings Progress -->
      <div class="grid-2">
        <!-- Recent Transactions -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h2 class="heading-md">Recent Transactions</h2>
              <p class="text-muted" style="font-size: 0.8125rem;">Your latest financial activity</p>
            </div>
            <a href="#" style="font-size: 0.8125rem; font-weight: 700;" onclick="window.navigateTo('expenses'); return false;">View All &gt;</a>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${safeTx.length > 0 ? safeTx.slice(0, 5).map(tx => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color);">
                <div class="merchant-cell">
                  <div class="merchant-icon">
                    ${tx.type === 'income' ? '📈' : '💳'}
                  </div>
                  <div>
                    <div class="merchant-name">${tx.merchant || tx.source}</div>
                    <div class="merchant-sub">${tx.category} • ${tx.date}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700; font-size: 0.9375rem; color: ${tx.type === 'income' ? 'var(--success)' : 'var(--text-main)'};">
                    ${tx.type === 'income' ? '+' : '-'}$${(tx.amount || 0).toFixed(2)}
                  </div>
                  <span class="badge ${tx.status === 'Completed' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.7rem;">${tx.status}</span>
                </div>
              </div>
            `).join('') : `
              <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
                <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">📝</div>
                <div style="font-weight: 600;">No recent transactions</div>
                <div style="font-size: 0.8125rem; margin-top: 0.25rem;">Click "+ Add Transaction" to record your first expense or income</div>
              </div>
            `}
          </div>
        </div>

        <!-- Savings Progress & Investment Insight -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <div>
                <h2 class="heading-md">Savings Goals</h2>
                <p class="text-muted" style="font-size: 0.8125rem;">Track your financial milestones</p>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('modal-add-goal').classList.add('active')">
                + New Goal
              </button>
            </div>

            ${safeGoals.length > 0 ? safeGoals.slice(0, 2).map(goal => `
              <div style="margin-bottom: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.375rem;">
                  <span style="font-weight: 700; font-size: 0.875rem;">🎯 ${goal.title}</span>
                  <span style="font-weight: 800; font-size: 0.875rem; color: var(--primary);">${goal.progress}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${goal.progress}%; background: var(--primary);"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">
                  <span>$${goal.current.toLocaleString()} SAVED</span>
                  <span>GOAL: $${goal.target.toLocaleString()}</span>
                </div>
              </div>
            `).join('') : `
              <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
                <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">🎯</div>
                <div style="font-weight: 600;">No savings goals set</div>
                <div style="font-size: 0.8125rem; margin-top: 0.25rem;">Click "+ New Goal" to start saving for your future</div>
              </div>
            `}
          </div>

          <!-- Blue Investment Insight Banner -->
          <div class="banner-blue">
            <h3 class="heading-md" style="color: white; margin-bottom: 0.5rem;">Financial Intelligence</h3>
            <p style="margin-bottom: 1.25rem;">
              Connect your account to receive automated AI spending insights and budget alerts.
            </p>
            <button class="btn btn-secondary btn-sm" style="background: rgba(255,255,255,0.2); color: white; border: none;" onclick="window.navigateTo('budget')">
              Open Budget Planner
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};
