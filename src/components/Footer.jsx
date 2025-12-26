export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-800 to-slate-900 text-white mt-20 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Libreria Low Cost
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Tu librería de confianza para libros escolares y de inglés. Reserva tus libros favoritos de manera fácil y rápida.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Enlaces rápidos</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="/seleccionar-categoria" className="hover:text-white transition-colors duration-200">
                  Catálogo
                </a>
              </li>
              <li>
                <a href="/cuenta" className="hover:text-white transition-colors duration-200">
                  Mi Cuenta
                </a>
              </li>
              <li>
                <a href="/carrito" className="hover:text-white transition-colors duration-200">
                  Carrito
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Contacto</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contacto@re-libros.com</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+54 11 1234-5678</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 pt-8 text-center">
          <p className="text-slate-400">
            © {new Date().getFullYear()} Libreria Low Cost. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

