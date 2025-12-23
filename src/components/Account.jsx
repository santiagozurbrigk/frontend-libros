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
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(API_ENDPOINTS.USER_ORDERS, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Error al obtener pedidos');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Error al obtener pedidos');
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mi Cuenta</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">Datos del usuario</h2>
          <div className="mb-1">
            <span className="font-medium">Nombre:</span> {user?.nombre}
          </div>
          <div className="mb-1">
            <span className="font-medium">Email:</span> {user?.email}
          </div>
          {user?.telefono && (
            <div className="mb-1">
              <span className="font-medium">Teléfono:</span> {user.telefono}
            </div>
          )}
          {user?.carrera && (
            <div className="mb-1">
              <span className="font-medium">Colegio:</span> {user.carrera}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Historial de pedidos</h2>
          {loading ? (
            <div className="text-gray-500">Cargando pedidos...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-500">No tienes pedidos realizados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 text-left">Fecha</th>
                    <th className="py-2 px-3 text-left">Estado</th>
                    <th className="py-2 px-3 text-left">Total</th>
                    <th className="py-2 px-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <>
                      <tr key={order._id} className="border-b">
                        <td className="py-2 px-3">
                          {new Date(order.createdAt).toLocaleString('es-AR')}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusClass(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold">${order.total}</td>
                        <td className="py-2 px-3">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => setExpandedOrder(expandedOrder === index ? null : index)}
                          >
                            {expandedOrder === index ? 'Ocultar' : 'Ver detalle'}
                          </button>
                        </td>
                      </tr>
                      {expandedOrder === index && (
                        <tr>
                          <td colSpan={4} className="bg-gray-50 p-4">
                            <div>
                              <h3 className="font-semibold mb-2">Productos:</h3>
                              <ul className="space-y-2">
                                {order.products.map((item) => (
                                  <li key={item.product._id} className="flex items-center gap-3">
                                    {item.product.image && (
                                      <img
                                        src={getImageUrl(item.product.image)}
                                        alt={item.product.name}
                                        className="w-12 h-16 object-cover rounded border"
                                      />
                                    )}
                                    <div>
                                      <div className="font-medium">{item.product.name}</div>
                                      <div className="text-gray-600 text-sm">
                                        Cantidad: {item.quantity}
                                      </div>
                                      <div className="text-green-700 font-bold text-sm">
                                        ${item.product.price}
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

