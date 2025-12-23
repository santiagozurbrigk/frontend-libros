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
      <div className="max-w-3xl mx-auto py-10 px-4 min-h-screen">
        <div className="text-center text-gray-500">
          <p>Tu carrito está vacío.</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Carrito de reservas</h1>

      <div className="space-y-6">
        {cart.map(({ product, quantity }) => (
          <div key={product._id} className="flex items-center gap-4 bg-white rounded-lg shadow p-4">
            {product.image && (
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-20 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{product.name}</h2>
              <p className="text-gray-500 text-sm mb-1">{product.pages} páginas</p>
              <p className="text-green-600 font-bold">${product.price}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  className="px-2 py-1 bg-gray-200 rounded"
                  onClick={() => updateQuantity(product._id, quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-2">{quantity}</span>
                <button
                  className="px-2 py-1 bg-gray-200 rounded"
                  onClick={() => updateQuantity(product._id, quantity + 1)}
                >
                  +
                </button>
                <button
                  className="ml-4 text-red-500 hover:underline"
                  onClick={() => removeFromCart(product._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center mt-8">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            onClick={clearCart}
          >
            Vaciar carrito
          </button>
          <div className="text-xl font-bold">Total: ${getTotal()}</div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold"
            onClick={handleCheckout}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}

