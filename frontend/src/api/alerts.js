// src/api/alerts.js
import api from "./axiosConfig";

export const getManagerAlerts = async () => {
  const response = await api.get("/dashboard/manager-alerts");
  return response.data;
};

export const getTenantAlerts = async () => {
  const response = await api.get("/dashboard/tenant-alerts");
  return response.data;
};

export const getManagerStats = async () => {
  const response = await api.get("/dashboard/manager-stats");
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await api.get("/dashboard/recent-activity");
  return response.data;
};
