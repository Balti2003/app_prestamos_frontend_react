import { useState } from 'react';
import { Play, FolderLock, X } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

/* ==========================================
   1. MODAL DE APERTURA DE CAJA
   ========================================== */
export function AperturaCajaModal({ isOpen, onClose, saldoSugerido, onAperturaExitosa }) {
  const { esAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !esAdmin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saldo = e.target.saldo_apertura.value;

    setLoading(true);
    try {
      await api.post('/caja-diaria/abrir_caja/', {
        saldo_apertura: parseFloat(saldo)
      });
      onAperturaExitosa();
    } catch (error) {
      const msg = error.response?.data?.error || "No se pudo abrir la caja.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-fin-charcoal border border-gray-800 p-6 rounded-3xl space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
        
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-white uppercase italic flex items-center justify-center gap-2">
            <Play size={18} className="text-fin-cyan" /> Apertura de Caja Diaria
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Inicia la jornada operativa de hoy</p>
        </div>

        <div className="p-4 bg-gray-900/30 border border-gray-800/80 rounded-2xl text-xs text-gray-400 leading-relaxed">
          • Se registrará tu usuario como operador responsable de la apertura de hoy ({new Date().toLocaleDateString()}).<br/>
          • Verifica que el dinero físico en mano coincida con el saldo sugerido de inicio.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Saldo de Apertura ($)</label>
            <input 
              type="number"
              step="0.01"
              name="saldo_apertura"
              required
              className="w-full bg-gray-900/40 border border-gray-800 rounded-xl py-3 px-4 text-white text-sm font-semibold focus:border-fin-cyan outline-none transition-all"
              defaultValue={saldoSugerido || 0}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-gray-400 font-bold text-xs rounded-xl border border-gray-800 transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-fin-cyan text-black font-black text-xs rounded-xl shadow-neon-cyan transition-all uppercase tracking-widest"
            >
              {loading ? 'ABRIENDO...' : 'Confirmar Apertura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================
   2. MODAL DE ARQUEO Y CIERRE DE CAJA
   ========================================== */
export function ArqueoCierreModal({ isOpen, datosCaja, onClose, onCierreExitoso }) {
  const { esAdmin } = useAuth();
  const [saldoReal, setSaldoReal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !esAdmin) return null;

  const saldoSugerido = datosCaja?.saldo_estimado || 0;
  const diferencia = saldoReal !== '' ? parseFloat(saldoReal) - saldoSugerido : 0;

  const handleCerrarCaja = async (e) => {
    e.preventDefault();
    if (saldoReal === '') return;

    setLoading(true);

    try {
      await api.post(`/caja-diaria/${datosCaja.id}/cerrar_caja/`, {
        saldo_real_fisico: parseFloat(saldoReal),
        observaciones: observaciones,
      });
      onCierreExitoso();
    } catch (error) {
      const msg = error.response?.data?.error || "No se pudo cerrar la caja.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-fin-charcoal border border-gray-800 p-6 rounded-3xl space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-white uppercase italic flex items-center justify-center gap-2">
            <FolderLock size={18} className="text-fin-violet" /> Arqueo y Cierre de Caja
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Rendición de cuentas de la fecha</p>
        </div>

        {/* Resumen contable del sistema */}
        <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-2xl space-y-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>(+) Saldo Inicial:</span>
            <span className="font-semibold text-white">${parseFloat(datosCaja?.saldo_apertura || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>(+) Cobros registrados (Ingresos):</span>
            <span className="font-semibold text-green-400">+${parseFloat(datosCaja?.ingresos_sistema || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>(-) Préstamos entregados (Egresos):</span>
            <span className="font-semibold text-red-400">-${parseFloat(datosCaja?.egresos_sistema || 0).toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-800 pt-2 flex justify-between text-sm text-white font-black">
            <span>Saldo Estimado en Sistema:</span>
            <span>${saldoSugerido.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleCerrarCaja} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Dinero Físico en Mano ($)</label>
            <input 
              type="number"
              step="0.01"
              required
              placeholder="Ej: 32520"
              className="w-full bg-gray-900/40 border border-gray-800 rounded-xl py-3 px-4 text-white text-sm font-semibold focus:border-fin-violet outline-none transition-all"
              value={saldoReal}
              onChange={(e) => setSaldoReal(e.target.value)}
            />
          </div>

          {/* Cálculo de diferencia en vivo */}
          {saldoReal !== '' && (
            <div className={`p-4 rounded-2xl border text-xs flex justify-between font-bold items-center ${
              diferencia === 0 
                ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                : diferencia > 0 
                  ? 'bg-cyan-500/5 border-cyan-500/20 text-fin-cyan'
                  : 'bg-red-500/5 border-red-500/20 text-red-400'
            }`}>
              <span>Diferencia en Caja (Arqueo):</span>
              <span className="text-sm font-black">
                {diferencia === 0 ? 'Sin diferencias (Caja Perfecta)' : `${diferencia > 0 ? '+' : ''}$${diferencia.toLocaleString()}`}
              </span>
            </div>
          )}

          {/* Justificación obligatoria si hay discrepancias */}
          {diferencia !== 0 && saldoReal !== '' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-black text-red-400 uppercase tracking-wider">Justificación de la Diferencia</label>
              <textarea 
                required
                placeholder="Ej: Faltaron $20 de vuelto que se perdonaron a un cliente..."
                rows="2"
                className="w-full bg-gray-900/40 border border-red-500/20 rounded-xl py-2.5 px-4 text-white text-sm focus:border-red-500 outline-none transition-all resize-none"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-gray-400 font-bold text-xs rounded-xl border border-gray-800 transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-fin-violet text-white font-black text-xs rounded-xl shadow-neon-violet transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'CERRANDO...' : 'Cerrar Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}