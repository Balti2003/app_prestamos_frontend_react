import { useState } from 'react';
import api from '../api';
import Brand from './Brand';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/token/', { username, password });
      localStorage.setItem('token', response.data.access);
      onLogin();
    } catch {
      setError('Las credenciales ingresadas son incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-fin-dark-bg text-white w-full">
      {/* Columna Izquierda: Imagen y Bienvenida */}
      <div 
        className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop')" }}
      >
        {/* Overlay oscuro para legibilidad del texto */}
        <div className="absolute inset-0 bg-fin-dark-bg/80 backdrop-blur-sm"></div>

        <div className="relative z-10">
          <Brand size="lg" />
          
          <div className="mt-12">
            {/* Un pequeño detalle indicador arriba del título */}
            <div className="flex items-center gap-2 mb-4">
              <span className="h-[1px] w-8 bg-fin-cyan"></span>
              <p className="text-xs font-bold tracking-[0.3em] text-fin-cyan uppercase opacity-80">
                Plataforma Operativa
              </p>
            </div>

            <h2 className="text-5xl font-light leading-[1.1] tracking-tighter text-white">
              BIENVENIDO A TU<br/>
              SISTEMA DE<br/>
              <span className="text-7xl font-black text-gradient-fin">
                PRÉSTAMOS.
              </span>
            </h2>

            <p className="mt-6 text-lg text-gray-400 max-w-md leading-relaxed border-l-2 border-fin-violet/30 pl-6">
              Gestión inteligente de cartera, cobros y rentabilidad con precisión quirúrgica.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-sm text-gray-500">
          <span>Términos y Condiciones</span>
          <span>Soporte Técnico</span>
          <span>Financia-Soft v1.0</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-fin-charcoal">
        <div className="w-full max-w-md bg-fin-charcoal-light p-10 rounded-3xl shadow-fin-card border border-gray-800">
          <div className="mb-10 text-center flex flex-col items-center">
            {/* Logo secundario para móvil */}
            <div className="lg:hidden mb-6"><Brand /></div>
            
            <h3 className="text-3xl font-extrabold tracking-tight text-white mb-2">LOGIN</h3>
            <p className="text-fin-gray-text">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-950/40 rounded-xl border border-red-800 text-red-300 text-sm">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField 
                icon={<User/>} 
                type="text" 
                placeholder="Nombre de Usuario" 
                value={username} 
                onChange={setUsername} 
            />
            
            <InputField 
                icon={<Lock/>} 
                type="password" 
                placeholder="Contraseña" 
                value={password} 
                onChange={setPassword} 
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-fin-gradient-main text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed group shadow-neon-cyan"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  INGRESAR
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente pequeño para los inputs para no repetir código
const InputField = ({ icon, type, placeholder, value, onChange }) => (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500">{icon}</div>
      <input
        className="w-full pl-12 pr-4 py-4 bg-fin-charcoal rounded-xl border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-fin-violet focus:ring-1 focus:ring-fin-violet focus:shadow-neon-violet transition-all text-base"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
);

export default Login;