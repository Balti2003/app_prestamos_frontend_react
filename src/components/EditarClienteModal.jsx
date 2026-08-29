import { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import api from '../api';

const EditarClienteModal = ({ isOpen, onClose, cliente, onRefresh }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    direccion: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        dni: cliente.dni || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || ''
      });
    }
  }, [cliente]);

  if (!isOpen || !cliente) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/clientes/${cliente.id}/`, formData);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-fin-dark-bg/90 backdrop-blur-md">
      <div className="bg-fin-charcoal-light w-full max-w-md rounded-3xl border border-gray-800 p-6 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition">
          <X size={20} />
        </button>
        <h3 className="text-xl font-black italic text-white mb-4 flex items-center gap-2">
          <UserCheck className="text-fin-cyan" size={22} /> EDITAR CLIENTE
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan transition-all mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan transition-all mt-1"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">DNI / CUIL</label>
            <input
              type="text"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              className="w-full bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan transition-all mt-1 font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Teléfono Celular (WhatsApp)</label>
            <input
              type="text"
              placeholder="Ej: 3534123456"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan transition-all mt-1 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Dirección Registrada (Google Maps)</label>
            <input
              type="text"
              placeholder="Ej: Bv. Sarmiento 450 (o Calle 123, Ciudad)"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full bg-fin-charcoal border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fin-cyan transition-all mt-1"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              * Ingresa calle y número para ubicación exacta.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-fin-violet to-fin-cyan text-white font-black py-3.5 rounded-xl hover:opacity-90 shadow-neon-cyan flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <UserCheck size={18} /> {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditarClienteModal;