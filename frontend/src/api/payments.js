// frontend/src/api/payments.js
import API from "./axiosConfig";

// Payments for the logged-in tenant
export const getMyPayments = async () => {
  const res = await API.get("/payments/mine");
  return res.data;
};

// Payments for the logged-in property manager (all leases)
export const getLandlordPayments = async () => {
  const res = await API.get("/payments/landlord");
  return res.data;
};

// Payments for a specific lease (optional, for detail view)
export const getLeasePayments = async (leaseId) => {
  const res = await API.get(`/payments/lease/${leaseId}`);
  return res.data;
};

// Mark a payment as paid (simulated)
export const payPayment = async (paymentId) => {
  const res = await API.post(`/payments/${paymentId}/pay`);
  return res.data;
};

// Create Stripe checkout session for a payment
export const createPaymentCheckout = async (paymentId) => {
  const res = await API.post(`/payments/${paymentId}/checkout`);
  return res.data;
};

// Trigger a manual sync on the backend to reconcile Stripe events
export const syncPayments = async () => {
  const res = await API.post(`/payments/sync`);
  return res.data;
};

// ---- Analytics endpoints ----

// KPI summary for manager dashboard
export const getLandlordPaymentSummary = async () => {
  const res = await API.get("/payments/landlord/summary");
  return res.data;
};

// Monthly chart data
export const getLandlordPaymentChart = async () => {
  const res = await API.get("/payments/landlord/chart");
  return res.data;
};
