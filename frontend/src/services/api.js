import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:5000",
    timeout: 5000,
});

export default api;

// Dashboard Endpoints
export const getDashboardSummary = async () => {

    const response = await api.get("/dashboard/summary");

    return response.data;

};

export const getRecentRuns = async () => {

    const response = await api.get("/dashboard/recent-runs");

    return response.data;

};

export const getDashboardAnalytics = async () => {

    const response = await api.get("/dashboard/analytics");

    return response.data;

};