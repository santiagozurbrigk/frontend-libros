import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'email':
        if (!value.trim()) {
          error = 'El email es obligatorio.';
        } else if (!validateEmail(value)) {
          error = 'Email inválido.';
        }
        break;
      case 'password':
        if (!value) {
          error = 'La contraseña es obligatoria.';
        }
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasErrors = false;

    Object.entries(formData).forEach(([key, value]) => {
      if (validateField(key, value)) {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      setLoading(true);
      setMessage('');
      try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
          setMessage('¡Login exitoso!');
          login(data.token);
          // Redirigir según el tipo de usuario
          if (data.user?.isAdmin) {
            navigate('/admin');
          } else {
            navigate('/seleccionar-categoria');
          }
        } else if (data.msg?.includes('incorrectos')) {
          setMessage('El email o la contraseña no son correctos. ¿Olvidaste tu contraseña?');
        } else {
          setMessage(data.msg || 'Ocurrió un error inesperado. Intenta nuevamente o contacta soporte.');
        }
      } catch {
        setMessage('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Re-Libros</h1>
          <p className="text-slate-600">Tu librería de confianza</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-blue-100/50 p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-8 text-center text-slate-800">Iniciar Sesión</h2>
          
          <div className="space-y-5">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-4 border-2 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 placeholder:text-slate-400`}
                required
              />
              {errors.email && (
                <div className="text-red-500 text-sm mt-2 ml-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-4 border-2 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 placeholder:text-slate-400`}
                required
              />
              {errors.password && (
                <div className="text-red-500 text-sm mt-2 ml-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 text-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ingresando...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {message && (
            <div className={`mt-5 p-4 rounded-xl ${
              message.includes('exitoso') 
                ? 'bg-green-50 border-2 border-green-200 text-green-700' 
                : 'bg-red-50 border-2 border-red-200 text-red-700'
            }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

