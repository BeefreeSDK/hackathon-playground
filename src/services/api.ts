import axios from 'axios';
import { 
  Template, 
  BrandStyles,
  TemplatesResponse,
  CategoriesResponse,
  CollectionsResponse,
  DesignersResponse,
  TagsResponse
} from '../types';

// API base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication
export const authAPI = {
  getToken: async (uid: string = 'demo-user') => {
    const response = await api.post('/bee-auth', { uid });
    return response.data;
  },
};

// Template Catalog API
export const templateCatalogAPI = {
  // Get templates with optional filters
  getTemplates: async (params?: {
    category?: string;
    collection?: string;
    designer?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }): Promise<TemplatesResponse> => {
    const response = await api.get('/templates', { params });
    return response.data;
  },

  // Get a specific template by ID
  getTemplate: async (id: string): Promise<Template> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // Get all categories
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get all collections
  getCollections: async (): Promise<CollectionsResponse> => {
    const response = await api.get('/collections');
    return response.data;
  },

  // Get all designers
  getDesigners: async (): Promise<DesignersResponse> => {
    const response = await api.get('/designers');
    return response.data;
  },

  // Get all tags
  getTags: async (): Promise<TagsResponse> => {
    const response = await api.get('/tags');
    return response.data;
  },
};

// Brand Style Management API
export const brandStylesAPI = {
  // Apply brand styles to a template
  applyBrandStyles: async (templateData: any, brandStyles: BrandStyles) => {
    const response = await api.post('/apply-brand-styles', {
      templateData,
      brandStyles,
    });
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.error || `HTTP ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred.';
  }
};

export default api;
