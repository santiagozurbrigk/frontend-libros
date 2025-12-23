import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getImageUrl, API_ENDPOINTS } from '../config/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(id));
        if (!response.ok) throw new Error('Error al cargar producto');
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Error al cargar producto');
      }
      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error || 'Producto no encontrado'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Volver
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {product.image && (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-auto object-contain rounded"
            />
          )}

          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="mb-4">
              <p className="text-gray-500">Páginas: {product.pages}</p>
              <p className="text-gray-500 capitalize">Categoría: {product.category}</p>
            </div>
            <p className="text-green-600 font-bold text-3xl mb-6">${product.price}</p>
            <button
              onClick={() => {
                addToCart(product);
                navigate('/carrito');
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold transition"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

