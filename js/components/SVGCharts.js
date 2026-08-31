/* ==========================================================================
   INTERACTIVE SVG CHART COMPONENT RENDERERS WITH TOOLTIPS & HOVER EFFECTS
   ========================================================================== */

/**
 * Render Interactive Dual Line/Area Cash Flow Chart (Income vs Expense)
 */
export const renderCashFlowAreaChart = (data, filterTime = '6M') => {
  const width = 750;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = 8000;

  const getX = (i) => padding.left + (i * (chartW / (data.length - 1)));
  const getY = (val) => padding.top + chartH - ((val / maxVal) * chartH);

  // Generate Income Path (Green)
  const incomePoints = data.map((d, i) => `${getX(i)},${getY(d.income)}`).join(' L ');
  const incomeArea = `M ${padding.left},${padding.top + chartH} L ${incomePoints} L ${getX(data.length - 1)},${padding.top + chartH} Z`;

  // Generate Expense Path (Blue)
  const expensePoints = data.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(' L ');
  const expenseArea = `M ${padding.left},${padding.top + chartH} L ${expensePoints} L ${getX(data.length - 1)},${padding.top + chartH} Z`;

  return `
    <div style="position: relative; width: 100%;" class="chart-wrapper">
      <div id="chart-tooltip-el" class="chart-tooltip"></div>
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; overflow: visible;">
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2563eb" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines & Y-Axis Labels -->
        ${[0, 2000, 4000, 6000, 8000].map(val => {
          const y = getY(val);
          return `
            <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="4 4" stroke-width="1"/>
            <text x="${padding.left - 10}" y="${y + 4}" font-size="11" font-weight="600" fill="var(--text-muted)" text-anchor="end">$${val.toLocaleString()}</text>
          `;
        }).join('')}

        <!-- X-Axis Labels -->
        ${data.map((d, i) => `
          <text x="${getX(i)}" y="${height - 8}" font-size="11" font-weight="600" fill="var(--text-muted)" text-anchor="middle">${d.month}</text>
        `).join('')}

        <!-- Area Fills -->
        <path d="${incomeArea}" fill="url(#incomeGrad)"/>
        <path d="${expenseArea}" fill="url(#expenseGrad)"/>

        <!-- Lines -->
        <path d="M ${incomePoints}" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M ${expensePoints}" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round"/>

        <!-- Interactive Data Dots -->
        ${data.map((d, i) => `
          <circle cx="${getX(i)}" cy="${getY(d.income)}" r="6" fill="#ffffff" stroke="#10b981" stroke-width="3" 
            class="chart-dot-item" data-title="${d.month} Income" data-value="$${d.income.toLocaleString()}" style="cursor: pointer; transition: transform 0.2s;" />
          <circle cx="${getX(i)}" cy="${getY(d.expense)}" r="6" fill="#ffffff" stroke="#2563eb" stroke-width="3" 
            class="chart-dot-item" data-title="${d.month} Expense" data-value="$${d.expense.toLocaleString()}" style="cursor: pointer; transition: transform 0.2s;" />
        `).join('')}
      </svg>
    </div>
  `;
};

/**
 * Render Category Donut Chart with Dynamic Middle Info
 */
export const renderDonutChart = (categories) => {
  const size = 230;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  const total = categories.reduce((sum, c) => sum + c.amount, 0);

  const slices = categories.map(cat => {
    const dasharray = (cat.percentage / 100) * circumference;
    const dashoffset = -currentOffset;
    currentOffset += dasharray;

    return `
      <circle
        cx="${size / 2}" cy="${size / 2}" r="${radius}"
        fill="none"
        stroke="${cat.color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${dasharray} ${circumference}"
        stroke-dashoffset="${dashoffset}"
        class="donut-segment"
        data-name="${cat.name}"
        data-amount="$${cat.amount.toLocaleString()} (${cat.percentage}%)"
        style="transition: all 0.3s ease; cursor: pointer;"
      />
    `;
  }).join('');

  return `
    <div style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;" class="donut-wrapper">
      <svg viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); width: 100%; height: 100%;">
        ${slices}
      </svg>
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; text-align: center;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em;" id="donut-center-label">TOTAL SPENT</span>
        <span style="font-size: 1.35rem; font-weight: 800;" id="donut-center-value">$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  `;
};

/**
 * Render Circular SVG Progress Ring (Used in Savings Goals Cards)
 */
export const renderCircularProgress = (percentage, size = 130, color = '#2563eb') => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return `
    <div style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
      <svg viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); width: 100%; height: 100%;">
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="var(--secondary-bg)" stroke-width="${strokeWidth}" fill="none"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" fill="none"
          stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" style="transition: stroke-dashoffset 0.8s ease;"/>
      </svg>
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">${percentage}%</span>
      </div>
    </div>
  `;
};

/**
 * Render Multi-Bar + Line Trend Chart (Analytics View)
 */
export const renderBarLineTrendChart = (data) => {
  const width = 750;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = 8000;
  const getX = (i) => padding.left + (i * (chartW / (data.length - 1)));
  const getY = (val) => padding.top + chartH - ((val / maxVal) * chartH);

  const barWidth = 22;

  const savingsPoints = data.map((d, i) => `${getX(i)},${getY(d.savings)}`).join(' L ');

  return `
    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto;">
      <!-- Grid -->
      ${[0, 2000, 4000, 6000, 8000].map(val => `
        <line x1="${padding.left}" y1="${getY(val)}" x2="${width - padding.right}" y2="${getY(val)}" stroke="var(--border-color)" stroke-dasharray="3 3"/>
        <text x="${padding.left - 8}" y="${getY(val) + 4}" font-size="10" font-weight="600" fill="var(--text-muted)" text-anchor="end">$${val}</text>
      `).join('')}

      <!-- Bars -->
      ${data.map((d, i) => {
        const x = getX(i);
        const expH = (d.expense / maxVal) * chartH;
        const incH = (d.income / maxVal) * chartH;
        return `
          <rect x="${x - barWidth - 2}" y="${padding.top + chartH - expH}" width="${barWidth}" height="${expH}" fill="#cbd5e1" rx="4" class="chart-bar" data-title="${d.month} Expenses" data-value="$${d.expense}"/>
          <rect x="${x + 2}" y="${padding.top + chartH - incH}" width="${barWidth}" height="${incH}" fill="#3b82f6" rx="4" class="chart-bar" data-title="${d.month} Income" data-value="$${d.income}"/>
          <text x="${x}" y="${height - 10}" font-size="11" font-weight="600" fill="var(--text-muted)" text-anchor="middle">${d.month}</text>
        `;
      }).join('')}

      <!-- Savings Trend Line -->
      <path d="M ${savingsPoints}" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"/>
      ${data.map((d, i) => `
        <circle cx="${getX(i)}" cy="${getY(d.savings)}" r="5" fill="#10b981" stroke="#ffffff" stroke-width="2.5" class="chart-dot-item" data-title="${d.month} Savings" data-value="$${d.savings}"/>
      `).join('')}
    </svg>
  `;
};

/**
 * Bind Tooltip Interactions to SVG Charts
 */
export const bindChartInteractivity = () => {
  const tooltip = document.getElementById('chart-tooltip-el');

  document.querySelectorAll('.chart-dot-item, .chart-bar').forEach(item => {
    item.addEventListener('mouseenter', (e) => {
      item.style.transform = 'scale(1.4)';
      const title = item.getAttribute('data-title');
      const val = item.getAttribute('data-value');

      if (tooltip) {
        tooltip.innerHTML = `<strong>${title}</strong>: ${val}`;
        tooltip.style.opacity = '1';
        const rect = item.getBoundingClientRect();
        const parentRect = item.closest('.chart-wrapper').getBoundingClientRect();
        tooltip.style.left = `${rect.left - parentRect.left + 10}px`;
        tooltip.style.top = `${rect.top - parentRect.top - 30}px`;
      }
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'scale(1)';
      if (tooltip) tooltip.style.opacity = '0';
    });
  });

  document.querySelectorAll('.donut-segment').forEach(seg => {
    seg.addEventListener('mouseenter', () => {
      seg.style.strokeWidth = '34';
      const name = seg.getAttribute('data-name');
      const amt = seg.getAttribute('data-amount');
      const lbl = document.getElementById('donut-center-label');
      const val = document.getElementById('donut-center-value');
      if (lbl && val) {
        lbl.innerText = name.toUpperCase();
        val.innerText = amt;
      }
    });

    seg.addEventListener('mouseleave', () => {
      seg.style.strokeWidth = '28';
      const lbl = document.getElementById('donut-center-label');
      const val = document.getElementById('donut-center-value');
      if (lbl && val) {
        lbl.innerText = 'TOTAL SPENT';
        val.innerText = '$3,845.12';
      }
    });
  });
};
