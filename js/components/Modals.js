/* ==========================================================================
   MODAL DIALOGS & OVERLAYS
   ========================================================================== */

import { addBudgetCategory, addSavingsGoal } from '../mockData.js';

export const renderModals = () => {
  return `
    <!-- Add Budget Category Modal -->
    <div class="modal-overlay" id="modal-budget-category">
      <div class="modal">
        <div class="modal-header">
          <h3 class="heading-md">Create Budget Category</h3>
          <button class="icon-btn close-modal">&times;</button>
        </div>
        <form id="form-add-budget">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Category Name</label>
              <input type="text" class="form-input" id="budget-cat-name" placeholder="e.g. Subscriptions & Tools" required />
            </div>
            <div class="form-group">
              <label class="form-label">Monthly Limit ($)</label>
              <input type="number" class="form-input" id="budget-cat-limit" placeholder="e.g. 500" min="1" step="10" required />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary close-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Category</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Savings Goal Modal -->
    <div class="modal-overlay" id="modal-savings-goal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="heading-md">Create New Savings Goal</h3>
          <button class="icon-btn close-modal">&times;</button>
        </div>
        <form id="form-add-goal">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Goal Title</label>
              <input type="text" class="form-input" id="goal-title" placeholder="e.g. New Macbook Pro" required />
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-select" id="goal-category">
                <option value="TECHNOLOGY">Technology</option>
                <option value="TRAVEL">Travel</option>
                <option value="SECURITY">Security</option>
                <option value="PROPERTY">Property</option>
                <option value="AUTOMOBILE">Automobile</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Current Saved ($)</label>
                <input type="number" class="form-input" id="goal-current" placeholder="0" min="0" required />
              </div>
              <div class="form-group">
                <label class="form-label">Target Amount ($)</label>
                <input type="number" class="form-input" id="goal-target" placeholder="3000" min="10" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Target Deadline</label>
              <input type="date" class="form-input" id="goal-deadline" required />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary close-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Goal</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Receipt Sync Modal -->
    <div class="modal-overlay" id="modal-receipt-sync">
      <div class="modal">
        <div class="modal-header">
          <h3 class="heading-md">Automated Receipt Matching Sync</h3>
          <button class="icon-btn close-modal">&times;</button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 2rem;">
          <div style="width: 64px; height: 64px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 2rem;">
            ⚡
          </div>
          <h4 class="heading-md" style="margin-bottom: 0.5rem;">Connect Bank Account for Receipts</h4>
          <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 1.5rem;">
            FinanceFlow securely pairs with Plaid and Yodlee to fetch digital receipts directly from 12,000+ financial institutions.
          </p>
          <div class="card" style="text-align: left; background: var(--secondary-bg); margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.875rem; margin-bottom: 0.5rem;">
              <span>Chase Checking (*8842)</span>
              <span class="badge badge-success">Ready</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.875rem;">
              <span>Amex Gold Card (*1042)</span>
              <span class="badge badge-success">Ready</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary close-modal">Close</button>
          <button type="button" class="btn btn-primary" id="btn-enable-sync">Enable Real-Time Sync</button>
        </div>
      </div>
    </div>
  `;
};

export const bindModalEvents = (refreshView) => {
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal-overlay').classList.remove('active');
    });
  });

  const formBudget = document.getElementById('form-add-budget');
  if (formBudget) {
    formBudget.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('budget-cat-name').value;
      const limit = document.getElementById('budget-cat-limit').value;
      addBudgetCategory({ name, limit });
      document.getElementById('modal-budget-category').classList.remove('active');
      if (refreshView) refreshView();
    });
  }

  const formGoal = document.getElementById('form-add-goal');
  if (formGoal) {
    formGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('goal-title').value;
      const category = document.getElementById('goal-category').value;
      const current = document.getElementById('goal-current').value;
      const target = document.getElementById('goal-target').value;
      const deadline = document.getElementById('goal-deadline').value;
      addSavingsGoal({ title, category, current, target, deadline });
      document.getElementById('modal-savings-goal').classList.remove('active');
      if (refreshView) refreshView();
    });
  }

  const btnSync = document.getElementById('btn-enable-sync');
  if (btnSync) {
    btnSync.addEventListener('click', () => {
      alert('Receipt Sync enabled! Transactions will now auto-match digital receipts.');
      document.getElementById('modal-receipt-sync').classList.remove('active');
    });
  }
};
