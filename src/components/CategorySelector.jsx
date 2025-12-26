export default function CategorySelector({ onCategorySelect }) {
  const categories = [
    {
      id: 'escolares',
      name: 'Libros Escolares',
      description: 'Libros para estudiantes de primaria y secundaria',
      icon: '📚',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      id: 'ingles',
      name: 'Libros de Inglés',
      description: 'Libros para aprender y practicar inglés',
      icon: '🌍',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Bienvenido a Libreria Low Cost</h1>
          <p className="text-lg text-slate-600">Selecciona la categoría que te interesa</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category)}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left overflow-hidden border-2 border-transparent hover:border-blue-200 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-800 group-hover:text-slate-900">
                  {category.name}
                </h2>
                <p className="text-slate-600 text-lg group-hover:text-slate-700">
                  {category.description}
                </p>
                <div className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}>
                  <span>Explorar</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

