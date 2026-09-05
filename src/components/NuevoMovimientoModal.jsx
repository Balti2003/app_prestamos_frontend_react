import { useState } from 'react';
import { X, DollarSign, Tag, ArrowUpCircle, ArrowDownCircle, Save } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const NuevoMovimientoModal = ({ isOpen, onClose, onRefresh }) => {
  const { esAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'egreso',
    monto: '',
    concepto: ''
  });

  // 3. Bloqueo de seguridad: si no está abierto o el usuario no es Administrador, no renderiza nada
  if (!isOpen || !esAdmin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.monto || !formData.concepto) return;

    setLoading(true);
    try {
      await api.post('/caja/', {
        tipo: formData.tipo,
        monto: parseFloat(formData.monto),
        concepto: formData.concepto.trim().toUpperCase()
      });

      if (onRefresh) onRefresh();
      onClose();
      setFormData({ tipo: 'egreso', monto: '', concepto: '' });
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      alert("Error al registrar el movimiento en la caja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-fin-dark-bg/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-fin-charcoal-light w-full max-w-md rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-fin-charcoal/50">
          <h3 className="text-xl font-black italic text-white flex items-center gap-2">
            REGISTRAR MOVIMIENTO
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Selector Tipo de Movimiento */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-fin-dark-bg border border-gray-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: 'ingreso' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${
                formData.tipo === 'ingreso'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <ArrowUpCircle size={16} /> INGRESO
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: 'egreso' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${
                formData.tipo === 'egreso'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <ArrowDownCircle size={16} /> EGRESO
            </button>
          </div>

          {/* Monto */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Monto ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                required
                type="number"
                step="0.01"
                placeholder="Ej: 15000"
                className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-fin-cyan transition-all"
                value={formData.monto}
                onChange={e => setFormData({ ...formData, monto: e.target.value })}
              />
            </div>
          </div>

          {/* Concepto / Motivo */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Concepto / Motivo</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                required
                type="text"
                placeholder="Ej: Pago de Luz / Carga de combustible / Venta de activo"
                className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-fin-cyan transition-all"
                value={formData.concepto}
                onChange={e => setFormData({ ...formData, concepto: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.monto || !formData.concepto}
            className={`w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98] ${
              formData.tipo === 'ingreso'
                ? 'bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg shadow-green-900/30'
                : 'bg-gradient-to-r from-red-600 to-rose-500 shadow-lg shadow-red-900/30'
            }`}
          >
            {loading ? "REGISTRANDO..." : <><Save size={18} /> GUARDAR MOVIMIENTO</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NuevoMovimientoModal;