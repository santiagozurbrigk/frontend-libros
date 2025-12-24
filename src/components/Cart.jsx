import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getImageUrl } from '../config/api';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-24 h-24 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-slate-600 mb-6">Agrega productos para comenzar tu reserva</p>
          <Link 
            to="/seleccionar-categoria" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explorar catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-slate-800">Carrito de Reservas</h1>
        <p className="text-slate-600">Revisa tus productos antes de confirmar</p>
      </div>

      <div className="space-y-4 mb-8">
        {cart.map(({ product, quantity }) => (
          <div key={product._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-5 border-2 border-transparent hover:border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {product.image && (
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-24 h-32 object-contain rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-2"
                />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-slate-800 mb-1">{product.name}</h2>
                <p className="text-slate-500 text-sm mb-2">{product.pages} páginas</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                  ${product.price}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg">
                    <button
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-200 rounded-l-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      onClick={() => updateQuantity(product._id, quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-4 py-1.5 font-semibold text-slate-800 min-w-[3rem] text-center">{quantity}</span>
                    <button
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-200 rounded-r-lg transition-colors duration-200 font-semibold"
                      onClick={() => updateQuantity(product._id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 flex items-center gap-1"
                    onClick={() => removeFromCart(product._id)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-800">${(product.price * quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200">
        <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-slate-200">
          <button
            className="text-slate-600 hover:text-red-600 font-medium transition-colors duration-200 flex items-center gap-2"
            onClick={clearCart}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Vaciar carrito
          </button>
          <div className="text-right">
            <p className="text-sm text-slate-600 mb-1">Total</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ${getTotal().toFixed(2)}
            </p>
          </div>
        </div>

        <button
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 text-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          onClick={handleCheckout}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Continuar con la reserva
        </button>
      </div>
    </div>
  );
}

