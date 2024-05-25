import axios from 'axios';
import config from '../../config.js';

const apiBaseUrl = config.target;

const apiService = {
    get: async (endpoint, params = {}) => {
        try {
            const response = await axios.get(`${apiBaseUrl}${endpoint}`, { params });
            return response.data;
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    },

    post: async (endpoint, data) => {
        try {
            const response = await axios.post(`${apiBaseUrl}${endpoint}`, data);
            return response.data;
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    },

    put: async (endpoint, data) => {
        try {
            const response = await axios.put(`${apiBaseUrl}${endpoint}`, data);
            return response.data;
        } catch (error) {
            console.error('PUT request failed:', error);
            throw error;
        }
    },

    delete: async (endpoint) => {
        try {
            const response = await axios.delete(`${apiBaseUrl}${endpoint}`);
            return response.data;
        } catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }
};

export default apiService;
