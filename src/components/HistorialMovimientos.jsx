import { useState, useEffect } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  Filter, 
  ReceiptText, 
  Download, 
  FileText, 
  PlusCircle,
  Wallet,
  ArrowRightLeft,
  CreditCard
} from 'lucide-react';
import api from '../api';
import NuevoMovimientoModal from './NuevoMovimientoModal';

const HistorialMovimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState(null);
  const [modalMovimientoOpen, setModalMovimientoOpen] = useState(false);
  
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchMovimientos();
  }, []);

  useEffect(() => {
    let resultado = movimientos;
    if (fechaDesde) {
      resultado = resultado.filter(m => new Date(m.fecha) >= new Date(fechaDesde));
    }
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59);
      resultado = resultado.filter(m => new Date(m.fecha) <= hasta);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredMovimientos(resultado);
  }, [fechaDesde, fechaHasta, movimientos]);

  const fetchMovimientos = async () => {
    try {
      const res = await api.get('/caja/');
      setMovimientos(res.data);
      setFilteredMovimientos(res.data);
    } catch (err) {
      console.error("Error al cargar movimientos", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Descarga de Recibo de Pago (Ingreso)
  const handleDescargarRecibo = async (cuotaId) => {
    if (!cuotaId) return;
    setDescargando(`cuota_${cuotaId}`);
    try {
      const response = await api.get(`/cuotas/${cuotaId}/generar_recibo/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recibo_Cobro_${cuotaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("No se pudo regenerar el recibo. Verifique que la cuota exista.");
    } finally {
      setDescargando(null);
    }
  };

  // 2. Descarga de Comprobante de Desembolso (Egreso de Préstamo)
  const handleDescargarDesembolso = async (prestamoId) => {
    if (!prestamoId) return;
    setDescargando(`prestamo_${prestamoId}`);
    try {
      const response = await api.get(`/prestamos/${prestamoId}/comprobante-desembolso/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Comprobante_Desembolso_${prestamoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("No se pudo generar el comprobante de desembolso.");
    } finally {
      setDescargando(null);
    }
  };

  // Función auxiliar para renderizar el badge de forma de pago
  const renderMetodoPagoBadge = (metodo) => {
    const metodoLower = (metodo || 'efectivo').toLowerCase();
    switch (metodoLower) {
      case 'transferencia':
        return (
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 w-max mx-auto">
            <ArrowRightLeft size={12} /> Transferencia
          </span>
        );
      case 'otro':
        return (
          <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 w-max mx-auto">
            <CreditCard size={12} /> Otro
          </span>
        );
      case 'efectivo':
      default:
        return (
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 w-max mx-auto">
            <Wallet size={12} /> Efectivo
          </span>
        );
    }
  };

  if (loading) return <div className="p-10 text-center text-fin-cyan animate-pulse font-black uppercase italic">Sincronizando caja...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      
      {/* Header y Filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
          Movimientos de <span className="text-fin-cyan">Caja</span>
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 bg-fin-charcoal p-2 rounded-2xl border border-gray-800 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-3">
            <Filter size={14} className="text-gray-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase">Filtros:</span>
          </div>
          <input 
            type="date" 
            className="bg-fin-dark-bg border border-gray-700 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-fin-cyan flex-1 sm:flex-none"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <span className="text-gray-600 text-xs">al</span>
          <input 
            type="date" 
            className="bg-fin-dark-bg border border-gray-700 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-fin-cyan flex-1 sm:flex-none"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
          {(fechaDesde || fechaHasta) && (
            <button 
              onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
              className="text-[10px] font-black text-fin-violet px-3 hover:underline ml-auto sm:ml-0"
            >
              LIMPIAR
            </button>
          )}
        </div>

        <button
          onClick={() => setModalMovimientoOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-fin-violet to-fin-cyan text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-neon-violet hover:opacity-90 transition-all active:scale-95"
        >
          <PlusCircle size={16} /> REGISTRAR MOVIMIENTO MANUAL
        </button>
      </div>

      {/* Tarjeta de la Tabla */}
      <div className="bg-fin-charcoal rounded-3xl border border-gray-800 overflow-hidden w-full">
        
        <div className="w-full overflow-x-auto block">      
          
          <table className="text-left border-collapse min-w-[950px] lg:w-full table-fixed lg:table-auto">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[160px] min-w-[160px]">Fecha y Hora</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[300px] min-w-[300px]">Detalle de Operación</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[110px] min-w-[110px]">Tipo</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[140px] min-w-[140px]">Forma de Pago</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right w-[130px] min-w-[130px]">Monto</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[100px] min-w-[100px]">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm text-gray-200">
              {filteredMovimientos.length > 0 ? filteredMovimientos.map((m) => {
                
                // Normalización de tipo para comparación segura (evita fallos por mayúsculas 'EGRESO')
                const tipoLower = (m.tipo || '').toLowerCase();

                // Extracción segura de prestamo_id (campo directo o fallback desde el concepto)
                let prestamoIdExtraido = m.prestamo_id || m.prestamo;
                if (!prestamoIdExtraido && m.concepto) {
                  const match = m.concepto.match(/(?:#|PRÉSTAMO\s*#?|PRESTAMO\s*#?)\s*(\d+)/i);
                  if (match) prestamoIdExtraido = match[1];
                }

                const isDescargandoCuota = descargando === `cuota_${m.cuota_id}`;
                const isDescargandoPrestamo = descargando === `prestamo_${prestamoIdExtraido}`;

                return (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                    
                    <td className="p-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} className="text-gray-600" />
                        <span className="text-xs font-medium">{m.fecha_formateada}</span>
                      </div>
                    </td>
                    
                    <td className="p-5 whitespace-normal">
                      <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors uppercase tracking-tight">
                        {m.concepto}
                      </p>
                    </td>
                    
                    <td className="p-5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        tipoLower === 'ingreso' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {tipoLower === 'ingreso' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                        {m.tipo}
                      </span>
                    </td>

                    {/* ⚡ COLUMNA NUEVA: FORMA DE PAGO */}
                    <td className="p-5 text-center whitespace-nowrap">
                      {renderMetodoPagoBadge(m.metodo_pago)}
                    </td>
                    
                    <td className="p-5 text-right font-mono font-black whitespace-nowrap">
                      <span className={tipoLower === 'ingreso' ? 'text-green-400' : 'text-red-400'}>
                        {tipoLower === 'ingreso' ? '+' : '-'} ${parseFloat(m.monto).toLocaleString()}
                      </span>
                    </td>
                    
                    {/* Botón dinámico según tipo de transacción */}
                    <td className="p-5 text-center whitespace-nowrap">
                      {tipoLower === 'ingreso' && m.cuota_id ? (
                        /* Recibo de Cobro (Cyan) */
                        <button 
                          onClick={() => handleDescargarRecibo(m.cuota_id)}
                          disabled={isDescargandoCuota}
                          className={`p-2 rounded-xl transition-all ${
                            isDescargandoCuota 
                            ? 'bg-gray-800 text-gray-600 animate-pulse' 
                            : 'bg-fin-cyan/10 text-fin-cyan hover:bg-fin-cyan hover:text-white border border-fin-cyan/20'
                          }`}
                          title="Reimprimir Recibo de Cobro"
                        >
                          {isDescargandoCuota ? <Download size={16} /> : <ReceiptText size={16} />}
                        </button>
                      ) : tipoLower === 'egreso' && prestamoIdExtraido ? (
                        /* Comprobante de Desembolso (Violeta) */
                        <button 
                          onClick={() => handleDescargarDesembolso(prestamoIdExtraido)}
                          disabled={isDescargandoPrestamo}
                          className={`p-2 rounded-xl transition-all ${
                            isDescargandoPrestamo 
                            ? 'bg-gray-800 text-gray-600 animate-pulse' 
                            : 'bg-fin-violet/10 text-fin-violet hover:bg-fin-violet hover:text-white border border-fin-violet/20'
                          }`}
                          title="Reimprimir Comprobante de Desembolso"
                        >
                          {isDescargandoPrestamo ? <Download size={16} /> : <FileText size={16} />}
                        </button>
                      ) : (
                        <span className="text-gray-700">-</span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-gray-600 italic text-sm">
                    No se encontraron movimientos en este rango de fechas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REGISTRO MANUAL DE MOVIMIENTO */}
      <NuevoMovimientoModal 
        isOpen={modalMovimientoOpen}
        onClose={() => setModalMovimientoOpen(false)}
        onRefresh={fetchMovimientos}
      />

    </div>
  );
};

export default HistorialMovimientos;