/* ==========================================================================
   FINANCEFLOW REST API CLIENT SERVICE WITH DYNAMIC ENDPOINT RESOLUTION
   ========================================================================== */

class ApiService {
  constructor() {
    this.candidateUrls = this.computeCandidateUrls();
    this.primaryUrl = this.candidateUrls[0];
  }

  computeCandidateUrls() {
    const urls = [];
    if (typeof window !== 'undefined') {
      if (window.API_BASE_URL) {
        urls.push(window.API_BASE_URL);
      }
      if (window.ENV && window.ENV.API_URL) {
        urls.push(window.ENV.API_URL);
      }
      if (window.location && window.location.origin) {
        urls.push(`${window.location.origin}/api`);
      }
    }
    urls.push('http://localhost:5000/api');
    urls.push('http://localhost:3000/api');
    urls.push('http://127.0.0.1:3000/api');
    return Array.from(new Set(urls.filter(Boolean)));
  }

  getToken() {
    return localStorage.getItem('financeflow_jwt_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('financeflow_jwt_token', token);
    } else {
      localStorage.removeItem('financeflow_jwt_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    let lastError = null;

    // Try candidate URLs sequentially if network error occurs
    for (const baseUrl of this.candidateUrls) {
      const url = `${baseUrl}${endpoint}`;
      const config = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      };

      try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `API request failed with status ${response.status}`);
        }

        // Lock in working base URL
        this.primaryUrl = baseUrl;
        return data;
      } catch (err) {
        lastError = err;
        // If it's a server response error (not a network failure), don't retry other ports
        if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError')) {
          throw err;
        }
        console.warn(`[API Client] Port/URL ${baseUrl} unreachable. Trying next candidate...`);
      }
    }

    throw new Error(lastError ? lastError.message : 'Unable to connect to FinanceFlow API server');
  }

  // Auth Endpoints
  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.data && res.data.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async login(credentials) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.data && res.data.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // Dashboard Summary Endpoint
  async getDashboardSummary() {
    return await this.request('/dashboard/summary');
  }

  // Expenses Endpoints
  async getExpenses() {
    return await this.request('/expenses');
  }

  async createExpense(expenseData) {
    return await this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  }

  async deleteExpense(id) {
    return await this.request(`/expenses/${id}`, {
      method: 'DELETE'
    });
  }

  // Budgets & Categories Endpoints
  async getBudgetCategories() {
    return await this.request('/budgets/categories');
  }

  async createBudgetCategory(categoryData) {
    return await this.request('/budgets/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  // Savings Goals Endpoints
  async getSavingsGoals() {
    return await this.request('/goals');
  }

  async createSavingsGoal(goalData) {
    return await this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });
  }
}

const api = new ApiService();
if (typeof window !== 'undefined') {
  window.ApiService = ApiService;
  window.api = api;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiService, api };
}

