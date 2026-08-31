/* ==========================================================================
   EXPENSE MANAGEMENT VIEW WITH REAL DATABASE DATA & EMPTY STATES
   ========================================================================== */

import { addTransaction } from '../mockData.js';

export const renderExpensesView = (store) => {
  const transactions = store.transactions || [];

  const expenseItems = transactions.filter(t => t.type === 'expense');
  const totalSpend = expenseItems.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const avgSpend = expenseItems.length > 0 ? (totalSpend / expenseItems.length) : 0;

  // Compute top category dynamically
  const catTotals = {};
  expenseItems.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + parseFloat(t.amount);
  });
  let topCategory = 'None';
  let topCatMax = 0;
  Object.keys(catTotals).forEach(cat => {
    if (catTotals[cat] > topCatMax) {
      topCatMax = catTotals[cat];
      topCategory = cat;
    }
  });

  const recurringTotal = expenseItems
    .filter(t => t.flag === 'Recurring')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];

  return `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="heading-lg">Expense Management</h1>
          <p>Track, categorize, and manage your spending in real time.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.exportCSV()">
            📥 Export CSV
          </button>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('merchant-input').focus()">
            + New Entry
          </button>
        </div>
      </div>

      <!-- Stat Cards Grid -->
      <div class="stats-grid">
        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">💳</div>
            <span class="badge badge-primary">Total</span>
          </div>
          <span class="stat-title">TOTAL MONTHLY SPEND</span>
          <span class="stat-value">$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">🕒</div>
            <span class="badge badge-success">Average</span>
          </div>
          <span class="stat-title">AVERAGE PER TRANSACTION</span>
          <span class="stat-value">$${avgSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">🛒</div>
            <span class="badge badge-success">Top</span>
          </div>
          <span class="stat-title">LARGEST CATEGORY</span>
          <span class="stat-value" style="font-size: 1.5rem;">${topCategory}</span>
        </div>

        <div class="card stat-card">
          <div class="stat-header">
            <div class="stat-icon">🔒</div>
            <span class="badge badge-neutral">Recurring</span>
          </div>
          <span class="stat-title">RECURRING EXPENSES</span>
          <span class="stat-value">$${recurringTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <!-- Grid 2 Row: Log New Expense & Transactions Table -->
      <div class="grid-2">
        <!-- Log New Expense Form -->
        <div class="card">
          <div style="margin-bottom: 1.25rem;">
            <h2 class="heading-md">+ Log New Expense</h2>
            <p class="text-muted" style="font-size: 0.8125rem;">Enter details to persist directly to your database.</p>
          </div>

          <form id="form-log-expense">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Merchant / Payee</label>
                <input type="text" class="form-input" id="merchant-input" placeholder="e.g. Starbucks" required />
              </div>
              <div class="form-group">
                <label class="form-label">Transaction Date</label>
                <input type="date" class="form-input" id="date-input" value="${todayStr}" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Amount ($)</label>
                <input type="number" step="0.01" class="form-input" id="amount-input" placeholder="0.00" required />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="category-input">
                  <option value="Groceries">Groceries</option>
                  <option value="Software">Software</option>
                  <option value="Dining">Dining</option>
                  <option value="Transport">Transport</option>
                  <option value="Utilities">Utilities</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes (Optional)</label>
              <input type="text" class="form-input" id="notes-input" placeholder="Brief description..." />
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary" style="flex: 1;">Save Expense</button>
              <button type="reset" class="btn btn-secondary">Clear</button>
            </div>
          </form>
        </div>

        <!-- Transactions Table -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h2 class="heading-md">Transactions History</h2>
              <p class="text-muted" style="font-size: 0.8125rem;">Detailed database records for your spending.</p>
            </div>
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input type="text" id="search-tx-input" placeholder="Find merchant..." />
            </div>
          </div>

          <div class="table-container">
            <table class="table" id="expenses-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TRANSACTION</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.length > 0 ? transactions.map(tx => `
                  <tr>
                    <td style="font-size: 0.8125rem; color: var(--text-muted); font-weight: 600;">
                      ${tx.date}<br><span style="font-size: 0.7rem;">${tx.id}</span>
                    </td>
                    <td>
                      <div class="merchant-cell">
                        <div class="merchant-icon">${tx.type === 'income' ? '📈' : '🛒'}</div>
                        <div>
                          <div class="merchant-name">${tx.merchant || tx.source}</div>
                          <div class="merchant-sub">${tx.note || 'No notes'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge badge-neutral">${tx.category}</span></td>
                    <td><span class="badge ${tx.status === 'Completed' ? 'badge-success' : 'badge-warning'}">• ${tx.status}</span></td>
                    <td style="font-weight: 700; color: ${tx.type === 'income' ? 'var(--success)' : 'var(--text-main)'}">
                      ${tx.type === 'income' ? '+' : '-'}$${(tx.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                      <div style="font-size: 2rem; margin-bottom: 0.5rem;">📝</div>
                      <div style="font-weight: 600;">No transactions recorded yet</div>
                      <div style="font-size: 0.8125rem; margin-top: 0.25rem;">Use the form on the left to add your first expense record!</div>
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <!-- Table Footer -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; font-size: 0.8125rem; color: var(--text-muted);">
            <span>Showing ${transactions.length} record(s)</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const bindExpensesEvents = (refreshView) => {
  const form = document.getElementById('form-log-expense');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const merchant = document.getElementById('merchant-input').value;
      const date = document.getElementById('date-input').value;
      const amount = document.getElementById('amount-input').value;
      const category = document.getElementById('category-input').value;
      const note = document.getElementById('notes-input').value;

      await addTransaction({ merchant, date, amount, category, note });
      form.reset();
      if (refreshView) refreshView();
    });
  }

  const searchInp = document.getElementById('search-tx-input');
  if (searchInp) {
    searchInp.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#expenses-table tbody tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }
};
