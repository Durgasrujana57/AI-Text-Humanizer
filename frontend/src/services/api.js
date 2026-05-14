import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5227/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const textService = {
  // Detect AI text
  detectAI: async (text) => {
    return api.post('/TextAnalysis/detect', { text });
  },

  // Humanize text
  humanizeText: async (text, tone = 'casual') => {
    return api.post('/TextAnalysis/humanize', { text, tone });
  },

  // Get history
  getHistory: async (page = 1, pageSize = 10) => {
    return api.get(`/TextAnalysis/history?page=${page}&pageSize=${pageSize}`);
  },

  // Get single history item
  getHistoryItem: async (id) => {
    return api.get(`/TextAnalysis/history/${id}`);
  },

  // Delete history item
  deleteHistoryItem: async (id) => {
    return api.delete(`/TextAnalysis/history/${id}`);
  },

  // Clear all history
  clearHistory: async () => {
    return api.delete('/TextAnalysis/history');
  },

  // Test connection
  testConnection: async () => {
    return api.get('/TextAnalysis/test');
  }
};