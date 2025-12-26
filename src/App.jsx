import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CategoryProvider } from './contexts/CategoryContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Registro from './components/Registro';
import CategorySelector from './components/CategorySelector';
import Catalog from './components/Catalog';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Account from './components/Account';
import ProductDetail from './components/ProductDetail';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';

function CategorySelectorWrapper() {
  const navigate = useNavigate();
  return (
    <CategorySelector
      onCategorySelect={(category) => {
        navigate(`/catalogo/${category.id}`);
      }}
    />
  );
}

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Redirecciones automáticas - solo cuando no está cargando
  if (!loading) {
    // Si no está autenticado, redirigir a login (excepto si ya está en login o registro)
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/registro') {
      return <Navigate to="/login" replace />;
    }
    // Si está autenticado como admin, redirigir a admin (excepto si ya está ahí)
    if (isAuthenticated && user?.isAdmin && location.pathname !== '/admin' && location.pathname !== '/login' && location.pathname !== '/registro') {
      return <Navigate to="/admin" replace />;
    }
    // Si está autenticado como usuario normal, redirigir desde admin o root
    if (isAuthenticated && !user?.isAdmin && (location.pathname === '/admin' || location.pathname === '/')) {
      return <Navigate to="/seleccionar-categoria" replace />;
    }
    // Si está autenticado como usuario normal y está en login, redirigir
    if (isAuthenticated && !user?.isAdmin && location.pathname === '/login') {
      return <Navigate to="/seleccionar-categoria" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
      {!user?.isAdmin && !['/login', '/registro'].includes(location.pathname) && <Navbar />}
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        
        <Route
          path="/seleccionar-categoria"
          element={
            <ProtectedRoute>
              <CategorySelectorWrapper />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/catalogo/:categoria"
          element={
            <ProtectedRoute>
              <CategoryProvider>
                <Catalog />
              </CategoryProvider>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/carrito"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/cuenta"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/producto/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

