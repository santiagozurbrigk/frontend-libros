import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategory } from '../contexts/CategoryContext';
import { useCart } from '../contexts/CartContext';
import { getImageUrl, API_ENDPOINTS } from '../config/api';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Catalog() {
  const { categoria } = useParams();
  const { categoria: contextCategory } = useCategory();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCategory = categoria || contextCategory;
  const categoryName = selectedCategory === 'escolares' ? 'Libros Escolares' : 'Libros de Inglés';
  const categoryDescription =
    selectedCategory === 'escolares'
      ? 'Libros para estudiantes de primaria y secundaria'
      : 'Libros para aprender y practicar inglés';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(API_ENDPOINTS.PRODUCTS_BY_CATEGORY(selectedCategory));
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Error al cargar productos');
      }
      setLoading(false);
    };

    if (selectedCategory) {
      fetchProducts();
    }
  }, [selectedCategory]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/seleccionar-categoria')}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Volver a categorías
          </button>
          <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
          <p className="text-gray-600">{categoryDescription}</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md border rounded-lg px-4 py-2"
          />
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando productos...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-500">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
                {product.image && (
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-48 object-contain rounded mb-4"
                  />
                )}
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <p className="text-gray-500 text-sm mb-2">{product.pages} páginas</p>
                <p className="text-green-600 font-bold text-lg mb-4">${product.price}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Agregar al carrito
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

