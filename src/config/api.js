// Configuración de la API
// En Vite, las variables de entorno deben empezar con VITE_
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-libros-ox7x.onrender.com';

export const getImageUrl = (image) => {
  // Si la imagen está vacía o es null/undefined, retornar vacío
  if (!image || (typeof image === 'string' && image.trim() === '')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('getImageUrl: imagen vacía o undefined');
    }
    return '';
  }
  
  // Convertir a string por si acaso
  const imageStr = String(image).trim();
  
  // Si ya es una URL completa (http/https), devolverla tal cual
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    return imageStr;
  }
  
  // Si es una ruta relativa que empieza con /uploads/, construir la URL completa
  if (imageStr.startsWith('/uploads/')) {
    const fullUrl = `${API_BASE_URL}${imageStr}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('getImageUrl: construyendo URL desde /uploads/', { original: imageStr, fullUrl });
    }
    return fullUrl;
  }
  
  // Si es una ruta relativa sin /uploads/, intentar construir la URL
  if (imageStr.startsWith('uploads/')) {
    const fullUrl = `${API_BASE_URL}/${imageStr}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('getImageUrl: construyendo URL desde uploads/', { original: imageStr, fullUrl });
    }
    return fullUrl;
  }
  
  // Si no tiene protocolo y no empieza con uploads, intentar construir la URL completa
  // Esto maneja casos donde la imagen puede estar guardada solo con el nombre del archivo
  if (!imageStr.includes('://')) {
    // Si no tiene protocolo, asumir que es relativa y construir URL completa
    // Normalizar: quitar / inicial si existe, luego agregar /uploads/ si no lo tiene
    let normalizedPath = imageStr.startsWith('/') ? imageStr.slice(1) : imageStr;
    
    // Si no empieza con uploads/, agregarlo
    if (!normalizedPath.startsWith('uploads/')) {
      normalizedPath = `uploads/${normalizedPath}`;
    }
    
    const fullUrl = `${API_BASE_URL}/${normalizedPath}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('getImageUrl: normalizando y construyendo URL', { 
        original: imageStr, 
        normalized: normalizedPath, 
        fullUrl 
      });
    }
    return fullUrl;
  }
  
  // Si tiene protocolo pero no es http/https, devolver tal cual (puede ser data: o blob:)
  return imageStr;
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
  ORDER_BULK_UPDATE_STATUS: `${API_BASE_URL}/api/pedidos/bulk/status`, // Actualizar estado de múltiples pedidos
  ORDER_STATS: `${API_BASE_URL}/api/pedidos/estadisticas`,
  MONTHLY_SALES: `${API_BASE_URL}/api/pedidos/dashboard/ventas-mes`,
  TOP_PRODUCTS: `${API_BASE_URL}/api/pedidos/dashboard/top-productos`,
  
  // Usuarios
  USERS: `${API_BASE_URL}/api/usuarios`,
  USER_ORDERS_BY_USER_ID: (userId) => `${API_BASE_URL}/api/pedidos?userId=${userId}`,
};

export { API_BASE_URL };
export default API_BASE_URL;

