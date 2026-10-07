import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import RegistroModal from './components/RegistroModal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState(() => {
    // Si viene de un logout previo, mantener login; si es primera carga, landing
    return localStorage.getItem('last_action') === 'logout' ? 'login' : 'landing';
  });
  const [registroModalOpen, setRegistroModalOpen] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);

  const handleLogin = () => {
    localStorage.removeItem('last_action');
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    localStorage.setItem('last_action', 'logout');
    setIsLoggedIn(false);
    setCurrentView('login'); // Redirige directamente al Login al salir
  };

  const handleSelectPlan = (plan) => {
    setPlanSeleccionado(plan);
    setRegistroModalOpen(true);
  };

  // Si ya tiene sesión activa, entra directo al Dashboard
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-fin-dark-bg font-sans antialiased">
        <Dashboard onLogout={handleLogout} />
      </div>
    );
  }

  // Si no está autenticado, navega entre Landing y Login
  return (
    <div className="min-h-screen bg-fin-dark-bg font-sans antialiased">
      {currentView === 'landing' ? (
        <>
          <LandingPage 
            onGoToLogin={() => setCurrentView('login')} 
            onSelectPlan={handleSelectPlan}
          />
          <RegistroModal 
            isOpen={registroModalOpen}
            onClose={() => setRegistroModalOpen(false)}
            planSeleccionado={planSeleccionado}
            onIrAlLogin={() => setCurrentView('login')}
          />
        </>
      ) : (
        <div className="relative">
          {/* Botón para regresar a la Landing desde el Login */}
          <button 
            onClick={() => {
              localStorage.removeItem('last_action');
              setCurrentView('landing');
            }}
            className="absolute top-6 left-6 z-50 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider bg-fin-charcoal px-4 py-2 rounded-xl border border-gray-800 transition-colors"
          >
            ← Volver a la web
          </button>
          <Login onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
}

export default App;