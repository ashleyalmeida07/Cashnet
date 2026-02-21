const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/* === SIMULATION API === */
export const simulationApi = {
  startSimulation: () => apiRequest('/api/simulation/start', { method: 'POST' }),
  getStatus: () => apiRequest('/api/simulation/status'),
  pause: () => apiRequest('/api/simulation/pause', { method: 'POST' }),
  resume: () => apiRequest('/api/simulation/resume', { method: 'POST' }),
  stop: () => apiRequest('/api/simulation/stop', { method: 'POST' }),
};

/* === AGENT API === */
export const agentApi = {
  listAgents: () => apiRequest('/api/agents'),
  getAgent: (id: string) => apiRequest(`/api/agents/${id}`),
  updateAgent: (id: string, data: any) =>
    apiRequest(`/api/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getActivityFeed: () => apiRequest('/api/agents/activity-feed'),
};

/* === LIQUIDITY API === */
export const liquidityApi = {
  getPoolData: () => apiRequest('/api/liquidity/pool'),
  getDepthChart: () => apiRequest('/api/liquidity/depth-chart'),
  getSlippageCurve: () => apiRequest('/api/liquidity/slippage-curve'),
  getEventLog: () => apiRequest('/api/liquidity/events'),
};

/* === LENDING API === */
export const lendingApi = {
  getBorrowers: () => apiRequest('/api/lending/borrowers'),
  getMetrics: () => apiRequest('/api/lending/metrics'),
  getCascadeEvents: () => apiRequest('/api/lending/cascade-events'),
  triggerLiquidation: (borrowerId: string) =>
    apiRequest('/api/lending/liquidate', {
      method: 'POST',
      body: JSON.stringify({ borrowerId }),
    }),
};

/* === THREAT API === */
export const threatApi = {
  getThreatScores: () => apiRequest('/api/threats/scores'),
  getAlerts: () => apiRequest('/api/threats/alerts'),
  resolveAlert: (alertId: string) =>
    apiRequest(`/api/threats/alerts/${alertId}/resolve`, { method: 'POST' }),
  simulateAttack: (type: string, params: any) =>
    apiRequest('/api/threats/simulate', {
      method: 'POST',
      body: JSON.stringify({ type, params }),
    }),
};

/* === CREDIT API === */
export const creditApi = {
  getLeaderboard: () => apiRequest('/api/credit/leaderboard'),
  getScoreDetails: (wallet: string) =>
    apiRequest(`/api/credit/scores/${wallet}`),
  getScoreHistory: (wallet: string) =>
    apiRequest(`/api/credit/scores/${wallet}/history`),
  getDynamicRates: () => apiRequest('/api/credit/dynamic-rates'),
};

/* === AUDIT API === */
export const auditApi = {
  getLog: (filters?: any) =>
    apiRequest('/api/audit/log', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),
  verifyEvent: (eventId: string) =>
    apiRequest(`/api/audit/verify/${eventId}`, { method: 'POST' }),
  exportReport: (format: 'csv' | 'json' | 'pdf') =>
    apiRequest(`/api/audit/export?format=${format}`),
  compareSimulations: (sim1Id: string, sim2Id: string) =>
    apiRequest(`/api/audit/compare`, {
      method: 'POST',
      body: JSON.stringify({ sim1Id, sim2Id }),
    }),
};

/* === WALLET API === */
export const walletApi = {
  connect: () => apiRequest('/api/wallet/connect', { method: 'POST' }),
  disconnect: () => apiRequest('/api/wallet/disconnect', { method: 'POST' }),
  getBalance: (address: string) =>
    apiRequest(`/api/wallet/balance/${address}`),
};
