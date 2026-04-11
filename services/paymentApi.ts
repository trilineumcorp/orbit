import { apiService } from './api';

export async function getSubscriptionPlans() {
  const res = await apiService.get<unknown[]>('/payment/plans', true);
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function getUserSubscription() {
  const res = await apiService.get<unknown>('/payment/subscriptions', true);
  return res.success ? res.data : null;
}

export async function getPaymentHistory() {
  const res = await apiService.get<unknown>('/payment/payments/history', true);
  return res.success ? res.data : null;
}
