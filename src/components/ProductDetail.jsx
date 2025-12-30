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
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      setImageError(false); // Reset image error when loading new product
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 flex items-center gap-2 transition-colors duration-200 hover:gap-3 group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 flex items-center justify-center">
              {(() => {
                const imageUrl = product.image ? getImageUrl(product.image) : '';
                
                if (!imageUrl || imageError) {
                  return (
                    <div className="w-full max-w-md h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                      <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  );
                }
                
                return (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full max-w-md h-auto object-contain rounded-lg"
                    onError={() => {
                      console.error('Error al cargar imagen en ProductDetail:', {
                        productName: product.name,
                        productId: product._id,
                        imageUrl: imageUrl,
                        originalImage: product.image
                      });
                      setImageError(true);
                    }}
                  />
                );
              })()}
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 capitalize">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">{product.name}</h1>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">{product.description}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Páginas</p>
                    <p className="text-lg font-semibold text-slate-800">{product.pages}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Categoría</p>
                    <p className="text-lg font-semibold text-slate-800 capitalize">{product.category}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-2">Precio</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ${product.price}
                </p>
              </div>

              <button
                onClick={() => {
                  addToCart(product);
                  navigate('/carrito');
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 text-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

