import React, { useState, useEffect } from 'react';
import { X, FilePlus, DollarSign, Calendar, Percent, Users, Save, CheckCircle2, FileText } from 'lucide-react';
import api from '../api';

const NuevoPrestamoModal = ({ isOpen, onClose, onRefresh, onDescargarComprobante }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prestamoCreado, setPrestamoCreado] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    monto: '',
    tasa_interes: '20',
    cuotas: '1',
    frecuencia: 'mensual'
  });

  // Cargar clientes para el buscador
  useEffect(() => {
    if (isOpen) {
      const fetchClientes = async () => {
        try {
          const res = await api.get('/clientes/');
          setClientes(res.data);
        } catch { console.error("Error cargando clientes"); }
      };
      fetchClientes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Cierre limpio de todo el modal
  const handleCerrarTodo = () => {
    setPrestamoCreado(null);
    setFormData({ cliente: '', monto: '', tasa_interes: '20', cuotas: '1', frecuencia: 'mensual' });
    onClose();
    if (onRefresh) onRefresh();
  };

  // Cálculos en tiempo real
  const montoNum = parseFloat(formData.monto) || 0;
  const tasaNum = parseFloat(formData.tasa_interes) || 0;
  const cuotasNum = parseInt(formData.cuotas) || 1;
  
  const totalDevolver = montoNum + (montoNum * (tasaNum / 100));
  const valorCuota = totalDevolver / cuotasNum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const hoy = new Date().toISOString().split('T')[0];

    const payload = {
        cliente: parseInt(formData.cliente),
        monto_solicitado: parseFloat(formData.monto),
        tasa_interes: parseFloat(formData.tasa_interes),
        cuotas_totales: parseInt(formData.cuotas),  
        frecuencia: formData.frecuencia.toLowerCase(),
        fecha_inicio: hoy
    };

    try {
        const response = await api.post('/prestamos/', payload);

        // Si se crea con éxito, activamos la vista de confirmación en lugar de usar confirm()
        if (response.data && response.data.id) {
          setPrestamoCreado(response.data);
        } else {
          handleCerrarTodo();
        }

    } catch (err) {
        if (err.response && err.response.data) {
            console.error("Error detallado:", err.response.data);
            const firstError = Object.values(err.response.data)[0];
            alert("Error: " + firstError);
        } else {
            alert("Error al conectar con el servidor");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-fin-dark-bg/80 backdrop-blur-sm" onClick={handleCerrarTodo}></div>

      <div className="relative bg-fin-charcoal-light w-full max-w-2xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* VISTA 1: CONFIRMACIÓN Y DESCARGA (REEMPLAZA AL WINDOW.CONFIRM) */}
        {prestamoCreado ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase italic">
                ¡Préstamo Otorgado con Éxito!
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Se ha generado el contrato <span className="text-fin-violet font-mono font-bold">#{prestamoCreado.id}</span> correctamente.
              </p>
            </div>

            <div className="bg-fin-charcoal border border-gray-800 p-4 rounded-2xl text-left text-xs space-y-2.5 max-w-sm mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Monto Otorgado:</span>
                <span className="text-white font-bold font-mono">${parseFloat(prestamoCreado.monto_solicitado || formData.monto).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Plan de Pagos:</span>
                <span className="text-fin-cyan font-bold">{prestamoCreado.cuotas_totales || formData.cuotas} cuotas de ${valorCuota.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={async () => {
                  if (onDescargarComprobante) {
                    await onDescargarComprobante(prestamoCreado.id);
                  }
                  handleCerrarTodo();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-fin-violet to-fin-cyan text-white font-black py-3.5 px-4 rounded-xl text-xs transition-all shadow-neon-violet hover:opacity-90 active:scale-[0.98]"
              >
                <FileText size={16} />
                DESCARGAR COMPROBANTE PDF
              </button>

              <button
                type="button"
                onClick={handleCerrarTodo}
                className="bg-fin-charcoal hover:bg-gray-800 text-gray-300 font-bold py-3.5 px-4 rounded-xl text-xs transition-all border border-gray-700"
              >
                FINALIZAR
              </button>
            </div>
          </div>
        ) : (
          /* VISTA 2: FORMULARIO NORMAL DE EMISIÓN */
          <>
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-fin-charcoal/50">
              <h3 className="text-xl font-black italic text-white flex items-center gap-2">
                <FilePlus className="text-fin-violet" /> EMITIR NUEVO PRÉSTAMO
              </h3>
              <button onClick={handleCerrarTodo} className="text-gray-500 hover:text-white transition"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Selección de Cliente */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Seleccionar Cliente</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-violet" size={18} />
                  <select 
                    required
                    className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-fin-violet transition-all appearance-none"
                    value={formData.cliente}
                    onChange={e => setFormData({...formData, cliente: e.target.value})}
                  >
                    <option value="">Buscar por nombre...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} {c.apellido} - DNI: {c.dni}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Monto y Tasa */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Monto a Entregar</label>
                <ModalInput icon={<DollarSign />} type="number" placeholder="Ej: 50000" 
                  value={formData.monto} onChange={v => setFormData({...formData, monto: v})} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tasa de Interés (%)</label>
                <ModalInput icon={<Percent />} type="number" placeholder="Ej: 20" 
                  value={formData.tasa_interes} onChange={v => setFormData({...formData, tasa_interes: v})} />
              </div>

              {/* Cuotas y Frecuencia */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Cantidad de Cuotas</label>
                <ModalInput icon={<Calendar />} type="number" placeholder="Ej: 6" 
                  value={formData.cuotas} onChange={v => setFormData({...formData, cuotas: v})} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Frecuencia de Cobro</label>
                <select 
                  className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-3.5 px-4 text-white outline-none focus:border-fin-violet transition-all"
                  value={formData.frecuencia}
                  onChange={e => setFormData({...formData, frecuencia: e.target.value})}
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>

              {/* PANEL DE PREVISIÓN (Calculadora) */}
              <div className="md:col-span-2 bg-fin-dark-bg/50 border border-fin-violet/20 rounded-2xl p-6 mt-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-400">RESUMEN DEL PRÉSTAMO</span>
                  <span className="text-[10px] bg-fin-violet/20 text-fin-violet px-2 py-1 rounded font-black tracking-tighter">PREVISIÓN</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Total a cobrar</p>
                    <p className="text-2xl font-black text-fin-cyan">${totalDevolver.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Valor por cuota</p>
                    <p className="text-2xl font-black text-fin-violet">${valorCuota.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.cliente || montoNum <= 0}
                className="md:col-span-2 w-full bg-gradient-to-r from-fin-violet to-fin-cyan text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:opacity-90 shadow-neon-violet transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "PROCESANDO..." : <><Save size={20} /> EMITIR PRÉSTAMO</>}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

const ModalInput = ({ icon, type, placeholder, value, onChange }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-fin-violet transition-colors">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <input
      required
      type={type}
      className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-fin-violet focus:ring-1 focus:ring-fin-violet transition-all"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default NuevoPrestamoModal;