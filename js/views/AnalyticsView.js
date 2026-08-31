/* ==========================================================================
   FINANCIAL INTELLIGENCE / ANALYTICS VIEW WITH REAL DATABASE MATH
   ========================================================================== */

import { renderBarLineTrendChart, renderDonutChart } from '../components/SVGCharts.js';

export const renderAnalyticsView = (store) => {
  const { stats, monthlyTrend, spendingCategoryBreakdown } = store;

  const safeStats = stats || { totalBalance: 0, monthlyIncome: 0, monthlyExpense: 0, savingsRate: 0 };
  const netSavings = Math.max(0, safeStats.monthlyIncome - safeStats.monthlyExpense);
  const totalAnalyzed = (spendingCategoryBreakdown || []).reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return `
    <div class="page-container">
      <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary); letter-spacing: 0.05em; margin-bottom: 0.25rem;">
        ANALYTICS ENGINE
      </div>
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="heading-lg">Financial Intelligence</h1>
          <p>Deep-dive insights into your real spending habits and wealth accumulation.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.exportCSV()">📥 Export CSV</button>
        </div>
      </div>

      <!-- Stat Cards Grid -->
      <div class="stats-grid">
        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">📈</div>
            <span class="badge badge-success">Income</span>
          </div>
          <span class="stat-title">TOTAL INCOME</span>
          <span class="stat-value">$${(safeStats.monthlyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">📉</div>
            <span class="badge badge-danger">Expense</span>
          </div>
          <span class="stat-title">TOTAL EXPENSES</span>
          <span class="stat-value">$${(safeStats.monthlyExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">📊</div>
            <span class="badge badge-success">Net</span>
          </div>
          <span class="stat-title">NET SAVINGS</span>
          <span class="stat-value">$${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">⏱️</div>
            <span class="badge badge-success">Rate</span>
          </div>
          <span class="stat-title">SAVINGS RATE</span>
          <span class="stat-value">${safeStats.savingsRate || 0}%</span>
        </div>
      </div>

      <!-- Grid 2: Cash Flow Trends & Automated Insights -->
      <div class="grid-2">
        <!-- Cash Flow Trends Chart -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
              <h2 class="heading-md">Cash Flow Trends</h2>
              <p class="text-muted" style="font-size: 0.8125rem;">Monthly comparison of revenue vs expenditures</p>
            </div>
          </div>

          ${renderBarLineTrendChart(monthlyTrend || [])}

          <div style="display: flex; gap: 1.5rem; justify-content: center; margin-top: 1rem; font-size: 0.8125rem; font-weight: 600;">
            <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 12px; height: 12px; background: #cbd5e1; border-radius: 2px;"></span> Expenses</div>
            <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 12px; height: 12px; background: #3b82f6; border-radius: 2px;"></span> Income</div>
            <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 12px; height: 12px; background: #10b981; border-radius: 50%;"></span> Savings</div>
          </div>
        </div>

        <!-- Spending Allocation -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
              <h2 class="heading-md">Spending Allocation</h2>
              <p class="text-muted" style="font-size: 0.8125rem;">Distribution across primary categories</p>
            </div>
          </div>

          ${renderDonutChart(spendingCategoryBreakdown || [])}

          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; font-weight: 700;">
            <span>Total Analyzed</span>
            <span>$${totalAnalyzed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};
