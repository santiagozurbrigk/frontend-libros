# Análisis del Código Minificado - Re-Libros

## Rutas Identificadas

1. `/login` - Página de inicio de sesión
2. `/registro` - Página de registro de usuarios
3. `/seleccionar-categoria` - Selección de categoría (Escolares/Inglés)
4. `/catalogo/:categoria` - Catálogo de productos por categoría
5. `/carrito` - Carrito de compras/reservas
6. `/cuenta` - Mi cuenta (historial de pedidos)
7. `/producto/:id` - Detalle de producto
8. `/checkout` - Finalizar reserva
9. `/admin` - Panel de administración (solo admin)

## Componentes Principales Identificados

### Componentes de Autenticación
- **Login** (`sne`) - Formulario de login
- **Registro** (`dne`) - Formulario de registro

### Componentes de Usuario
- **CategorySelector** (`h5`) - Selector de categoría
- **Catalog** (`d5`) - Catálogo de productos
- **Cart** (`pne`) - Carrito de reservas
- **Checkout** (`_ne`) - Finalizar reserva
- **Account** (`yne`) - Mi cuenta con historial

### Componentes de Administración
- **AdminPanel** (`one`) - Panel principal de admin con:
  - Dashboard (estadísticas, gráficos)
  - Gestión de Productos
  - Gestión de Pedidos
  - Gestión de Usuarios

### Componentes de Layout
- **Navbar** (`c5`) - Barra de navegación
- **Footer** (`f5`) - Pie de página
- **ProtectedRoute** (`ro`) - Ruta protegida

## Contextos Identificados

1. **AuthContext** (`qP`) - Manejo de autenticación
2. **CartContext** (`GP`) - Manejo del carrito
3. **CategoryContext** (`Bj`) - Manejo de categoría seleccionada

## Hooks Utilizados

- `useState` - Estado local
- `useEffect` - Efectos secundarios
- `useContext` - Contextos
- `useNavigate` - Navegación (React Router)
- `useLocation` - Ubicación actual (React Router)

## API Base URL

`https://backend-libros-ox7x.onrender.com`

## Endpoints Identificados

- `POST /api/usuarios/login`
- `POST /api/usuarios/register`
- `GET /api/pedidos/mis-pedidos`
- `POST /api/pedidos`
- `GET /api/pedidos/estadisticas`
- `GET /api/pedidos/dashboard/ventas-mes`
- `GET /api/pedidos/dashboard/top-productos`
- `GET /api/usuarios?search=...`
- `GET /api/pedidos?userId=...`

