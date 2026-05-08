import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    // Fondo global oscuro para toda la app
    <div className="min-h-screen bg-fin-dark-bg font-sans antialiased">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {/* Un Header oscuro y tecnológico para el Dashboard */}
          <nav className="bg-fin-charcoal p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="bg-fin-gradient-main p-2 rounded-lg">F</div>
                <span className="font-extrabold text-2xl tracking-tighter text-white">FINANCIA</span>
                <span className="text-xs text-gray-600 ml-2">v1.0 - Portafolio de Préstamos</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Admin</span>
                <button 
                  onClick={handleLogout}
                  className="text-sm bg-fin-charcoal-light border border-gray-700 px-5 py-2 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                  Cerrar Sesión
                </button>
            </div>
          </nav>
          <Dashboard />
        </>
      )}
    </div>
  );
}

export default App;