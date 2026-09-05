import { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Percent, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Wallet, 
  ArrowRightLeft, 
  CreditCard, 
  Edit3,
  Download
} from 'lucide-react';
import api from '../api';

const NuevoPrestamoModal = ({ isOpen, onClose, onRefresh }) => {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    cliente: '',
    monto_solicitado: '',
    tasa_interes: '20',
    cantidad_cuotas: '4',
    frecuencia: 'semanal',
    fecha_inicio: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    metodo_pago_detalle: ''
  });
  const [loading, setLoading] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState(null);
  const [prestamoCreado, setPrestamoCreado] = useState(null); // 👈 Guarda el préstamo creado

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/immutability
      fetchClientes();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        cliente: '',
        monto_solicitado: '',
        tasa_interes: '20',
        cantidad_cuotas: '4',
        frecuencia: 'semanal',
        fecha_inicio: new Date().toISOString().split('T')[0],
        metodo_pago: 'efectivo',
        metodo_pago_detalle: ''
      });
      setError(null);
      setPrestamoCreado(null);
    }
  }, [isOpen]);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes/todos/');
      setClientes(res.data);
    } catch {
      console.error("Error al cargar clientes");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const monto = parseFloat(formData.monto_solicitado) || 0;
  const tasa = parseFloat(formData.tasa_interes) || 0;
  const cuotas = parseInt(formData.cantidad_cuotas) || 1;

  const totalPagar = monto + (monto * (tasa / 100));
  const valorCuota = cuotas > 0 ? totalPagar / cuotas : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente) {
      setError("Debe seleccionar un cliente.");
      return;
    }
    if (monto <= 0) {
      setError("El monto solicitado debe ser mayor a 0.");
      return;
    }
    if (formData.metodo_pago === 'otro' && !formData.metodo_pago_detalle.trim()) {
      setError("Debe especificar la descripción de la forma de pago.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/prestamos/', {
        cliente: formData.cliente,
        monto_solicitado: monto,
        tasa_interes: tasa,
        cuotas_totales: cuotas,
        cantidad_cuotas: cuotas,
        frecuencia: formData.frecuencia,
        fecha_inicio: formData.fecha_inicio,
        metodo_pago: formData.metodo_pago,
        metodo_pago_detalle: formData.metodo_pago_detalle.trim()
      });

      if (onRefresh) onRefresh();
      setPrestamoCreado(res.data); // 👈 Muestra pantalla de confirmación con descarga
    } catch (err) {
      console.error("Error completo del servidor:", err.response?.data);
      const data = err.response?.data;
      let errorMsg = "Error al originar el préstamo.";

      if (typeof data === 'object' && data !== null) {
        errorMsg = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarComprobante = async () => {
    if (!prestamoCreado?.id) return;
    try {
      setDescargando(true);
      const response = await api.get(`/prestamos/${prestamoCreado.id}/comprobante-desembolso/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Comprobante_Desembolso_Prestamo_${prestamoCreado.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("No se pudo generar el comprobante de desembolso.");
    } finally {
      setDescargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-fin-dark-bg/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-fin-charcoal w-full max-w-xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        
        {/* Encabezado */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-fin-charcoal-light/40">
          <h3 className="text-xl font-black italic text-white flex items-center gap-2">
            <FileText className="text-fin-violet" /> {prestamoCreado ? "CONTRATO ORIGINADO" : "NUEVO PRÉSTAMO"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Pantalla de Éxito y Descarga */}
        {prestamoCreado ? (
          <div className="p-8 text-center flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-neon-green">
              <CheckCircle2 size={40} />
            </div>

            <h3 className="text-2xl font-black text-white mb-2 uppercase italic">¡Préstamo #{prestamoCreado.id} Creado!</h3>
            <p className="text-gray-400 text-xs mb-8 max-w-md">
              El plan de cuotas fue calculado y los fondos quedaron asentados contablemente. Ya podés imprimir el comprobante de desembolso para la firma del prestatario.
            </p>

            <div className="flex flex-col w-full gap-3">
              <button
                type="button"
                onClick={handleDescargarComprobante}
                disabled={descargando}
                className="w-full bg-gradient-to-r from-fin-violet to-fin-cyan text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-neon-violet hover:opacity-90 transition-all disabled:opacity-50"
              >
                {descargando ? (
                  <span className="animate-pulse">GENERANDO PDF...</span>
                ) : (
                  <><Download size={18} /> DESCARGAR COMPROBANTE DE DESEMBOLSO</>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-fin-dark-bg border border-gray-800 text-gray-400 py-3 rounded-xl font-bold hover:text-white transition-all text-xs"
              >
                FINALIZAR Y CERRAR
              </button>
            </div>
          </div>
        ) : (
          /* Formulario */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold">
                {error}
              </div>
            )}

            {/* Selector de Cliente */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Cliente</label>
              <select
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                required
                className="w-full bg-fin-dark-bg border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-fin-violet transition-colors"
              >
                <option value="">Seleccione un cliente titular...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido} - DNI: {c.dni}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monto Solicitado */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Monto Solicitado ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    name="monto_solicitado"
                    placeholder="0.00"
                    value={formData.monto_solicitado}
                    onChange={handleChange}
                    required
                    min="1"
                    step="any"
                    className="w-full bg-fin-dark-bg border border-gray-700 rounded-xl py-2.5 pl-8 pr-3 text-xs font-mono font-bold text-white outline-none focus:border-fin-violet"
                  />
                </div>
              </div>

              {/* Tasa de Interés */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Tasa de Recargo (%)</label>
                <div className="relative">
                  <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    name="tasa_interes"
                    value={formData.tasa_interes}
                    onChange={handleChange}
                    required
                    min="0"
                    step="any"
                    className="w-full bg-fin-dark-bg border border-gray-700 rounded-xl py-2.5 pl-8 pr-3 text-xs font-mono font-bold text-white outline-none focus:border-fin-violet"
                  />
                </div>
              </div>

              {/* Cantidad de Cuotas */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Cantidad de Cuotas</label>
                <input
                  type="number"
                  name="cantidad_cuotas"
                  value={formData.cantidad_cuotas}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full bg-fin-dark-bg border border-gray-700 rounded-xl py-2.5 px-3 text-xs font-mono font-bold text-white outline-none focus:border-fin-violet"
                />
              </div>

              {/* Frecuencia */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Frecuencia de Cobro</label>
                <select
                  name="frecuencia"
                  value={formData.frecuencia}
                  onChange={handleChange}
                  className="w-full bg-fin-dark-bg border border-gray-700 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-fin-violet"
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
            </div>

            {/* Fecha Inicio */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Fecha de Inicio / Primer Vencimiento</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  required
                  className="w-full bg-fin-dark-bg border border-gray-700 rounded-xl py-2.5 pl-8 pr-3 text-xs text-white outline-none focus:border-fin-violet"
                />
              </div>
            </div>

            {/* Forma de Pago Pactada */}
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                Forma de Pago Pactada
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'efectivo' }))}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border ${
                    formData.metodo_pago === 'efectivo'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-lg'
                      : 'bg-fin-dark-bg text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  <Wallet size={14} />
                  <span>Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'transferencia' }))}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border ${
                    formData.metodo_pago === 'transferencia'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-lg'
                      : 'bg-fin-dark-bg text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  <ArrowRightLeft size={14} />
                  <span>Transferencia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'otro' }))}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border ${
                    formData.metodo_pago === 'otro'
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-lg'
                      : 'bg-fin-dark-bg text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  <CreditCard size={14} />
                  <span>Otro</span>
                </button>
              </div>

              {formData.metodo_pago === 'otro' && (
                <div className="pt-1.5 animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Edit3 size={11} className="text-purple-400" /> Descripción de la modalidad acordada
                  </label>
                  <input
                    type="text"
                    name="metodo_pago_detalle"
                    placeholder="Ej: Cheque diferido 30 días, Dólares billete, Canje..."
                    value={formData.metodo_pago_detalle}
                    onChange={handleChange}
                    required
                    className="w-full bg-fin-dark-bg border border-purple-500/40 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Resumen */}
            {monto > 0 && (
              <div className="p-4 bg-fin-dark-bg/60 border border-gray-800 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Total a Devolver:</span>
                  <span className="font-mono font-bold text-white">${totalPagar.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Monto por Cuota:</span>
                  <span className="font-mono font-bold text-fin-cyan">${valorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-fin-dark-bg border border-gray-700 text-gray-400 py-3 rounded-xl text-xs font-bold hover:text-white transition-all"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-gradient-to-r from-fin-violet to-fin-cyan text-white py-3 rounded-xl text-xs font-black shadow-neon-violet flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? "CREANDO..." : <><CheckCircle2 size={16} /> CREAR PRÉSTAMO</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NuevoPrestamoModal;