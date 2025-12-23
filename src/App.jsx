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
import Footer from './components/Footer';

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

  // Redirecciones automáticas
  if (!loading) {
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/registro') {
      return <Navigate to="/login" replace />;
    }
    if (isAuthenticated && user?.isAdmin && location.pathname !== '/admin') {
      return <Navigate to="/admin" replace />;
    }
    if (isAuthenticated && !user?.isAdmin && (location.pathname === '/admin' || location.pathname === '/')) {
      return <Navigate to="/seleccionar-categoria" replace />;
    }
    if (isAuthenticated && !user?.isAdmin && location.pathname === '/login') {
      return <Navigate to="/seleccionar-categoria" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      {!user?.isAdmin && !['/login', '/registro', '/carrito', '/admin', '/checkout'].includes(location.pathname) && (
        <Footer />
      )}
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

