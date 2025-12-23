import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, API_ENDPOINTS } from '../config/api';

export default function Checkout() {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('El carrito está vacío.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        user: user?.id,
        products: cart.map(({ product, quantity }) => ({
          product: product._id,
          quantity
        })),
        total: getTotal(),
        paymentMethod: 'efectivo'
      };

      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.msg?.includes('Verifica los datos')) {
          setError('No se pudo crear la reserva. Verifica los datos e intenta nuevamente.');
        } else {
          setError(data.msg || 'Ocurrió un error inesperado al crear la reserva. Intenta nuevamente o contacta soporte.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      clearCart();
      setLoading(false);
    } catch {
      setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in-scale">
          <div className="flex justify-center mb-4">
            <span className="inline-block bg-green-100 text-green-600 rounded-full p-4 animate-bounce-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-green-700">
            ¡Reserva realizada con éxito!
          </h1>
          <p className="mb-8 text-gray-700">
            Gracias por tu reserva. Te avisaremos cuando tus libros estén listos para retirar.
          </p>
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold shadow transition"
            onClick={() => navigate('/')}
          >
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Finalizar reserva</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Resumen de la reserva</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 mb-4">
              {cart.map(({ product, quantity }) => (
                <li key={product._id} className="py-2 flex items-center gap-4">
                  {product.image && (
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-14 h-20 object-cover rounded border"
                    />
                  )}
                  <div className="flex-1">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-900 ml-2">x{quantity}</span>
                  </div>
                  <span className="font-bold">${product.price * quantity}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total:</span>
              <span>${getTotal()}</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Datos del usuario</h2>
        <div className="mb-2">
          <span className="font-medium">Nombre:</span> {user?.nombre}
        </div>
        <div className="mb-2">
          <span className="font-medium">Email:</span> {user?.email}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">Información de pago</h2>
        <div className="text-blue-700">
          <p className="mb-2">
            💰 <strong>El pago se realiza al retirar los libros</strong>
          </p>
          <p className="mb-2">✅ Aceptamos todos los métodos de pago:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Efectivo</li>
            <li>Tarjeta de débito/crédito</li>
            <li>Transferencia bancaria</li>
            <li>Mercado Pago</li>
          </ul>
          <p className="mt-3 text-sm">
            Te contactaremos via mail cuando tus libros estén listos para retirar.
          </p>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full text-lg font-semibold disabled:opacity-60"
        onClick={handleSubmit}
        disabled={cart.length === 0 || loading}
      >
        {loading ? 'Procesando...' : 'Confirmar reserva'}
      </button>
    </div>
  );
}

