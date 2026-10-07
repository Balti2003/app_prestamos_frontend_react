import { useState } from 'react';
import { X, Building2, User, Mail, CreditCard, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api';

export default function RegistroModal({ isOpen, onClose, planSeleccionado, onIrAlLogin }) {
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    cuit_rut: '',
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [datosCreados, setDatosCreados] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre_empresa: formData.nombre_empresa,
        cuit_rut: formData.cuit_rut,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        plan_id: planSeleccionado?.id || 'plan_basico'
      };

      const res = await api.post('/registro-empresa/', payload);
      setDatosCreados(res.data);
      setRegistroExitoso(true);
    } catch (err) {
      console.error('Error en registro:', err);
      const serverMsg = err.response?.data?.error || 'No se pudo completar el registro. Verifica los datos.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarYLogin = () => {
    setRegistroExitoso(false);
    onClose();
    onIrAlLogin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-fin-charcoal border border-gray-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-2 rounded-xl bg-gray-900/60 border border-gray-800"
        >
          <X size={18} />
        </button>

        {registroExitoso ? (
          /* PANTALLA DE ÉXITO INTEGRADA EN LA WEB */
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto shadow-lg shadow-green-500/5">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-fin-cyan">¡Cuenta Configurada!</span>
              <h3 className="text-2xl font-black text-white italic mt-1">¡Bienvenido a PrestaYa!</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Tu espacio de trabajo para <strong className="text-white">{datosCreados?.empresa?.nombre || formData.nombre_empresa}</strong> ha sido creado exitosamente.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 text-left text-xs space-y-1.5 text-gray-300">
              <p><span className="text-gray-500 font-bold">Usuario:</span> @{formData.username}</p>
              <p><span className="text-gray-500 font-bold">Rol:</span> Administrador</p>
              <p><span className="text-gray-500 font-bold">Plan:</span> {planSeleccionado?.nombre || 'Independiente'}</p>
            </div>

            <button
              onClick={handleCerrarYLogin}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-fin-violet to-fin-cyan text-white text-xs font-black uppercase tracking-wider shadow-neon-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              Iniciar Sesión Ahora <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* FORMULARIO DE REGISTRO */
          <>
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-fin-cyan px-2.5 py-1 rounded-full bg-fin-cyan/10 border border-fin-cyan/20">
                {planSeleccionado?.nombre || 'Plan Seleccionado'}
              </span>
              <h3 className="text-2xl font-black text-white italic mt-2">Creá tu cuenta de negocio</h3>
              <p className="text-xs text-gray-400 mt-1">
                Configuración inicial de tu espacio de trabajo y usuario administrador.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nombre de la Empresa o Financiera</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-3 text-gray-500" />
                  <input
                    type="text"
                    name="nombre_empresa"
                    required
                    placeholder="Ej. Financiera del Centro o Juan Pérez Préstamos"
                    value={formData.nombre_empresa}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-fin-cyan outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">CUIT / RUT o Identificación Fiscal (Opcional)</label>
                <input
                  type="text"
                  name="cuit_rut"
                  placeholder="Ej. 30-12345678-9"
                  value={formData.cuit_rut}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-fin-cyan outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    placeholder="Carlos"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-fin-cyan outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    placeholder="Gómez"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-fin-cyan outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Correo Electrónico</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="contacto@financiera.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-fin-cyan outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nombre de Usuario para Acceder</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-gray-500" />
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="carlos_admin"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-fin-cyan outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-sm text-white focus:border-fin-cyan outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Confirmar</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-sm text-white focus:border-fin-cyan outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-fin-violet to-fin-cyan text-white text-xs font-black uppercase tracking-wider shadow-neon-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard size={16} />
                {loading ? 'CREANDO CUENTA...' : `CONTINUAR AL PAGO (${planSeleccionado?.precio || ''})`}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}