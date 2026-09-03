/* ==========================================================================
   FINANCEFLOW - DATA LAYER
   ========================================================================== */

const FinanceData = {
  user: {
    name: "Alex Morgan",
    email: "alex@financeflow.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    phone: "+1 (555) 000-1234",
    timezone: "Pacific Standard Time (PST)",
    plan: "Premium",
    nextBilling: "October 12, 2024"
  },

  dashboardStats: {
    totalBalance: 45231.89,
    balanceChange: 12.5,
    monthlyIncome: 7120.00,
    incomeChange: 8.2,
    monthlyExpense: 3845.12,
    expenseChange: -2.4,
    savingsRate: 46.0,
    savingsRateChange: 1.2
  },

  spendingByCategory: [
    { name: "Housing", percentage: 35, amount: 1345.79, color: "#2563eb" },
    { name: "Dining", percentage: 20, amount: 769.02, color: "#0d9488" },
    { name: "Transport", percentage: 15, amount: 576.77, color: "#60a5fa" },
    { name: "Savings", percentage: 20, amount: 769.02, color: "#4ade80" },
    { name: "Leisure", percentage: 10, amount: 384.51, color: "#fb923c" }
  ],

  cashFlowMonthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    income: [4500, 5200, 4800, 6100, 5900, 7100, 6800],
    expenses: [3100, 3400, 3700, 4200, 3900, 4500, 4100]
  },

  transactions: [
    {
      id: "TX-9021",
      date: "May 24",
      rawDate: "2026-05-24",
      merchant: "Whole Foods Market",
      description: "Weekly Grocery Shopping",
      category: "Groceries",
      status: "Completed",
      amount: -142.50,
      type: "Recurring",
      icon: "shopping-cart"
    },
    {
      id: "TX-9022",
      date: "May 23",
      rawDate: "2026-05-23",
      merchant: "Amazon Web Services",
      description: "Monthly Cloud Subscription",
      category: "Software",
      status: "Completed",
      amount: -29.00,
      type: "Recurring",
      icon: "cloud"
    },
    {
      id: "TX-9023",
      date: "May 22",
      rawDate: "2026-05-22",
      merchant: "The Daily Grind",
      description: "Team Lunch Meeting",
      category: "Dining",
      status: "Pending",
      amount: -85.20,
      type: "One-Time",
      icon: "coffee"
    },
    {
      id: "TX-9024",
      date: "May 21",
      rawDate: "2026-05-21",
      merchant: "Shell Station",
      description: "Fuel for Commute",
      category: "Transport",
      status: "Completed",
      amount: -60.00,
      type: "One-Time",
      icon: "car"
    },
    {
      id: "TX-9025",
      date: "May 20",
      rawDate: "2026-05-20",
      merchant: "Comcast Business",
      description: "Internet Service Provider",
      category: "Utilities",
      status: "Completed",
      amount: -79.99,
      type: "Recurring",
      icon: "wifi"
    }
  ],

  budgetPlanner: {
    activePeriod: "May 2024",
    totalBudget: 4200.00,
    totalSpent: 3515.20,
    remaining: 684.80,
    savingsGoalTarget: 2000.00,
    recommendation: "Based on last month's spending patterns, we recommend increasing your 'Transportation' budget by 10% and reducing 'Shopping' to hit your ₹2,000 savings goal.",
    cumulativeSpending: {
      labels: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"],
      spent: [300, 850, 1400, 2100, 2750, 3200, 3515],
      budgetLimit: [700, 1400, 2100, 2800, 3500, 3900, 4200]
    },
    alerts: [
      {
        type: "warning",
        title: "Budget Exceeded",
        message: "'Food & Dining' is ₹120 over the limit. Adjust other categories to compensate."
      },
      {
        type: "success",
        title: "Saving Opportunity",
        message: "Your 'Entertainment' spend is 40% lower than usual. Extra ₹120 could be moved to savings."
      }
    ]
  },

  analytics: {
    totalIncome: 5400.00,
    incomeChange: 12.5,
    totalExpenses: 3500.00,
    expenseChange: 8.2,
    netSavings: 1900.00,
    savingsChange: 24.1,
    savingsRate: 35.2,
    savingsRateChange: 4.3,
    cashFlowTrends: {
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      expenses: [2900, 3200, 3100, 3500, 3400, 3500],
      income: [4200, 4500, 4800, 5200, 5100, 5400],
      savings: [1300, 1300, 1700, 1700, 1700, 1900]
    },
    insights: [
      {
        type: "success",
        text: "Your savings rate increased by 5.2% this month compared to your 6-month average."
      },
      {
        type: "info",
        text: "Housing expenses are 15% higher than your set budget. Consider reviewing utilities."
      },
      {
        type: "neutral",
        text: "You are on track to reach your 'Home Downpayment' goal 2 months earlier than projected."
      }
    ]
  },

  savingsGoals: {
    heroTarget: "You're 72% closer to your 2024 targets!",
    heroDetail: "Based on your current spending patterns, you can reach your 'Emergency Fund' goal 2 months earlier by increasing your monthly transfer by ₹150.",
    totalSavings: 76250,
    totalSavingsChange: 12.5,
    monthlyContribution: 2400,
    monthlyContribChange: 200,
    goalsReached: 3,
    goalsList: [
      {
        id: "goal-1",
        name: "Emergency Fund",
        currentAmount: 15000,
        targetAmount: 20000,
        targetDate: "Dec 2024",
        category: "Safety Net",
        status: "In Progress"
      },
      {
        id: "goal-2",
        name: "Home Downpayment",
        currentAmount: 45000,
        targetAmount: 50000,
        targetDate: "Aug 2024",
        category: "Property",
        status: "In Progress"
      },
      {
        id: "goal-3",
        name: "New Car Fund",
        currentAmount: 12250,
        targetAmount: 15000,
        targetDate: "Oct 2024",
        category: "Vehicle",
        status: "In Progress"
      },
      {
        id: "goal-4",
        name: "Japan Vacation",
        currentAmount: 4000,
        targetAmount: 5000,
        targetDate: "Sep 2024",
        category: "Travel",
        status: "In Progress"
      }
    ]
  },

  connectedAccounts: [
    { bank: "Chase Bank", accountType: "Checking", status: "Verified" },
    { bank: "American Express", accountType: "Credit Card", status: "Verified" }
  ]
};

// Export to global scope
window.FinanceData = FinanceData;
