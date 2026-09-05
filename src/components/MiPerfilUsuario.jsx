import { useState } from 'react';
import { Shield, KeyRound, Save, ArrowLeft, CheckCircle2, AlertCircle, UserPlus, Users } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import CrearOperadorModal from './CrearOperadorModal';

export default function MiPerfilUsuario({ onVolverALaHome }) {
  const { user, esAdmin } = useAuth();
  
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  
  const [statusPassword, setStatusPassword] = useState({ type: null, message: '' });
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [statusOperador, setStatusOperador] = useState(null);
  const [modalOperadorOpen, setModalOperadorOpen] = useState(false);

  const obtenerIniciales = () => {
    if (!user) return 'US';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username ? user.username.slice(0, 2).toUpperCase() : 'US';
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setStatusPassword({ type: null, message: '' });

    if (passwordNueva !== passwordConfirmar) {
      setStatusPassword({ type: 'error', message: 'La nueva contraseña y la confirmación no coinciden.' });
      return;
    }
    if (passwordNueva.length < 6) {
      setStatusPassword({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setLoadingPassword(true);

    try {
      await api.post('/usuario/cambiar-password/', {
        old_password: passwordActual,
        new_password: passwordNueva,
      });

      setStatusPassword({ type: 'success', message: '¡Contraseña actualizada con éxito!' });
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al cambiar la contraseña';
      setStatusPassword({ type: 'error', message: errorMsg });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleOperadorCreadoExito = () => {
    setStatusOperador('¡Nuevo operador creado y configurado con éxito!');
    setTimeout(() => {
      setStatusOperador(null);
    }, 4000);
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
        
        {/* TARJETA DE INFORMACIÓN DEL OPERADOR / ADMIN */}
        <div className="bg-fin-charcoal border border-gray-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 h-fit">
          <div className="w-20 h-20 rounded-2xl bg-fin-violet/10 border border-fin-violet/30 flex items-center justify-center text-fin-violet font-black text-3xl shadow-neon-violet/5">
            {obtenerIniciales()}
          </div>
          <div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'Usuario'}
            </h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center justify-center gap-1.5">
              <Shield size={12} className={esAdmin ? "text-fin-cyan" : "text-amber-400"} /> 
              {esAdmin ? 'Administrador del Sistema' : 'Operador de Campo'}
            </p>
          </div>
          <div className="w-full border-t border-gray-800/60 pt-4 text-left space-y-2 text-xs text-gray-400">
            <p>• <span className="font-semibold text-gray-500">Usuario:</span> {user?.username}</p>
            <p>• <span className="font-semibold text-gray-500">Email:</span> {user?.email || 'Sin correo registrado'}</p>
            <p>• <span className="font-semibold text-gray-500">Estado de cuenta:</span> Activo / Conectado</p>
          </div>
        </div>

        {/* PANEL DE ACCIONES */}
        <div className="lg:col-span-2 space-y-6">

          {/* GESTIÓN DE EQUIPO (SOLO ADMINISTRADOR) */}
          {esAdmin && (
            <div className="bg-fin-charcoal border border-fin-violet/30 rounded-3xl p-6 relative overflow-hidden space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users size={20} className="text-fin-cyan" />
                    <h2 className="text-lg font-black tracking-tight text-white uppercase italic">
                      Gestión de Operadores
                    </h2>
                  </div>
                  <p className="text-fin-gray-text text-xs mt-1">
                    Crea cuentas de acceso para operadores y define sus permisos específicos en el sistema.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOperadorOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-fin-violet to-fin-cyan hover:opacity-90 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-neon-cyan transition-all flex-shrink-0"
                >
                  <UserPlus size={16} />
                  Nuevo Operador
                </button>
              </div>

              {statusOperador && (
                <div className="p-3.5 rounded-xl flex items-center gap-3 text-xs border bg-green-500/10 border-green-500/20 text-green-400 animate-in fade-in zoom-in-95 duration-200">
                  <CheckCircle2 size={16} className="flex-shrink-0" />
                  <p className="font-semibold">{statusOperador}</p>
                </div>
              )}
            </div>
          )}

          {/* CONFIGURACIÓN DE SEGURIDAD */}
          <div className="bg-fin-charcoal border border-gray-800 rounded-3xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                <KeyRound size={18} className="text-fin-violet" /> Seguridad de la Cuenta
              </h2>
              <p className="text-fin-gray-text text-xs mt-0.5">Actualizá tus credenciales de acceso para proteger el sistema.</p>
            </div>

            {statusPassword.type && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-xs border ${
                statusPassword.type === 'success' 
                  ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                  : 'bg-red-500/5 border-red-500/20 text-red-400'
              }`}>
                {statusPassword.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <p className="font-semibold">{statusPassword.message}</p>
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
                  disabled={loadingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 bg-fin-violet hover:bg-fin-violet/90 text-white font-black text-xs rounded-xl shadow-neon-violet transition-all disabled:opacity-50"
                >
                  <Save size={14} />
                  {loadingPassword ? 'GUARDANDO...' : 'ACTUALIZAR CREDENCIALES'}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>

      {esAdmin && (
        <CrearOperadorModal
          isOpen={modalOperadorOpen}
          onClose={() => setModalOperadorOpen(false)}
          onSuccess={handleOperadorCreadoExito}
        />
      )}

    </div>
  );
}