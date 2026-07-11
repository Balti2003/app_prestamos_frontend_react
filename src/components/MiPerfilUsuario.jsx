import { useState } from 'react';
import { Shield, KeyRound, Save, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MiPerfilUsuario({ onVolverALaHome }) {
  // Estados para el formulario de contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  
  // Estados de control para la interfaz
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleCambiarPassword = (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    // Validaciones rápidas del frontend
    if (passwordNueva !== passwordConfirmar) {
      setStatus({ type: 'error', message: 'La nueva contraseña y la confirmación no coinciden.' });
      return;
    }
    if (passwordNueva.length < 6) {
      setStatus({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Petición al backend para actualizar credenciales
    fetch('http://localhost:8000/api/usuario/cambiar-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        old_password: passwordActual,
        new_password: passwordNueva
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al cambiar la contraseña');
        return data;
      })
      .then(() => {
        setStatus({ type: 'success', message: '¡Contraseña actualizada con éxito!' });
        setPasswordActual('');
        setPasswordNueva('');
        setPasswordConfirmar('');
      })
      .catch(err => {
        setStatus({ type: 'error', message: err.message });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Botón superior de escape */}
      <button 
        onClick={onVolverALaHome} 
        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors mb-2 focus:outline-none"
      >
        <ArrowLeft size={14} /> Volver al panel principal
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TARJETA DE INFORMACIÓN DEL OPERADOR */}
        <div className="bg-fin-charcoal border border-gray-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 h-fit">
          <div className="w-20 h-20 rounded-2xl bg-fin-violet/10 border border-fin-violet/30 flex items-center justify-center text-fin-violet font-black text-3xl shadow-neon-violet/5">
            BL
          </div>
          <div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Baltasar</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center justify-center gap-1.5">
              <Shield size={12} className="text-fin-cyan" /> Administrador del Sistema
            </p>
          </div>
          <div className="w-full border-t border-gray-800/60 pt-4 text-left space-y-2 text-xs text-gray-400">
            <p>• <span className="font-semibold text-gray-500">Entidad:</span> PrestaYa S.A.</p>
            <p>• <span className="font-semibold text-gray-500">Estado de cuenta:</span> Activo / Conectado</p>
          </div>
        </div>

        {/* PANEL DE ACCIONES: CONFIGURACIÓN DE SEGURIDAD */}
        <div className="lg:col-span-2 bg-fin-charcoal border border-gray-800 rounded-3xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white uppercase italic flex items-center gap-2">
              <KeyRound size={18} className="text-fin-violet" /> Seguridad de la Cuenta
            </h2>
            <p className="text-fin-gray-text text-xs mt-0.5">Actualizá tus credenciales de acceso para proteger el sistema.</p>
          </div>

          {/* Banner de Mensajes de Feedback */}
          {status.type && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-xs border ${
              status.type === 'success' 
                ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                : 'bg-red-500/5 border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <p className="font-semibold">{status.message}</p>
            </div>
          )}

          <form onSubmit={handleCambiarPassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Contraseña Actual</label>
                <input 
                  type="password"
                  required
                  className="w-full bg-gray-900/40 border border-gray-800 rounded-xl py-2.5 px-4 text-white text-sm focus:border-fin-violet outline-none transition-all"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Nueva Contraseña</label>
                <input 
                  type="password"
                  required
                  className="w-full bg-gray-900/40 border border-gray-800 rounded-xl py-2.5 px-4 text-white text-sm focus:border-fin-violet outline-none transition-all"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                <input 
                  type="password"
                  required
                  className="w-full bg-gray-900/40 border border-gray-800 rounded-xl py-2.5 px-4 text-white text-sm focus:border-fin-violet outline-none transition-all"
                  value={passwordConfirmar}
                  onChange={(e) => setPasswordConfirmar(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-fin-violet hover:bg-fin-violet/90 text-white font-black text-xs rounded-xl shadow-neon-violet transition-all disabled:opacity-50"
              >
                <Save size={14} />
                {loading ? 'GUARDANDO...' : 'ACTUALIZAR CREDENCIALES'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}