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
    <div>
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <span className="font-bold text-xl text-blue-600">Financiera App</span>
        <button 
          onClick={handleLogout}
          className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Cerrar Sesión
        </button>
      </nav>
      <Dashboard />
    </div>
  );
}

export default App;