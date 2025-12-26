// Configuración de la API
// En Vite, las variables de entorno deben empezar con VITE_
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-libros-ox7x.onrender.com';

export const getImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/uploads/')) return `${API_BASE_URL}${image}`;
  return image;
};

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_BASE_URL}/api/usuarios/login`,
  REGISTER: `${API_BASE_URL}/api/usuarios/register`,
  
  // Productos
  PRODUCTS: `${API_BASE_URL}/api/productos`,
  PRODUCTS_ADMIN: `${API_BASE_URL}/api/productos/admin`, // Todos los productos sin límite para admin
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/api/productos/${id}`,
  PRODUCTS_BY_CATEGORY: (categoria, page = 1, limit = 12, search = '') => {
    const params = new URLSearchParams({
      category: categoria,
      page: page.toString(),
      limit: limit.toString()
    });
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    return `${API_BASE_URL}/api/productos?${params.toString()}`;
  },
  
  // Pedidos
  ORDERS: `${API_BASE_URL}/api/pedidos`,
  USER_ORDERS: `${API_BASE_URL}/api/pedidos/mis-pedidos`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/api/pedidos/${id}`,
  ORDER_UPDATE_STATUS: (id) => `${API_BASE_URL}/api/pedidos/${id}/status`, // Actualizar estado del pedido
  ORDER_STATS: `${API_BASE_URL}/api/pedidos/estadisticas`,
  MONTHLY_SALES: `${API_BASE_URL}/api/pedidos/dashboard/ventas-mes`,
  TOP_PRODUCTS: `${API_BASE_URL}/api/pedidos/dashboard/top-productos`,
  
  // Usuarios
  USERS: `${API_BASE_URL}/api/usuarios`,
  USER_ORDERS_BY_USER_ID: (userId) => `${API_BASE_URL}/api/pedidos?userId=${userId}`,
};

export default API_BASE_URL;

