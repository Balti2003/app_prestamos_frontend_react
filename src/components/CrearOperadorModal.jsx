import { useState } from 'react';
import { X, UserPlus, Shield, Check, User } from 'lucide-react';
import api from '../api';

const PERMISOS_DISPONIBLES = [
  { id: 'puede_crear_prestamo', label: 'Crear nuevos préstamos', desc: 'Permite simular y originar créditos.' },
  { id: 'puede_cobrar_cuota', label: 'Cobrar cuotas', desc: 'Permite asentar cobros en cascada o cuotas fijas.' },
  { id: 'puede_crear_cliente', label: 'Registrar nuevos clientes', desc: 'Acceso al modal de alta de prestatarios.' },
  { id: 'puede_editar_cliente', label: 'Editar datos de clientes', desc: 'Modificar teléfonos, domicilios y nombres.' },
  { id: 'puede_eliminar_cliente', label: 'Eliminar clientes', desc: 'Borrar clientes sin préstamos vigentes.' },
  { id: 'puede_ver_caja', label: 'Ver movimientos de caja', desc: 'Visualizar ingresos, egresos y balances.' },
  { id: 'puede_ver_metricas', label: 'Ver métricas y rentabilidad', desc: 'Acceso a ganancias y estadísticas de negocio.' },
];

export default function CrearOperadorModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const [permisos, setPermisos] = useState({
    puede_crear_prestamo: true,
    puede_cobrar_cuota: true,
    puede_crear_cliente: true,
    puede_editar_cliente: false,
    puede_eliminar_cliente: false,
    puede_ver_caja: false,
    puede_ver_metricas: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const togglePermiso = (permisoId) => {
    setPermisos(prev => ({
      ...prev,
      [permisoId]: !prev[permisoId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/crear-operador/', {
        ...formData,
        ...permisos
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.username?.[0] || err.response?.data?.detail || "Error al crear el operador.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-fin-dark-bg/80 backdrop-blur-sm">
      <div className="bg-fin-charcoal-light w-full max-w-2xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-fin-charcoal/50">
          <h3 className="text-xl font-black italic text-white flex items-center gap-2">
            <UserPlus className="text-fin-cyan" /> NUEVO OPERADOR DEL SISTEMA
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Datos Personales */}
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <User size={14} className="text-fin-cyan" /> Credenciales de Acceso
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombre"
                required
                className="bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan"
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Apellido"
                required
                className="bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan"
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Usuario (Login)"
                required
                className="bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
              <input
                type="password"
                placeholder="Contraseña inicial"
                required
                className="bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email (Opcional)"
                className="bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan md:col-span-2"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Selector de Permisos Granulares */}
          <div className="border-t border-gray-800 pt-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Shield size={14} className="text-violet-400" /> Permisos y Restricciones de Acceso
            </p>

            <div className="space-y-2">
              {PERMISOS_DISPONIBLES.map((p) => {
                const activo = permisos[p.id];
                return (
                  <div
                    key={p.id}
                    onClick={() => togglePermiso(p.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      activo 
                        ? 'bg-fin-violet/10 border-fin-violet/40 text-white' 
                        : 'bg-fin-charcoal/40 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${activo ? 'text-white' : 'text-gray-300'}`}>
                        {p.label}
                      </p>
                      <p className="text-[11px] text-gray-500">{p.desc}</p>
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      activo 
                        ? 'bg-fin-violet border-fin-violet text-white shadow-neon-cyan' 
                        : 'border-gray-700 bg-gray-800/40 text-transparent'
                    }`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fin-violet to-fin-cyan text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 hover:opacity-90 shadow-neon-cyan transition-all disabled:opacity-50"
          >
            {loading ? "CREANDO OPERADOR..." : <><UserPlus size={18} /> CREAR OPERADOR CON ESTOS PERMISOS</>}
          </button>
        </form>
      </div>
    </div>
  );
}