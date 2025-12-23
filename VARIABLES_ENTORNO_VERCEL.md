# 🔐 Variables de Entorno para Vercel

## Variables Necesarias en Vercel

Para el **frontend** en Vercel, solo necesitas configurar **UNA variable de entorno**:

### ✅ Variable Requerida

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_BACKEND_URL` | `https://backend-libros-ox7x.onrender.com` | URL del backend API desplegado en Render |

## ⚠️ Variables que NO necesitas en Vercel (Frontend)

Las siguientes variables son del **backend** y **NO deben estar en el frontend** por seguridad:

- ❌ `AWS_ACCESS_KEY_ID` - Solo backend
- ❌ `AWS_SECRET_ACCESS_KEY` - Solo backend (NUNCA en frontend)
- ❌ `AWS_REGION` - Solo backend
- ❌ `AWS_S3_BUCKET_NAME` - Solo backend
- ❌ `BREVO_API_KEY` - Solo backend (NUNCA en frontend)
- ❌ `BREVO_USER` - Solo backend
- ❌ `JWT_SECRET` - Solo backend (NUNCA en frontend)
- ❌ `MONGO_URI` - Solo backend (NUNCA en frontend)
- ❌ `PORT` - Solo backend

## 📝 Cómo Configurar en Vercel

### Paso 1: Ve a tu proyecto en Vercel
1. Abre [vercel.com](https://vercel.com)
2. Selecciona tu proyecto `frontend-libros`

### Paso 2: Configura las Variables de Entorno
1. Ve a **Settings** → **Environment Variables**
2. Haz clic en **Add New**
3. Agrega:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://backend-libros-ox7x.onrender.com`
   - **Environment**: Selecciona todas (Production, Preview, Development)
4. Haz clic en **Save**

### Paso 3: Redesplegar
Después de agregar las variables, Vercel automáticamente:
- Detectará los cambios
- Hará un nuevo build con las variables
- Desplegará la nueva versión

O puedes hacerlo manualmente:
1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **Redeploy**

## 🔍 Verificación

Para verificar que las variables están configuradas:

1. En el código, las variables están en `src/config/api.js`
2. El código usa `import.meta.env.VITE_BACKEND_URL`
3. Si no está configurada, usará el valor por defecto: `https://backend-libros-ox7x.onrender.com`

## 🛠️ Desarrollo Local

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_BACKEND_URL=https://backend-libros-ox7x.onrender.com
```

**Nota**: El archivo `.env.local` está en `.gitignore` y no se subirá a Git.

## 📚 Documentación

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

