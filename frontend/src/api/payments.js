// src/api/payments.js
import API from "./axiosConfig";

export const getPaymentsByLease = async (leaseId) => {
  const res = await API.get(`/payments/history/${leaseId}`);
  return res.data;
};

export const createPaymentIntent = async (leaseId, amount) => {
  const res = await API.post("/payments/create-intent", { leaseId, amount });
  return res.data; // { clientSecret, paymentId }
};
