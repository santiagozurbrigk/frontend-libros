import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getImageUrl, API_ENDPOINTS, API_BASE_URL } from '../config/api';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Dashboard states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState('');
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Productos states
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    pages: '',
    image: '',
    category: 'escolares'
  });
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productError, setProductError] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Pedidos states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [ordersLimit, setOrdersLimit] = useState(25);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const [scannerError, setScannerError] = useState('');
  const scannerInputRef = useRef(null);
  const [deletingOrder, setDeletingOrder] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [barcodeOrder, setBarcodeOrder] = useState(null);
  const [barcodeCanvas, setBarcodeCanvas] = useState(null);

  // Usuarios states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);

  // Cargar estadísticas del dashboard
  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadStats();
      loadMonthlySales();
      loadTopProducts();
    }
  }, [activeSection]);

  // Cargar productos
  useEffect(() => {
    if (activeSection === 'productos') {
      loadProducts();
    }
  }, [activeSection]);

  // Cargar pedidos
  useEffect(() => {
    if (activeSection === 'pedidos') {
      loadOrders();
    }
  }, [activeSection, ordersLimit, orderSearch]);

  // Cargar usuarios
  useEffect(() => {
    if (activeSection === 'usuarios') {
      loadUsers();
    }
  }, [activeSection, userSearch]);

  const loadStats = async () => {
    setLoadingStats(true);
    setErrorStats('');
    try {
      const response = await fetch(API_ENDPOINTS.ORDER_STATS);
      const data = await response.json();
      setStats(data);
    } catch {
      setErrorStats('Error al cargar estadísticas');
    }
    setLoadingStats(false);
  };

  const loadMonthlySales = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MONTHLY_SALES);
      const data = await response.json();
      setMonthlySales(data);
    } catch {}
  };

  const loadTopProducts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TOP_PRODUCTS);
      const data = await response.json();
      setTopProducts(data);
    } catch {}
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {}
    setLoadingProducts(false);
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    setOrderError('');
    try {
      const url = `${API_ENDPOINTS.ORDERS}?limit=${ordersLimit}${orderSearch ? `&search=${encodeURIComponent(orderSearch)}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrderError('Error al cargar pedidos');
    }
    setLoadingOrders(false);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    setUserError('');
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}?search=${encodeURIComponent(userSearch)}`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUserError('Error al cargar usuarios');
    }
    setLoadingUsers(false);
  };

  const handleProductChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
      setProductForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setProductForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductError('');

    const formData = new FormData();
    Object.keys(productForm).forEach((key) => {
      if (key === 'image' && productForm[key] instanceof File) {
        formData.append('image', productForm[key]);
      } else if (key !== 'image') {
        formData.append(key, productForm[key]);
      }
    });

    try {
      const url = editingProduct
        ? API_ENDPOINTS.PRODUCT_BY_ID(editingProduct._id)
        : API_ENDPOINTS.PRODUCTS;
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: editingProduct ? { 'Content-Type': 'application/json' } : {},
        body: editingProduct ? JSON.stringify(productForm) : formData
      });

      if (response.ok) {
        loadProducts();
        setProductForm({
          name: '',
          description: '',
          price: '',
          pages: '',
          image: '',
          category: 'escolares'
        });
        setProductImagePreview(null);
        setEditingProduct(null);
      } else {
        const data = await response.json();
        setProductError(data.msg || 'Error al guardar producto');
      }
    } catch {
      setProductError('Error al guardar producto');
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      pages: product.pages,
      image: product.image,
      category: product.category
    });
    setProductImagePreview(null);
  };

  const deleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(productId), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        loadProducts();
      }
    } catch {}
  };

  const handleOrderStatusChange = async () => {
    if (!selectedOrder || !orderStatus) return;
    setSavingStatus(true);
    setStatusError('');
    try {
      const response = await fetch(API_ENDPOINTS.ORDER_BY_ID(selectedOrder._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: orderStatus })
      });
      if (response.ok) {
        loadOrders();
        setSelectedOrder(null);
        setOrderStatus('');
      } else {
        const data = await response.json();
        setStatusError(data.msg || 'Error al actualizar estado');
      }
    } catch {
      setStatusError('Error al actualizar estado');
    }
    setSavingStatus(false);
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
    setDeletingOrder((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await fetch(API_ENDPOINTS.ORDER_BY_ID(orderId), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        loadOrders();
      }
    } catch {}
    setDeletingOrder((prev) => ({ ...prev, [orderId]: false }));
  };

  const viewUserOrders = async (user) => {
    setSelectedUser(user);
    setLoadingUserOrders(true);
    try {
      const response = await fetch(API_ENDPOINTS.USER_ORDERS_BY_USER_ID(user._id));
      const data = await response.json();
      setUserOrders(Array.isArray(data) ? data : []);
    } catch {
      setUserOrders([]);
    }
    setLoadingUserOrders(false);
  };

  const handleScannerKeyPress = (e) => {
    if (e.key === 'Enter') {
      const scannedId = scannerInput.trim();
      if (scannedId) {
        const order = orders.find((o) => o._id.slice(-4) === scannedId || o._id.includes(scannedId));
        if (order) {
          const element = document.getElementById(`order-${order._id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-yellow-100');
            setTimeout(() => element.classList.remove('bg-yellow-100'), 2000);
          }
          setScannerInput('');
          setScannerError('');
        } else {
          setScannerError('Pedido no encontrado');
        }
      }
    }
  };

  const generateBarcode = (orderId) => {
    // Esta función debería usar una librería de códigos de barras como jsbarcode
    // Por ahora, solo establecemos el pedido seleccionado
    setBarcodeOrder(orderId);
  };

  const exportToExcel = () => {
    // Implementación de exportación a Excel usando xlsx
    // Por ahora, solo mostramos un mensaje
    alert('Función de exportación a Excel - requiere librería xlsx');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col border-r border-gray-200 h-screen">
        <div className="p-8 flex-1">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-100">Administracion Libros</h2>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`text-left px-4 py-2 rounded transition text-gray-100 ${
                activeSection === 'dashboard' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection('productos')}
              className={`text-left px-4 py-2 rounded transition text-gray-100 ${
                activeSection === 'productos' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveSection('pedidos')}
              className={`text-left px-4 py-2 rounded transition text-gray-100 ${
                activeSection === 'pedidos' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
              }`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setActiveSection('usuarios')}
              className={`text-left px-4 py-2 rounded transition text-gray-100 ${
                activeSection === 'usuarios' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
              }`}
            >
              Usuarios
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full text-left px-4 py-3 rounded transition text-gray-100 hover:bg-red-600 hover:text-white flex items-center gap-2"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            {loadingStats && <p className="text-gray-500">Cargando estadísticas...</p>}
            {errorStats && <p className="text-red-600">{errorStats}</p>}
            {stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-4">Ventas por mes (últimos 12 meses)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={monthlySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value) => `$${value.toLocaleString('es-AR')}`} />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#2563eb" name="Ventas" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-4">Productos más vendidos</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={12} />
                        <YAxis dataKey="name" type="category" fontSize={12} width={120} />
                        <Tooltip formatter={(value) => `${value} ventas`} />
                        <Legend />
                        <Bar dataKey="count" fill="#22c55e" name="Ventas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-xs text-gray-500 mb-1">Facturación total</div>
                    <div className="text-2xl font-bold text-green-700">
                      {stats.totalFacturacion?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-xs text-gray-500 mb-1">Facturación diaria</div>
                    <div className="text-xl font-bold text-green-700">
                      {stats.diaria?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-xs text-gray-500 mb-1">Facturación semanal</div>
                    <div className="text-xl font-bold text-green-700">
                      {stats.semanal?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-xs text-gray-500 mb-1">Facturación mensual</div>
                    <div className="text-xl font-bold text-green-700">
                      {stats.mensual?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-xs text-gray-500 mb-1">Total de pedidos</div>
                    <div className="text-2xl font-bold">{stats.pedidosTotales ?? '-'}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-semibold">
                        Pendientes: {stats.pedidosPorEstado?.pendiente ?? 0}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-semibold">
                        En proceso: {stats.pedidosPorEstado?.['en proceso'] ?? 0}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-semibold">
                        Listos: {stats.pedidosPorEstado?.['listo para retirar'] ?? 0}
                      </span>
                      <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold">
                        Entregados: {stats.pedidosPorEstado?.entregado ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-xs text-gray-500 mb-1">Pedidos más recientes</div>
                    <ul className="divide-y divide-gray-200">
                      {stats.recientes?.map((order) => (
                        <li key={order._id} className="py-2 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-mono text-xs">#{order._id.slice(-4)}</span>
                          <span className="flex-1">
                            {order.user?.nombre || '-'} ({order.user?.email || '-'})
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString('es-AR', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                              order.status === 'pendiente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'en proceso'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'listo para retirar'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="text-green-600 font-bold">
                            {order.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                          </span>
                        </li>
                      )) || <li className="text-gray-500">No hay pedidos recientes.</li>}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Productos */}
        {activeSection === 'productos' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Productos</h1>
            <form onSubmit={handleProductSubmit} className="bg-white rounded-xl shadow p-8 mb-10 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? 'Editar producto' : 'Crear nuevo producto'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1 font-medium">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-lg"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Precio</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-lg"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Cantidad de páginas</label>
                  <input
                    type="number"
                    name="pages"
                    value={productForm.pages}
                    onChange={handleProductChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-lg"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Categoría</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="escolares">Escolares</option>
                    <option value="ingles">Inglés</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Descripción</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-lg"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 flex flex-col items-start">
                  <label className="block mb-1 font-medium">Imagen</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleProductChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <div className="flex gap-4 mt-2">
                    {productImagePreview && (
                      <img src={productImagePreview} alt="Preview" className="w-28 h-28 object-contain rounded border bg-white" />
                    )}
                    {!productImagePreview && productForm.image && (
                      <img
                        src={getImageUrl(productForm.image)}
                        alt="Preview"
                        className="w-28 h-28 object-contain rounded border bg-white"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
                  disabled={loadingProducts}
                >
                  {loadingProducts
                    ? editingProduct
                      ? 'Guardando...'
                      : 'Creando...'
                    : editingProduct
                    ? 'Guardar cambios'
                    : 'Crear producto'}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: '',
                        description: '',
                        price: '',
                        pages: '',
                        image: '',
                        category: 'escolares'
                      });
                      setProductImagePreview(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition text-lg font-semibold"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
              {productError && <p className="mt-4 text-red-600">{productError}</p>}
            </form>

            <div className="bg-white rounded-xl shadow p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Productos cargados</h2>
                <div className="mt-2 sm:mt-0">
                  <input
                    type="text"
                    placeholder="Buscar productos por nombre..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full sm:w-80 border rounded px-3 py-2"
                  />
                </div>
              </div>
              {loadingProducts ? (
                <p className="text-gray-500">Cargando productos...</p>
              ) : products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 ? (
                <p className="text-gray-500">No hay productos cargados aún.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <th className="px-4 py-2 text-left">Imagen</th>
                      <th className="px-4 py-2 text-left">Nombre</th>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-left">Páginas</th>
                      <th className="px-4 py-2 text-left">Categoría</th>
                      <th className="px-4 py-2 text-left">Precio</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((product) => (
                        <tr key={product._id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-4 py-2">
                            {product.image && (
                              <img
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                className="w-16 h-16 object-contain rounded border bg-white"
                              />
                            )}
                          </td>
                          <td className="px-4 py-2 font-bold text-base">{product.name}</td>
                          <td className="px-4 py-2 text-gray-600">{product.description}</td>
                          <td className="px-4 py-2">{product.pages}</td>
                          <td className="px-4 py-2 capitalize">{product.category}</td>
                          <td className="px-4 py-2 text-green-700 font-bold">${product.price}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <button
                              onClick={() => editProduct(product)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteProduct(product._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Pedidos - Continuará en siguiente archivo debido a tamaño */}
        {activeSection === 'pedidos' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Reservas</h1>
            <div className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad de pedidos a mostrar:
                </label>
                <select
                  value={ordersLimit}
                  onChange={(e) => setOrdersLimit(Number(e.target.value))}
                  className="border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={25}>Últimos 25 pedidos</option>
                  <option value={50}>Últimos 50 pedidos</option>
                  <option value={100}>Últimos 100 pedidos</option>
                  <option value={200}>Últimos 200 pedidos</option>
                  <option value={500}>Últimos 500 pedidos</option>
                  <option value={1000}>Últimos 1000 pedidos</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Buscar por cliente, email, teléfono o ID de pedido..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full sm:w-96 border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {orderSearch && (
                  <button
                    onClick={() => setOrderSearch('')}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition text-lg font-semibold"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setScannerActive(!scannerActive)}
                  className={`px-4 py-2 rounded-lg transition text-lg font-semibold flex items-center gap-2 ${
                    scannerActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {scannerActive ? 'Desactivar Scanner' : 'Activar Scanner'}
                </button>
              </div>
              {scannerActive && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-blue-800 mb-1">
                        Escanear código de barras:
                      </label>
                      <input
                        ref={scannerInputRef}
                        type="text"
                        placeholder="Escanee el código de barras del pedido..."
                        value={scannerInput}
                        onChange={(e) => setScannerInput(e.target.value)}
                        onKeyPress={handleScannerKeyPress}
                        className="w-full border border-blue-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => {
                        setScannerActive(false);
                        setScannerInput('');
                        setScannerError('');
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-lg font-semibold"
                    >
                      Cerrar
                    </button>
                  </div>
                  {scannerError && (
                    <div className="mt-2 text-red-600 text-sm font-medium">{scannerError}</div>
                  )}
                </div>
              )}
              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  {orderSearch ? (
                    <span>
                      Buscando: "{orderSearch}" en los últimos {ordersLimit} pedidos
                    </span>
                  ) : (
                    <span>Mostrando los últimos {ordersLimit} pedidos</span>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={exportToExcel}
                  disabled={orders.length === 0 || loadingOrders}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition text-lg font-semibold flex items-center gap-2"
                >
                  Exportar a Excel
                </button>
                <span className="ml-3 text-sm text-gray-600">
                  {orders.length > 0
                    ? `${orders.length} pedido${orders.length !== 1 ? 's' : ''} disponibles para exportar`
                    : 'No hay pedidos para exportar'}
                </span>
              </div>
            </div>
            {loadingOrders ? (
              <p className="text-gray-500">Cargando reservas...</p>
            ) : orderError ? (
              <p className="text-red-500">{orderError}</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">
                {orderSearch ? 'No se encontraron reservas con esos criterios.' : 'No hay reservas aún.'}
              </p>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b">
                  <div className="text-sm text-gray-600">
                    {orderSearch
                      ? `Se encontraron ${orders.length} pedido${orders.length !== 1 ? 's' : ''}`
                      : `Total de pedidos: ${orders.length}`}
                  </div>
                </div>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <th className="px-4 py-2 text-left">ID Pedido</th>
                      <th className="px-4 py-2 text-left">Cliente</th>
                      <th className="px-4 py-2 text-left">Contacto</th>
                      <th className="px-4 py-2 text-left">Productos</th>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        id={`order-${order._id}`}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-2">
                          <div className="font-mono text-sm font-bold text-blue-600">
                            #{order._id.slice(-4)}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-semibold">{order.user?.nombre || 'Usuario'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div>
                            <div className="text-sm">{order.user?.email || '-'}</div>
                            <div className="text-xs text-gray-500">{order.user?.telefono || '-'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-w-xs">
                            {order.products.map((item, idx) => (
                              <div key={idx} className="text-xs mb-1">
                                {item.product?.name} x{item.quantity}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-w-xs text-xs text-gray-600">{order.description || '-'}</div>
                        </td>
                        <td className="px-4 py-2 font-bold text-green-700">${order.total}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'pendiente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'en proceso'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'listo para retirar'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setOrderStatus(order.status);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Cambiar Estado
                            </button>
                            <button
                              onClick={() => generateBarcode(order._id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                              title="Generar código de barras"
                            >
                              Código
                            </button>
                            <button
                              onClick={() => deleteOrder(order._id)}
                              disabled={deletingOrder[order._id]}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 flex items-center gap-1"
                            >
                              {deletingOrder[order._id] ? 'Eliminando...' : 'Eliminar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal para cambiar estado */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setOrderStatus('');
                    }}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Detalles del pedido</h2>
                  <div className="mb-2">
                    <b>ID:</b> #{selectedOrder._id.slice(-4)}
                  </div>
                  <div className="mb-2">
                    <b>Cliente:</b> {selectedOrder.user?.nombre || '-'}
                  </div>
                  <div className="mb-2">
                    <b>Email:</b> {selectedOrder.user?.email || '-'}
                  </div>
                  <div className="mb-2">
                    <b>Teléfono:</b> {selectedOrder.user?.telefono || '-'}
                  </div>
                  <div className="mb-2">
                    <b>Fecha:</b>{' '}
                    {new Date(selectedOrder.createdAt).toLocaleString('es-AR', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </div>
                  <div className="mb-2">
                    <b>Productos:</b>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {selectedOrder.products.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg shadow p-3 flex gap-3 items-center">
                          {item.product?.image && (
                            <img
                              src={getImageUrl(item.product.image)}
                              alt={item.product.name}
                              className="w-16 h-20 object-cover rounded border"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-bold text-sm mb-1">{item.product?.name || '-'}</div>
                            <div className="text-xs text-gray-600 mb-1">
                              Cantidad: <b>{item.quantity}</b>
                            </div>
                            <div className="text-xs text-gray-500">
                              Precio unitario:{' '}
                              {item.product?.price?.toLocaleString('es-AR', {
                                style: 'currency',
                                currency: 'ARS'
                              })}
                            </div>
                            <div className="text-xs text-green-700 font-semibold">
                              Subtotal:{' '}
                              {(item.product?.price * item.quantity).toLocaleString('es-AR', {
                                style: 'currency',
                                currency: 'ARS'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <b>Total:</b>{' '}
                    {selectedOrder.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                  </div>
                  <div className="mb-4">
                    <b>Estado:</b>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="border rounded px-2 py-1 ml-2"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en proceso">En proceso</option>
                      <option value="listo para retirar">Listo para retirar</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </div>
                  {statusError && <p className="text-red-600 mb-2">{statusError}</p>}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleOrderStatusChange}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                      disabled={savingStatus}
                    >
                      {savingStatus ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(null);
                        setOrderStatus('');
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Usuarios */}
        {activeSection === 'usuarios' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                placeholder="Buscar por nombre, email, colegio o teléfono..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full sm:w-96 border rounded px-3 py-2"
              />
            </div>
            {loadingUsers ? (
              <p className="text-gray-500">Cargando usuarios...</p>
            ) : userError ? (
              <p className="text-red-600">{userError}</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500">No se encontraron usuarios.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <th className="px-4 py-2 text-left">Usuario</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Teléfono</th>
                      <th className="px-4 py-2 text-left">Colegio</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-2 flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                            {user.nombre ? user.nombre[0].toUpperCase() : 'U'}
                          </span>
                          <span className="font-semibold">{user.nombre}</span>
                        </td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.telefono || '-'}</td>
                        <td className="px-4 py-2">{user.carrera || '-'}</td>
                        <td className="px-4 py-2">
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1 text-xs"
                            onClick={() => viewUserOrders(user)}
                          >
                            Ver pedidos
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal de pedidos del usuario */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserOrders([]);
                    }}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Pedidos de {selectedUser.nombre}</h2>
                  {loadingUserOrders ? (
                    <p className="text-gray-500">Cargando pedidos...</p>
                  ) : userOrders.length === 0 ? (
                    <p className="text-gray-500">Este usuario no tiene pedidos.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {userOrders.map((order) => (
                        <li key={order._id} className="py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-mono text-xs">#{order._id.slice(-4)}</span>
                              <span className="ml-2 text-gray-700">
                                {new Date(order.createdAt).toLocaleString('es-AR', {
                                  dateStyle: 'short',
                                  timeStyle: 'short'
                                })}
                              </span>
                              <span
                                className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                                  order.status === 'pendiente'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : order.status === 'en proceso'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'listo para retirar'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-green-600 font-bold">
                              ${order.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {order.products.map((item) => `${item.product?.name || '-'} x${item.quantity}`).join(', ')}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

