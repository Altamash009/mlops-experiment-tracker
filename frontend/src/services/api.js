import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  timeout: 10000,
});

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mlops_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// ─── AUTH ────────────────────────────────────────────
export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

// ─── PROJECTS ────────────────────────────────────────
export const getProjects = async () => {
  const res = await api.get('/projects');
  return res.data;
};

export const createProject = async (data) => {
  const res = await api.post('/projects/create', data);
  return res.data;
};

export const updateProject = async (id, data) => {
  const res = await api.put(`/projects/${id}`, data);
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
};

// ─── DASHBOARD ───────────────────────────────────────
export const getDashboardSummary = async (projectId) => {
  const res = await api.get('/dashboard/summary', { params: { project_id: projectId } });
  return res.data;
};

export const getRecentRuns = async (projectId) => {
  const res = await api.get('/dashboard/recent-runs', { params: { project_id: projectId } });
  return res.data;
};

export const getDashboardAnalytics = async (projectId) => {
  const res = await api.get('/dashboard/analytics', { params: { project_id: projectId } });
  return res.data;
};

// ─── RUNS ────────────────────────────────────────────
export const getProjectRuns = async (projectId) => {
  const res = await api.get(`/runs/project/${projectId}`);
  return res.data;
};

export const getRunDetails = async (runId) => {
  const res = await api.get(`/runs/${runId}`);
  return res.data;
};

export const compareRuns = async (runIds) => {
  const res = await api.post('/runs/compare', { run_ids: runIds });
  return res.data;
};

export const getBestRun = async (projectId, metric = 'accuracy') => {
  const res = await api.get(`/runs/project/${projectId}/best`, { params: { metric } });
  return res.data;
};

// ─── METRICS ─────────────────────────────────────────
export const getRunMetrics = async (runId) => {
  const res = await api.get(`/metrics/run/${runId}`);
  return res.data;
};

// ─── ARTIFACTS ───────────────────────────────────────
export const getRunArtifacts = async (runId) => {
  const res = await api.get(`/artifacts/run/${runId}`);
  return res.data;
};

export const downloadArtifact = async (artifactId) => {
  const res = await api.get(`/artifacts/download/${artifactId}`);
  return res.data;
};

export const deleteArtifact = async (artifactId) => {
  const res = await api.delete(`/artifacts/${artifactId}`);
  return res.data;
};;

// ─── MODEL REGISTRY ───────────────────────────────────
export const getProjectModels = async (projectId) => {
  const res = await api.get(`/registry/project/${projectId}`);
  return res.data;
};

export const promoteModel = async (modelId) => {
  const res = await api.post(`/registry/${modelId}/promote`);
  return res.data;
};

export const rollbackModel = async (modelId) => {
  const res = await api.post(`/registry/${modelId}/rollback`);
  return res.data;
};

export const getModelHistory = async (projectId, modelName) => {
  const res = await api.get(`/registry/project/${projectId}/history/${modelName}`);
  return res.data;
};

export const getModelLeaderboard = async (projectId, modelName, metric = 'accuracy', top = 5) => {
  const res = await api.get(`/registry/project/${projectId}/leaderboard/${modelName}`, {
    params: { metric, top }
  });
  return res.data;
};