import { useState } from 'react';
import api from '../api';
import { User, Lock, ArrowRight, Zap } from 'lucide-react';

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
      onLogin(); // Avisamos a la App que ya estamos dentro
    } catch (err) {
      setError('Credenciales incorrectas o error de conexión', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-fin-dark-bg text-white">
      {/* Columna Izquierda: Arte y Bienvenida (Estilo Imagen 3) */}
      <div className="hidden lg:flex lg:w-1/2 bg-fin-gradient-main p-12 flex-col justify-between relative overflow-hidden">
        {/* Arte Fluido (Simulado con degradados y opacidad) */}
        <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-fin-cyan rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -right-20 w-96 h-96 bg-fin-violet rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-1/4 w-60 h-60 bg-white rounded-full blur-2xl opacity-30"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-8 w-8 text-fin-cyan" />
            <h1 className="text-3xl font-black tracking-tighter">FINANCIA</h1>
          </div>
          <h2 className="text-5xl font-extrabold leading-tight tracking-tight mb-4">
            WELCOME TO <span className="text-fin-cyan">FINANCIA,</span><br/> YOUR PARTNER IN SECURE LOANS
          </h2>
          <p className="text-lg text-blue-100 opacity-90 max-w-md">
            Managing your portfolio with speed and precision. Secure your future today.
          </p>
          <a href="#" className="inline-block mt-6 text-fin-cyan font-semibold border-b-2 border-fin-cyan pb-1 hover:text-white hover:border-white transition-colors">Learn more</a>
        </div>

        <div className="relative z-10 flex gap-6 text-sm text-blue-100 opacity-70">
            <span>Information</span>
            <span>About the Platform</span>
            <span>Contact Us</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario (Estilo Imagen 3) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-fin-charcoal">
        <div className="w-full max-w-md bg-fin-charcoal-light p-10 rounded-3xl shadow-fin-card border border-gray-800">
          <div className="mb-10 text-center">
            <h3 className="text-3xl font-bold tracking-tight text-white mb-2">SECURE ACCESS</h3>
            <p className="text-fin-gray-text">Enter credentials to access your secure dashboard</p>
          </div>

          {error && <p className="text-red-400 text-sm mb-6 text-center p-3 bg-red-950/50 rounded-lg border border-red-800">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-fin-charcoal rounded-xl border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-fin-violet focus:ring-1 focus:ring-fin-violet focus:shadow-neon-violet transition-all"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-fin-charcoal rounded-xl border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-fin-violet focus:ring-1 focus:ring-fin-violet focus:shadow-neon-violet transition-all"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-fin-gradient-main text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  AUTHORIZE ACCESS
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-800 text-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-fin-charcoal-light text-gray-600 uppercase font-bold">OR</span></div>
                </div>
                <button className="w-full bg-fin-charcoal py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors">
                    ACCESS WITH ANOTHER METHOD
                </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;