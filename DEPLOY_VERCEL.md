# Guía de Despliegue en Vercel

## Pasos para subir el proyecto a Vercel

### 1. Preparar el proyecto

El proyecto ya está configurado con:
- ✅ `package.json` con todas las dependencias
- ✅ `vite.config.js` configurado
- ✅ `index.html` en la raíz
- ✅ `vercel.json` con configuración de Vercel
- ✅ `.gitignore` configurado

### 2. Instalar dependencias localmente (opcional, para probar)

```bash
npm install
```

### 3. Probar localmente (opcional)

```bash
npm run dev
```

### 4. Subir a Vercel

#### Opción A: Desde la interfaz web de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Conecta tu repositorio de GitHub/GitLab/Bitbucket
4. Vercel detectará automáticamente que es un proyecto Vite
5. Configuración automática:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Haz clic en "Deploy"

#### Opción B: Desde la línea de comandos

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# En el directorio del proyecto
vercel

# Seguir las instrucciones en pantalla
```

### 5. Configuración de Variables de Entorno (si es necesario)

Si necesitas variables de entorno:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las variables necesarias (por ejemplo, `VITE_API_URL`)

### 6. Configuración de Rutas (SPA)

El archivo `vercel.json` ya está configurado para manejar rutas de React Router con el rewrite:
- Todas las rutas se redirigen a `index.html` para que React Router funcione correctamente

### 7. Verificar el despliegue

Una vez desplegado, Vercel te dará una URL como:
- `https://tu-proyecto.vercel.app`

### Notas importantes

- ✅ El proyecto usa React Router, por lo que todas las rutas deben redirigir a `index.html`
- ✅ La configuración de `vercel.json` maneja esto automáticamente
- ✅ El build genera los archivos estáticos en la carpeta `dist`
- ✅ Vercel detecta automáticamente Vite y configura todo correctamente

### Comandos útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Preview del build local
npm run preview

# Desplegar a producción
vercel --prod
```

### Solución de problemas

Si tienes problemas:

1. **Error de rutas**: Asegúrate de que `vercel.json` esté en la raíz del proyecto
2. **Error de build**: Verifica que todas las dependencias estén en `package.json`
3. **Error de módulos**: Ejecuta `npm install` antes de hacer build

