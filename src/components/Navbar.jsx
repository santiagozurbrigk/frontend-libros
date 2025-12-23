import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/seleccionar-categoria" className="text-xl font-bold">
              Re-Libros
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/seleccionar-categoria"
              className="hover:text-gray-300 transition"
            >
              Catálogo
            </Link>
            <Link
              to="/cuenta"
              className="hover:text-gray-300 transition"
            >
              Mi Cuenta
            </Link>
            <Link
              to="/carrito"
              className="relative hover:text-gray-300 transition"
            >
              Carrito
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={logout}
              className="hover:text-gray-300 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

