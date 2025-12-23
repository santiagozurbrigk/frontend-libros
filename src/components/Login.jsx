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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 py-12 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Iniciar Sesión</h2>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${
            errors.email ? 'border-red-400' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg`}
          required
        />
        {errors.email && <div className="text-red-500 text-sm mb-2">{errors.email}</div>}

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${
            errors.password ? 'border-red-400' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg`}
          required
        />
        {errors.password && <div className="text-red-500 text-sm mb-2">{errors.password}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold transition mt-2"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>

        {message && (
          <p className={`mt-4 text-center ${message.includes('exitoso') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-blue-600 hover:underline font-semibold">
            Regístrate aquí
          </Link>
        </div>
      </form>
    </div>
  );
}

