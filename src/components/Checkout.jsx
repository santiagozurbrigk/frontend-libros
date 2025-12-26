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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 px-4 py-12">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center animate-fade-in-scale border-2 border-emerald-200">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              <span className="relative inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-6 animate-bounce-in">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ¡Reserva realizada con éxito!
          </h1>
          <button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 text-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => navigate('/seleccionar-categoria')}
          >
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-slate-800">Finalizar Reserva</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200">
          <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Resumen de la reserva
          </h2>
          {cart.length === 0 ? (
            <p className="text-slate-500">Tu carrito está vacío.</p>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {cart.map(({ product, quantity }) => (
                  <div key={product._id} className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
                    {product.image && (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-16 h-20 object-contain rounded-lg bg-white p-2"
                      />
                    )}
                    <div className="flex-1">
                      <span className="font-semibold text-slate-800">{product.name}</span>
                      <span className="text-slate-600 ml-2">x{quantity}</span>
                    </div>
                    <span className="font-bold text-lg text-slate-800">${(product.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200">
                <span className="text-lg font-semibold text-slate-600">Total:</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ${getTotal().toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200">
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
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información de pago
          </h2>
          <div className="text-blue-700 space-y-3">
            <p className="font-semibold text-lg">
              El pago se realiza al retirar los libros
            </p>
            <p className="font-medium">Aceptamos todos los métodos de pago:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Efectivo</li>
              <li>Tarjeta de débito/crédito</li>
              <li>Transferencia bancaria</li>
              <li>Mercado Pago</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-700">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <button
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={cart.length === 0 || loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirmar reserva
            </>
          )}
        </button>
      </div>
    </div>
  );
}

