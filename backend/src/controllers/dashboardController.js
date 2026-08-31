import * as dashboardService from '../services/dashboardService.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary(req.user.id);
    return sendSuccess(res, 'Dashboard summary metrics computed successfully', summary);
  } catch (err) {
    next(err);
  }
};
