import axios from 'axios';
import { API_CONFIG } from '../config/web3';

// Create axios instances
const backendAPI = axios.create({
  baseURL: API_CONFIG.backend,
  headers: {
    'Content-Type': 'application/json',
  },
});

const aiAPI = axios.create({
  baseURL: API_CONFIG.ai,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Proposal APIs
export const proposalAPI = {
  getAll: async (params = {}) => {
    const { data } = await backendAPI.get('/api/proposals', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await backendAPI.get(`/api/proposals/${id}`);
    return data;
  },

  create: async (proposalData) => {
    const { data } = await backendAPI.post('/api/proposals', proposalData);
    return data;
  },

  updateStatus: async (id, blockchainProposalId) => {
    const { data } = await backendAPI.put(`/api/proposals/${id}/status`, {
      blockchainProposalId,
    });
    return data;
  },
};

// Vote APIs
export const voteAPI = {
  cast: async (voteData) => {
    const { data } = await backendAPI.post('/api/votes', voteData);
    return data;
  },
};

// AI Analysis APIs
export const aiAnalysisAPI = {
  request: async (proposalId, analysisType = 'Full') => {
    const { data } = await backendAPI.post('/api/aianalysis/request', {
      proposalId,
      analysisType,
    });
    return data;
  },

  save: async (analysisData) => {
    const { data } = await backendAPI.post('/api/aianalysis/save', analysisData);
    return data;
  },

  analyze: async (proposalData) => {
    const { data } = await aiAPI.post('/api/analyze', {
      proposal_id: proposalData.proposalId,
      title: proposalData.title,
      description: proposalData.description,
      proposal_type: proposalData.proposalType,
      requested_amount: proposalData.requestedAmount,
      submitter_address: proposalData.submitterAddress,
    });
    return data;
  },
};

// Treasury APIs
export const treasuryAPI = {
  getStatus: async () => {
    const { data } = await backendAPI.get('/api/treasury/status');
    return data;
  },
};

// Auth APIs
export const authAPI = {
  getMessage: async () => {
    const { data } = await backendAPI.get('/api/auth/message');
    return data;
  },

  login: async (walletAddress, signature, message) => {
    const { data } = await backendAPI.post('/api/auth/login', {
      walletAddress,
      signature,
      message,
    });
    return data;
  },
};

// Request interceptor for auth token
backendAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
backendAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default {
  proposal: proposalAPI,
  vote: voteAPI,
  aiAnalysis: aiAnalysisAPI,
  treasury: treasuryAPI,
  auth: authAPI,
};

