import api from './client';

const normalizeProduct = (product) => ({
  ...product,
  stock_quantity: product.stock_quantity ?? product.quantity_in_stock ?? 0
});

const toBackendProduct = (payload) => ({
  name: payload.name,
  sku: payload.sku,
  price: Number(payload.price),
  quantity_in_stock: Number(payload.stock_quantity ?? payload.quantity_in_stock ?? 0)
});

const normalizeResponse = (response) => ({
  ...response,
  data: Array.isArray(response.data)
    ? response.data.map(normalizeProduct)
    : normalizeProduct(response.data)
});

export const getProducts = async () => normalizeResponse(await api.get('/products'));
export const createProduct = async (payload) => normalizeResponse(await api.post('/products', toBackendProduct(payload)));
export const updateProduct = async (id, payload) => normalizeResponse(await api.put(`/products/${id}`, toBackendProduct(payload)));
export const deleteProduct = (id) => api.delete(`/products/${id}`);
