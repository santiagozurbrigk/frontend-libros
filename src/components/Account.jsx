import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, API_ENDPOINTS } from '../config/api';

const getStatusClass = (status) => {
  switch (status) {
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'en proceso':
      return 'bg-blue-100 text-blue-800';
    case 'listo para retirar':
      return 'bg-green-100 text-green-800';
    case 'entregado':
      return 'bg-gray-200 text-gray-800';
    default:
      return '';
  }
};


export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null); // Almacenará el _id del pedido expandido

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No estás autenticado. Por favor, inicia sesión.');
          setLoading(false);
          return;
        }

        const response = await fetch(API_ENDPOINTS.USER_ORDERS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Manejar diferentes códigos de estado
        if (response.status === 401) {
          // Token inválido o expirado
          const errorData = await response.json().catch(() => ({ msg: 'Token inválido o expirado' }));
          setError(errorData.msg || 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          // Opcional: limpiar token y redirigir al login
          localStorage.removeItem('token');
          return;
        }

        if (!response.ok) {
          // Intentar obtener el mensaje de error del backend
          let errorMessage = 'Error al obtener pedidos';
          try {
            const errorData = await response.json();
            errorMessage = errorData.msg || errorData.message || errorMessage;
          } catch {
            // Si no se puede parsear el JSON, usar el mensaje por defecto
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        // Validar que data es un array
        if (Array.isArray(data)) {
          console.log('Pedidos recibidos:', data.length);
          // Log para debugging: verificar estructura de productos
          if (data.length > 0) {
            console.log('Ejemplo de pedido:', {
              _id: data[0]._id,
              orderNumber: data[0].orderNumber,
              productsCount: data[0].products?.length,
              firstProduct: data[0].products?.[0]
            });
          }
          setOrders(data);
        } else {
          console.error('Respuesta inesperada del servidor:', data);
          setOrders([]);
        }
      } catch (err) {
        console.error('Error al obtener pedidos:', err);
        setError(err.message || 'Error al obtener pedidos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-800">Mi Cuenta</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-slate-200">
          <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Datos del usuario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Nombre</p>
              <p className="font-semibold text-slate-800">{user?.nombre}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Email</p>
              <p className="font-semibold text-slate-800">{user?.email}</p>
            </div>
            {user?.telefono && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Teléfono</p>
                <p className="font-semibold text-slate-800">{user.telefono}</p>
              </div>
            )}
            {user?.carrera && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Colegio</p>
                <p className="font-semibold text-slate-800">{user.carrera}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200">
          <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Historial de pedidos
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-600">Cargando pedidos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-700">
              <p className="font-medium">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-600 text-lg">No tienes pedidos realizados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div key={order._id} className="border-2 border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-slate-500">#{order.orderNumber || order._id.slice(-4)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ${order.total}
                      </p>
                      <button
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50"
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      >
                        {expandedOrder === order._id ? (
                          <>
                            <span>Ocultar</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Ver detalle</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {expandedOrder === order._id && (
                    <div className="bg-white p-6 border-t-2 border-slate-200">
                      <h3 className="font-semibold mb-4 text-slate-800">Productos:</h3>
                      {order.products && order.products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {order.products
                            .filter((item) => item.product && item.product._id) // Filtrar productos eliminados
                            .map((item) => (
                              <div key={item.product._id || item.product} className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
                                {item.product.image && (
                                  <img
                                    src={getImageUrl(item.product.image)}
                                    alt={item.product.name || 'Producto'}
                                    className="w-16 h-20 object-contain rounded-lg bg-white p-2"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-800 mb-1">
                                    {item.product.name || 'Producto eliminado'}
                                  </div>
                                  <div className="text-sm text-slate-600 mb-1">
                                    Cantidad: {item.quantity}
                                  </div>
                                  <div className="text-emerald-600 font-bold">
                                    ${item.product.price || 0}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-slate-600 text-center py-4">No hay productos en este pedido.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

