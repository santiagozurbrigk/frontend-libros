import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validatePhone = (phone) => /^\d{7,15}$/.test(phone);

export default function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    carrera: '',
    telefono: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es obligatorio.';
        } else if (value.trim().length < 3) {
          error = 'Debe tener al menos 3 caracteres.';
        }
        break;
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
        } else if (value.length < 6) {
          error = 'Debe tener al menos 6 caracteres.';
        }
        break;
      case 'telefono':
        if (!value.trim()) {
          error = 'El teléfono es obligatorio.';
        } else if (!validatePhone(value)) {
          error = 'Solo números, entre 7 y 15 dígitos.';
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
      if (key !== 'carrera' && validateField(key, value)) {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      setLoading(true);
      setMessage('');
      try {
        const response = await fetch('https://backend-libros-ox7x.onrender.com/api/usuarios/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
          setMessage('¡Registro exitoso! Redirigiendo al login...');
          setFormData({ nombre: '', email: '', password: '', carrera: '', telefono: '' });
          setTimeout(() => navigate('/login'), 1500);
        } else if (data.msg?.includes('email')) {
          setMessage('Ya existe una cuenta registrada con ese email. ¿Ya tienes cuenta? Inicia sesión.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-200 py-12 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Registro de Usuario</h2>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${
            errors.nombre ? 'border-red-400' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg`}
          required
        />
        {errors.nombre && <div className="text-red-500 text-sm mb-2">{errors.nombre}</div>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${
            errors.email ? 'border-red-400' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg`}
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
          } rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg`}
          required
        />
        {errors.password && <div className="text-red-500 text-sm mb-2">{errors.password}</div>}

        <input
          type="text"
          name="carrera"
          placeholder="Colegio (opcional)"
          value={formData.carrera}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg"
        />

        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${
            errors.telefono ? 'border-red-400' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg`}
          required
        />
        {errors.telefono && <div className="text-red-500 text-sm mb-2">{errors.telefono}</div>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold transition mt-2"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        {message && (
          <p className={`mt-4 text-center ${message.includes('exitoso') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-green-600 hover:underline font-semibold">
            Inicia sesión aquí
          </Link>
        </div>
      </form>
    </div>
  );
}

