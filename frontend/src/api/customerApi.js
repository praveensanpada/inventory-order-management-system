import api from './client';

export const getCustomers = () => api.get('/customers');
export const createCustomer = (payload) => api.post('/customers', payload);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
