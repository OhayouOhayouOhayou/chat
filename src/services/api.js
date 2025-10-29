import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://172.16.0.131:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== Auth APIs ====================
export const adminLogin = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    
    // Backend response structure:
    // { success: true, data: { token, user: { username, role } } }
    
    if (response.data.success && response.data.data) {
      return {
        token: response.data.data.token,
        username: response.data.data.user.username,
        role: response.data.data.user.role,
      };
    }
    
    throw new Error('Invalid response structure');
  } catch (error) {
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.message 
      || 'Login failed';
    
    console.error('Login error:', errorMessage);
    throw new Error(errorMessage);
  }
};

// ==================== Conversation APIs ====================
export const createConversation = async () => {
  try {
    const response = await api.post('/conversations', {
      userId: 'anonymous',
      metadata: {
        source: 'web',
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create conversation');
  }
};

export const sendMessage = async (conversationId, message) => {
  try {
    const response = await api.post('/chat', {
      conversationId,
      message,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

export const getConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch messages');
  }
};

// ==================== Knowledge APIs ====================
export const getKnowledge = async () => {
  try {
    const response = await api.get('/knowledge');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch knowledge');
  }
};

export const uploadKnowledgeFile = async (formData) => {
  try {
    const response = await api.post('/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to upload file');
  }
};

export const deleteKnowledge = async (id) => {
  try {
    const response = await api.delete(`/knowledge/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete knowledge');
  }
};

// ==================== Analytics APIs ====================
export const getAnalytics = async () => {
  try {
    const response = await api.get('/analytics/overview');
    return response.data.data;
  } catch (error) {
    console.error('Analytics error:', error);
    // Return default data if API fails
    return {
      totalMessages: 0,
      totalConversations: 0,
      avgResponseTime: 0,
      totalKnowledge: 0,
    };
  }
};

// ==================== Feedback API ====================
export const submitFeedback = async (conversationId, messageId, rating, comment) => {
  try {
    const response = await api.post('/feedback', {
      conversationId,
      messageId,
      rating,
      comment,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to submit feedback');
  }
};

export default api;