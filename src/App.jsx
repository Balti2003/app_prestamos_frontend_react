import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => setIsLoggedIn(true);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Opcional: recargar la página para limpiar estados de memoria
    window.location.reload(); 
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
          <Dashboard onLogout={handleLogout} />
        </>
      )}
    </div>
  );
}

export default App;