# Re-Libros - Sistema de Reserva de Libros

Sistema completo de reserva de libros desarrollado en React con las siguientes características:

## Estructura del Proyecto

```
src/
├── components/          # Componentes de React
│   ├── Login.jsx       # Componente de inicio de sesión
│   ├── Registro.jsx    # Componente de registro
│   ├── CategorySelector.jsx  # Selector de categoría
│   ├── Catalog.jsx     # Catálogo de productos
│   ├── Cart.jsx        # Carrito de compras
│   ├── Checkout.jsx    # Finalizar reserva
│   ├── Account.jsx     # Mi cuenta
│   ├── ProductDetail.jsx  # Detalle de producto
│   ├── AdminPanel.jsx  # Panel de administración
│   ├── Navbar.jsx      # Barra de navegación
│   ├── Footer.jsx      # Pie de página
│   └── ProtectedRoute.jsx  # Ruta protegida
├── contexts/           # Contextos de React
│   ├── AuthContext.jsx     # Contexto de autenticación
│   ├── CartContext.jsx     # Contexto del carrito
│   └── CategoryContext.jsx # Contexto de categoría
├── App.jsx             # Componente principal
├── main.jsx             # Punto de entrada
└── index.css            # Estilos globales
```

## Rutas de la Aplicación

1. `/login` - Página de inicio de sesión
2. `/registro` - Página de registro de usuarios
3. `/seleccionar-categoria` - Selección de categoría (Escolares/Inglés)
4. `/catalogo/:categoria` - Catálogo de productos por categoría
5. `/carrito` - Carrito de compras/reservas
6. `/cuenta` - Mi cuenta (historial de pedidos)
7. `/producto/:id` - Detalle de producto
8. `/checkout` - Finalizar reserva
9. `/admin` - Panel de administración (solo admin)

## Características Principales

### Para Usuarios
- Registro e inicio de sesión
- Selección de categoría (Escolares/Inglés)
- Catálogo de productos con búsqueda
- Carrito de compras
- Finalización de reserva
- Historial de pedidos

### Para Administradores
- Dashboard con estadísticas y gráficos
- Gestión de productos (CRUD)
- Gestión de pedidos con búsqueda y filtros
- Gestión de usuarios
- Exportación a Excel
- Generación de códigos de barras
- Scanner de códigos de barras

## Hooks Utilizados

- `useState` - Manejo de estado local
- `useEffect` - Efectos secundarios y carga de datos
- `useContext` - Acceso a contextos globales
- `useNavigate` - Navegación programática
- `useLocation` - Información de la ruta actual
- `useParams` - Parámetros de la URL

## API Base URL

`https://backend-libros-ox7x.onrender.com`

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Construcción

```bash
npm run build
```

## Despliegue en Vercel

El proyecto está listo para desplegarse en Vercel. Ver `DEPLOY_VERCEL.md` para instrucciones detalladas.

### Pasos rápidos:

1. Sube el proyecto a GitHub/GitLab/Bitbucket
2. Ve a [vercel.com](https://vercel.com) e inicia sesión
3. Haz clic en "Add New Project"
4. Conecta tu repositorio
5. Vercel detectará automáticamente Vite y configurará todo
6. Haz clic en "Deploy"

El archivo `vercel.json` ya está configurado para manejar las rutas de React Router correctamente.

## Tecnologías Utilizadas

- React 18
- React Router DOM 6
- Tailwind CSS 4
- Recharts (para gráficos)
- Vite (build tool)

## Estructura del Proyecto

```
.
├── src/
│   ├── components/      # Componentes React
│   ├── contexts/        # Contextos de React
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── index.html           # HTML principal
├── package.json         # Dependencias
├── vite.config.js       # Configuración de Vite
├── tailwind.config.js   # Configuración de Tailwind
├── vercel.json          # Configuración de Vercel
└── .gitignore           # Archivos ignorados por Git
```

## Notas

- El código fuente fue reconstruido a partir de un archivo minificado de producción
- Todos los componentes incluyen la lógica de hooks (useState, useEffect) extraída del código original
- La estructura sigue las mejores prácticas de React con componentes separados y contextos para estado global
- El proyecto está configurado para despliegue en Vercel con soporte completo para React Router

