import { api } from './api';
import { AnalyticsOverview } from '../types';

export async function fetchAnalyticsOverview() {
  const res = await api.get<{ success: true; data: AnalyticsOverview }>('/analytics/overview');
  return res.data.data;
}