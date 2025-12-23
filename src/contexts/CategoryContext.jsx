import { createContext, useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const CategoryContext = createContext(null);

export const CategoryProvider = ({ children }) => {
  const { categoria } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(categoria || null);

  useEffect(() => {
    if (categoria) {
      setSelectedCategory(categoria);
    }
  }, [categoria]);

  return (
    <CategoryContext.Provider value={{ categoria: selectedCategory, setCategoria: setSelectedCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory debe usarse dentro de CategoryProvider');
  }
  return context;
};

