import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getImageUrl, API_ENDPOINTS, API_BASE_URL } from '../config/api';
import JsBarcode from 'jsbarcode';
import * as XLSX from 'xlsx';

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
  const barcodeCanvasRef = useRef(null);
  const [barcodeReady, setBarcodeReady] = useState(false);

  // Debug: Log cuando barcodeOrder cambia
  useEffect(() => {
    console.log('barcodeOrder cambió:', barcodeOrder ? `Pedido ${barcodeOrder.orderNumber || barcodeOrder._id?.slice(-4)}` : 'null');
  }, [barcodeOrder]);

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
      const response = await fetch(API_ENDPOINTS.PRODUCTS_ADMIN, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      // El backend devuelve { products } o puede ser un array directo
      const productsArray = Array.isArray(data) ? data : (data.products || []);
      setProducts(productsArray);
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
      const response = await fetch(API_ENDPOINTS.ORDER_UPDATE_STATUS(selectedOrder._id), {
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
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setStatusError('Error al actualizar estado');
    }
    setSavingStatus(false);
  };

  const deleteOrder = async (orderId, skipConfirm = false) => {
    if (!skipConfirm && !confirm('¿Estás seguro de eliminar este pedido?')) return;
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
        // Cerrar el modal si estaba abierto
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
          setOrderStatus('');
        }
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
        const order = orders.find((o) => o.orderNumber?.toString() === scannedId || o.orderNumber?.toString().includes(scannedId));
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
    // Buscar el pedido completo en el array de orders
    const order = orders.find(o => o._id === orderId);
    if (order) {
      setBarcodeOrder(order);
    }
  };

  // Callback ref para cuando el SVG se monte
  const barcodeCanvasCallback = (node) => {
    console.log('barcodeCanvasCallback llamado, node:', node ? 'existe' : 'null', 'barcodeOrder:', barcodeOrder ? `Pedido ${barcodeOrder.orderNumber || barcodeOrder._id?.slice(-4)}` : 'null');
    barcodeCanvasRef.current = node;
    if (node && barcodeOrder) {
      console.log('SVG montado y barcodeOrder existe, activando generación...');
      // Pequeño delay para asegurar que el DOM esté completamente listo
      setTimeout(() => {
        setBarcodeReady(true);
      }, 50);
    }
  };

  // Generar código de barras cuando el SVG esté listo Y barcodeOrder exista
  useEffect(() => {
    console.log('useEffect barcodeReady:', barcodeReady, 'barcodeOrder:', barcodeOrder ? `Pedido ${barcodeOrder.orderNumber || barcodeOrder._id?.slice(-4)}` : 'null', 'canvas:', barcodeCanvasRef.current ? 'existe' : 'null');
    
    if (barcodeOrder && barcodeCanvasRef.current) {
      // Si el SVG ya está montado, generar inmediatamente
      if (barcodeCanvasRef.current && !barcodeReady) {
        console.log('SVG ya montado, activando generación...');
        setTimeout(() => {
          setBarcodeReady(true);
        }, 50);
      }
    }
    
    if (barcodeReady && barcodeOrder && barcodeCanvasRef.current) {
      try {
        const orderIdForBarcode = barcodeOrder.orderNumber?.toString() || barcodeOrder._id.toString();
        console.log('Generando código de barras para pedido:', orderIdForBarcode);
        // Limpiar el SVG antes de generar uno nuevo
        barcodeCanvasRef.current.innerHTML = '';
        // Generar código de barras con el número del pedido
        JsBarcode(barcodeCanvasRef.current, orderIdForBarcode, {
          format: 'CODE128',
          width: 0.8,
          height: 100,
          displayValue: true,
          fontSize: 12,
          margin: 5,
          background: '#ffffff',
          lineColor: '#000000'
        });
        console.log('Código de barras generado exitosamente');
        setBarcodeReady(false);
      } catch (error) {
        console.error('Error al generar código de barras:', error);
        console.error('Error details:', error.message, error.stack);
        setBarcodeReady(false);
      }
    }
  }, [barcodeReady, barcodeOrder]);

  // Limpiar cuando se cierra el modal
  useEffect(() => {
    if (!barcodeOrder && barcodeCanvasRef.current) {
      barcodeCanvasRef.current.innerHTML = '';
      setBarcodeReady(false);
    }
  }, [barcodeOrder]);

  const exportToExcel = () => {
    if (orders.length === 0) {
      alert('No hay pedidos para exportar');
      return;
    }

    try {
      // Preparar los datos para Excel
      const excelData = orders.map((order) => {
        const productsList = order.products
          .map((item) => `${item.product?.name || 'Producto desconocido'} x${item.quantity}`)
          .join('; ');
        
        return {
          'ID Pedido': order.orderNumber || order._id.slice(-4),
          'Cliente': order.user?.nombre || 'Usuario desconocido',
          'Email': order.user?.email || '-',
          'Teléfono': order.user?.telefono || '-',
          'Productos': productsList,
          'Descripción': order.description || '-',
          'Total': `$${order.total}`,
          'Estado': order.status.charAt(0).toUpperCase() + order.status.slice(1),
          'Fecha': new Date(order.createdAt).toLocaleString('es-AR'),
        };
      });

      // Crear un libro de trabajo y una hoja
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Ajustar el ancho de las columnas
      const colWidths = [
        { wch: 12 }, // ID Pedido
        { wch: 20 }, // Cliente
        { wch: 25 }, // Email
        { wch: 15 }, // Teléfono
        { wch: 40 }, // Productos
        { wch: 30 }, // Descripción
        { wch: 12 }, // Total
        { wch: 18 }, // Estado
        { wch: 20 }, // Fecha
      ];
      ws['!cols'] = colWidths;

      // Crear el libro de trabajo
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');

      // Generar el nombre del archivo con la fecha actual
      const fecha = new Date().toISOString().split('T')[0];
      const fileName = `pedidos_${fecha}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al exportar a Excel. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col border-r border-slate-700 h-screen shadow-xl">
        <div className="p-6 flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Libreria Low Cost
            </h2>
            <p className="text-xs text-slate-400">Panel de Administración</p>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                activeSection === 'dashboard' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection('productos')}
              className={`text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                activeSection === 'productos' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos
            </button>
            <button
              onClick={() => setActiveSection('pedidos')}
              className={`text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                activeSection === 'pedidos' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Pedidos
            </button>
            <button
              onClick={() => setActiveSection('usuarios')}
              className={`text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                activeSection === 'usuarios' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuarios
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-slate-300 hover:bg-red-600 hover:text-white flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <div>
            <h1 className="text-4xl font-bold mb-8 text-slate-800">Dashboard</h1>
            {loadingStats && <p className="text-gray-500">Cargando estadísticas...</p>}
            {errorStats && <p className="text-red-600">{errorStats}</p>}
            {stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Ventas por mes (últimos 12 meses)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={monthlySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" fontSize={12} stroke="#64748b" />
                        <YAxis fontSize={12} stroke="#64748b" />
                        <Tooltip 
                          formatter={(value) => `$${value.toLocaleString('es-AR')}`}
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} name="Ventas" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Productos más vendidos</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" fontSize={12} stroke="#64748b" />
                        <YAxis dataKey="name" type="category" fontSize={12} width={120} stroke="#64748b" />
                        <Tooltip 
                          formatter={(value) => `${value} ventas`}
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#22c55e" name="Ventas" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="text-sm opacity-90 mb-2">Facturación total</div>
                    <div className="text-3xl font-bold">
                      {stats.totalFacturacion?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="text-sm opacity-90 mb-2">Facturación diaria</div>
                    <div className="text-2xl font-bold">
                      {stats.diaria?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="text-sm opacity-90 mb-2">Facturación semanal</div>
                    <div className="text-2xl font-bold">
                      {stats.semanal?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="text-sm opacity-90 mb-2">Facturación mensual</div>
                    <div className="text-2xl font-bold">
                      {stats.mensual?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200">
                    <div className="text-sm text-slate-600 mb-2">Total de pedidos</div>
                    <div className="text-3xl font-bold text-slate-800 mb-4">{stats.pedidosTotales ?? '-'}</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        Pendientes: {stats.pedidosPorEstado?.pendiente ?? 0}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        En proceso: {stats.pedidosPorEstado?.['en proceso'] ?? 0}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        Listos: {stats.pedidosPorEstado?.['listo para retirar'] ?? 0}
                      </span>
                      <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        Entregados: {stats.pedidosPorEstado?.entregado ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200">
                    <div className="text-sm text-slate-600 mb-2">Pedidos más recientes</div>
                    <ul className="divide-y divide-gray-200">
                      {stats.recientes?.map((order) => (
                        <li key={order._id} className="py-2 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-mono text-xs">#{order.orderNumber || order._id.slice(-4)}</span>
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
            <h1 className="text-4xl font-bold mb-8 text-slate-800">Gestión de Productos</h1>
            <form onSubmit={handleProductSubmit} className="bg-white rounded-2xl shadow-lg p-8 mb-10 max-w-2xl mx-auto border-2 border-slate-200">
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
            <h1 className="text-4xl font-bold mb-8 text-slate-800">Gestión de Reservas</h1>
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
                <div className="mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg w-full max-w-full overflow-hidden">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <label className="block text-sm font-medium text-blue-800 flex-shrink-0">
                        Escanear código de barras:
                      </label>
                      <button
                        onClick={() => {
                          setScannerActive(false);
                          setScannerInput('');
                          setScannerError('');
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition text-sm font-semibold whitespace-nowrap flex-shrink-0 self-start sm:self-auto"
                      >
                        Cerrar
                      </button>
                    </div>
                    <input
                      ref={scannerInputRef}
                      type="text"
                      placeholder="Escanee el código de barras del pedido..."
                      value={scannerInput}
                      onChange={(e) => setScannerInput(e.target.value)}
                      onKeyPress={handleScannerKeyPress}
                      className="w-full min-w-0 border border-blue-300 rounded-lg px-3 sm:px-4 py-2 text-base sm:text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  {scannerError && (
                    <div className="mt-2 text-red-600 text-sm font-medium break-words">{scannerError}</div>
                  )}
                  <div className="mt-2 text-xs text-blue-600 break-words">
                    💡 <strong>Consejo:</strong> Conecte un lector de códigos de barras USB y escanee el ID del pedido. También puede escribir manualmente los últimos dígitos del ID del pedido.
                  </div>
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: '800px' }}>
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <th className="px-2 py-1.5 text-left whitespace-nowrap">ID Pedido</th>
                        <th className="px-2 py-1.5 text-left whitespace-nowrap">Cliente</th>
                        <th className="px-2 py-1.5 text-left whitespace-nowrap max-w-[150px]">Contacto</th>
                        <th className="px-2 py-1.5 text-left whitespace-nowrap max-w-[180px]">Productos</th>
                        <th className="px-2 py-1.5 text-left whitespace-nowrap max-w-[120px]">Descripción</th>
                        <th className="px-2 py-1.5 text-left whitespace-nowrap">Total</th>
                        <th className="px-2 py-1.5 text-left whitespace-nowrap">Estado</th>
                        <th className="px-2 py-1.5 text-left whitespace-nowrap">Fecha</th>
                        <th className="px-2 py-1.5 text-left whitespace-nowrap">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          id={`order-${order._id}`}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            <div className="font-mono text-xs font-bold text-blue-600">
                              #{order.orderNumber || order._id.slice(-4)}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div>
                              <div className="font-semibold text-xs">{order.user?.nombre || 'Usuario'}</div>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 max-w-[150px]">
                            <div>
                              <div className="text-xs break-words">{order.user?.email || '-'}</div>
                              <div className="text-xs text-gray-500">{order.user?.telefono || '-'}</div>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 max-w-[180px]">
                            <div>
                              {order.products.map((item, idx) => (
                                <div key={idx} className="text-xs mb-0.5 break-words">
                                  {item.product?.name} x{item.quantity}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 max-w-[120px]">
                            <div className="text-xs text-gray-600 break-words line-clamp-2">{order.description || '-'}</div>
                          </td>
                          <td className="px-2 py-1.5 font-bold text-green-700 whitespace-nowrap text-xs">${order.total}</td>
                          <td className="px-2 py-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
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
                          <td className="px-2 py-1.5 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setOrderStatus(order.status);
                              }}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal de detalles del pedido */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full relative my-8">
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setOrderStatus('');
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                  >
                    ×
                  </button>
                  <h2 className="text-3xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Detalles del Pedido #{selectedOrder.orderNumber || selectedOrder._id.slice(-4)}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-100">
                      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Información del Cliente
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div><b className="text-slate-700">Nombre:</b> <span className="text-slate-600">{selectedOrder.user?.nombre || '-'}</span></div>
                        <div><b className="text-slate-700">Email:</b> <span className="text-slate-600 break-words">{selectedOrder.user?.email || '-'}</span></div>
                        <div><b className="text-slate-700">Teléfono:</b> <span className="text-slate-600">{selectedOrder.user?.telefono || '-'}</span></div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-100">
                      <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Información del Pedido
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div><b className="text-slate-700">ID:</b> <span className="font-mono text-blue-600 font-bold">#{selectedOrder.orderNumber || selectedOrder._id.slice(-4)}</span></div>
                        <div><b className="text-slate-700">Fecha:</b> <span className="text-slate-600">
                          {new Date(selectedOrder.createdAt).toLocaleString('es-AR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span></div>
                        <div><b className="text-slate-700">Total:</b> <span className="text-green-700 font-bold text-lg">
                          {selectedOrder.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                        </span></div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.description && (
                    <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Descripción
                      </h3>
                      <p className="text-sm text-slate-700">{selectedOrder.description}</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Productos ({selectedOrder.products.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedOrder.products.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg shadow-md p-4 flex gap-4 items-start border-2 border-gray-200 hover:border-blue-300 transition">
                          {item.product?.image && (
                            <img
                              src={getImageUrl(item.product.image)}
                              alt={item.product.name}
                              className="w-20 h-24 object-cover rounded border-2 border-gray-300"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm mb-2 text-slate-800 break-words">{item.product?.name || '-'}</div>
                            <div className="text-xs text-gray-600 mb-1">
                              Cantidad: <b className="text-blue-600">{item.quantity}</b>
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
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

                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cambiar Estado del Pedido
                    </h3>
                    <div className="mb-4">
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en proceso">En proceso</option>
                        <option value="listo para retirar">Listo para retirar</option>
                        <option value="entregado">Entregado</option>
                      </select>
                    </div>
                    {statusError && (
                      <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm">
                        {statusError}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={handleOrderStatusChange}
                      disabled={savingStatus}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {savingStatus ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Guardar Cambios de Estado
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        console.log('Botón de código de barras clickeado, pedido:', selectedOrder);
                        if (selectedOrder) {
                          console.log('Estableciendo barcodeOrder y cerrando modal de detalles...');
                          // Cerrar el modal de detalles primero
                          const orderToBarcode = selectedOrder;
                          setSelectedOrder(null);
                          setOrderStatus('');
                          // Abrir el modal de código de barras después de un pequeño delay para asegurar que el DOM se actualice
                          setTimeout(() => {
                            setBarcodeOrder(orderToBarcode);
                            console.log('barcodeOrder establecido');
                          }, 100);
                        } else {
                          console.error('selectedOrder es null');
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Generar Código de Barras
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.')) {
                          deleteOrder(selectedOrder._id, true);
                        }
                      }}
                      disabled={deletingOrder[selectedOrder._id]}
                      className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deletingOrder[selectedOrder._id] ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar Pedido
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(null);
                        setOrderStatus('');
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cerrar
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
            <h1 className="text-4xl font-bold mb-8 text-slate-800">Gestión de Usuarios</h1>
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
                              <span className="font-mono text-xs">#{order.orderNumber || order._id.slice(-4)}</span>
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

        {/* Modal de código de barras - Fuera de cualquier sección para que siempre se muestre */}
        {barcodeOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto" style={{ zIndex: 10000 }}>
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full relative my-8">
              {console.log('Renderizando modal de código de barras para pedido:', barcodeOrder.orderNumber || barcodeOrder._id.slice(-4))}
              <button
                onClick={() => {
                  console.log('Cerrando modal de código de barras');
                  setBarcodeOrder(null);
                  setBarcodeReady(false);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2 print:hidden">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Código de Barras - Pedido #{barcodeOrder.orderNumber || barcodeOrder._id.slice(-4)}
              </h2>
              
              {/* Área imprimible */}
              <div id="barcode-print-area" className="bg-white border-2 border-gray-300 rounded-lg p-8 print:border-0 print:p-4 print:shadow-none">
                <div className="text-center space-y-4">
                  {/* Número de pedido - Solo este girado 180 grados */}
                  <div className="flex justify-center">
                    <div className="transform rotate-180 origin-center">
                      <div className="text-2xl font-bold text-slate-800">
                        Pedido #{barcodeOrder.orderNumber || barcodeOrder._id.slice(-4)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Código de barras */}
                  <div className="flex justify-center my-6">
                    <svg 
                      ref={barcodeCanvasCallback} 
                      className="barcode"
                      style={{ minHeight: '100px' }}
                    />
                  </div>
                  
                  {/* Código alfanumérico debajo del código de barras */}
                  <div className="text-lg font-mono text-slate-800 mb-6">
                    {barcodeOrder.orderNumber || barcodeOrder._id.slice(-4)}
                  </div>
                  
                  {/* Información del cliente */}
                  <div className="text-center space-y-2">
                    <div className="text-base text-slate-700">
                      Cliente: {barcodeOrder.user?.nombre || 'Usuario'}
                    </div>
                    
                    {/* Fecha */}
                    <div className="text-base text-slate-700">
                      Fecha: {new Date(barcodeOrder.createdAt).toLocaleDateString('es-AR')}
                    </div>
                    
                    {/* Lista de productos */}
                    <div className="mt-4">
                      <div className="text-base font-semibold text-slate-800 mb-2">
                        Productos:
                      </div>
                      <div className="space-y-1 text-sm text-slate-700">
                        {barcodeOrder.products.map((item, idx) => (
                          <div key={idx} className="text-center">
                            {item.product?.name || '-'} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Importe - Después de los productos */}
                    <div className="text-lg font-bold text-slate-800 mt-4">
                      Importe: ${barcodeOrder.total.toLocaleString('es-AR')}
                    </div>
                  </div>
                </div>
              </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6 print:hidden">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Imprimir
                    </button>
                    <button
                      onClick={() => {
                        setBarcodeOrder(null);
                        setBarcodeReady(false);
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
      </main>
    </div>
  );
}

