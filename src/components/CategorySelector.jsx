export default function CategorySelector({ onCategorySelect }) {
  const categories = [
    {
      id: 'escolares',
      name: 'Libros Escolares',
      description: 'Libros para estudiantes de primaria y secundaria'
    },
    {
      id: 'ingles',
      name: 'Libros de Inglés',
      description: 'Libros para aprender y practicar inglés'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Selecciona una categoría</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category)}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-left"
            >
              <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
              <p className="text-gray-600">{category.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

