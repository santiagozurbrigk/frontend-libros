import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategory } from '../contexts/CategoryContext';
import { useCart } from '../contexts/CartContext';
import { getImageUrl, API_ENDPOINTS } from '../config/api';

export default function Catalog() {
  const { categoria } = useParams();
  const { categoria: contextCategory } = useCategory();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const productsPerPage = 12;
  const searchTimeoutRef = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

  const selectedCategory = categoria || contextCategory;
  const categoryName = selectedCategory === 'escolares' ? 'Libros Escolares' : 'Libros de Inglés';
  const categoryDescription =
    selectedCategory === 'escolares'
      ? 'Libros para estudiantes de primaria y secundaria'
      : 'Libros para aprender y practicar inglés';

  // Debounce del término de búsqueda (espera 500ms después de que el usuario deje de escribir)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Resetear a página 1 cuando cambia el término de búsqueda debounced
  useEffect(() => {
    if (currentPage !== 1 && debouncedSearchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        // Incluir el término de búsqueda en la petición al backend
        const url = API_ENDPOINTS.PRODUCTS_BY_CATEGORY(selectedCategory, currentPage, productsPerPage, debouncedSearchTerm);
        console.log('Buscando productos con URL:', url); // Debug log
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();
        // El backend devuelve { products, total }
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        const total = data.total || productsArray.length;
        setProducts(productsArray);
        setTotalProducts(total);
        setTotalPages(Math.ceil(total / productsPerPage));
      } catch (err) {
        setError(err.message || 'Error al cargar productos');
      }
      setLoading(false);
    };

    if (selectedCategory) {
      fetchProducts();
    }
  }, [selectedCategory, currentPage, debouncedSearchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
        {/* Botón Anterior */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentPage === 1
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-slate-200 hover:border-blue-300'
          }`}
        >
          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        {/* Primera página si no está visible */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 rounded-lg font-medium bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-slate-200 hover:border-blue-300 transition-all duration-200"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-2 text-slate-400">...</span>
            )}
          </>
        )}

        {/* Páginas visibles */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              page === currentPage
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-slate-200 hover:border-blue-300'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Última página si no está visible */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-slate-400">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 rounded-lg font-medium bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-slate-200 hover:border-blue-300 transition-all duration-200"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Botón Siguiente */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-slate-200 hover:border-blue-300'
          }`}
        >
          Siguiente
          <svg className="w-5 h-5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/seleccionar-categoria')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2 transition-colors duration-200 hover:gap-3 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a categorías
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-slate-800">{categoryName}</h1>
          <p className="text-lg text-slate-600">{categoryDescription}</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 placeholder:text-slate-400 transition-all duration-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-600 text-lg">Cargando productos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-700">
            <p className="font-medium">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-600 text-lg">
              {searchTerm ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'No hay productos disponibles.'}
            </p>
          </div>
        ) : (
          <>
            {/* Información de paginación */}
            {totalProducts > 0 && (
              <div className="mb-6 text-sm text-slate-600">
                {debouncedSearchTerm ? (
                  <>Mostrando {products.length} de {totalProducts} productos encontrados para "{debouncedSearchTerm}"</>
                ) : (
                  <>Mostrando {((currentPage - 1) * productsPerPage) + 1} - {Math.min(currentPage * productsPerPage, totalProducts)} de {totalProducts} productos</>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  onClick={() => navigate(`/producto/${product._id}`)}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-200 cursor-pointer hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                    {(() => {
                      const imageUrl = product.image ? getImageUrl(product.image) : '';
                      const hasError = imageErrors[product._id];
                      
                      // Debug logging solo en desarrollo
                      if (process.env.NODE_ENV === 'development') {
                        if (!imageUrl) {
                          console.warn('⚠️ Producto sin imagen:', {
                            productName: product.name,
                            productId: product._id,
                            originalImage: product.image
                          });
                        }
                      }
                      
                      if (!imageUrl || hasError) {
                        return (
                          <div className="w-full h-56 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        );
                      }
                      
                      return (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-56 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            if (process.env.NODE_ENV === 'development') {
                              const constructedUrl = getImageUrl(product.image);
                              console.error('❌ Error al cargar imagen del producto:', {
                                productName: product.name,
                                productId: product._id,
                                originalImage: product.image,
                                constructedUrl: constructedUrl
                              });
                            }
                            setImageErrors(prev => ({ ...prev, [product._id]: true }));
                          }}
                        />
                      );
                    })()}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
                      {product.pages} págs
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ${product.price}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Controles de paginación */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}

