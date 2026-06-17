import api from './client';

export const login = (payload) => api.post('/auth/login', payload);
export const refreshToken = (payload) => api.post('/auth/refresh', payload);
