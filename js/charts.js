/* ==========================================================================
   FINANCEFLOW - CHARTS ENGINE (Canvas 2D / Chart.js wrapper)
   ========================================================================== */

const FinanceCharts = {
  instances: {},

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  // 1. Dashboard Overview - Cash Flow Analysis (Line & Area)
  renderCashFlowChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const ctx = canvas.getContext('2d');
    const data = FinanceData.cashFlowMonthly;

    const incomeGrad = ctx.createLinearGradient(0, 0, 0, 300);
    incomeGrad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    incomeGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    const expenseGrad = ctx.createLinearGradient(0, 0, 0, 300);
    expenseGrad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
    expenseGrad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Income',
            data: data.income,
            borderColor: '#10b981',
            borderWidth: 3,
            backgroundColor: incomeGrad,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981'
          },
          {
            label: 'Expenses',
            data: data.expenses,
            borderColor: '#2563eb',
            borderWidth: 3,
            backgroundColor: expenseGrad,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#2563eb'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 12 },
              callback: (val) => formatCurrency(val, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
            }
          }
        }
      }
    });
  },

  // 2. Spending by Category (Donut)
  renderDonutChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const ctx = canvas.getContext('2d');
    const categories = FinanceData.spendingByCategory;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories.map(c => c.name),
        datasets: [{
          data: categories.map(c => c.percentage),
          backgroundColor: categories.map(c => c.color),
          borderWidth: 4,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw}% (${formatCurrency(categories[ctx.dataIndex].amount)})`
            }
          }
        }
      }
    });
  },

  // 3. Cumulative Spending Chart
  renderCumulativeChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const ctx = canvas.getContext('2d');
    const cum = FinanceData.budgetPlanner.cumulativeSpending;

    const grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: cum.labels,
        datasets: [
          {
            label: 'Actual Spent',
            data: cum.spent,
            borderColor: '#2563eb',
            borderWidth: 3,
            backgroundColor: grad,
            fill: true,
            tension: 0.4,
            pointRadius: 4
          },
          {
            label: 'Budget Limit',
            data: cum.budgetLimit,
            borderColor: '#cbd5e1',
            borderWidth: 2,
            borderDash: [6, 6],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', callback: v => formatCurrency(v, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) } }
        }
      }
    });
  },

  // 4. Financial Intelligence / Analytics Cash Flow Trends (Combined Bar & Area)
  renderAnalyticsChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const ctx = canvas.getContext('2d');
    const trend = FinanceData.analytics.cashFlowTrends;

    const incomeGrad = ctx.createLinearGradient(0, 0, 0, 300);
    incomeGrad.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
    incomeGrad.addColorStop(1, 'rgba(37, 99, 235, 0.05)');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: trend.months,
        datasets: [
          {
            type: 'bar',
            label: 'Expenses',
            data: trend.expenses,
            backgroundColor: '#cbd5e1',
            borderRadius: 6,
            barThickness: 24
          },
          {
            type: 'line',
            label: 'Income',
            data: trend.income,
            borderColor: '#2563eb',
            borderWidth: 3,
            backgroundColor: incomeGrad,
            fill: true,
            tension: 0.4
          },
          {
            type: 'line',
            label: 'Savings',
            data: trend.savings,
            borderColor: '#10b981',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: '#10b981',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', callback: v => formatCurrency(v, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) } }
        }
      }
    });
  }
};

window.FinanceCharts = FinanceCharts;
