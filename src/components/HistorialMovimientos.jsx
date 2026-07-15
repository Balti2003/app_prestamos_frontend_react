import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Calendar, Filter, ReceiptText, Download } from 'lucide-react';
import api from '../api';

const HistorialMovimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState(null);
  
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

  const handleDescargarRecibo = async (cuotaId) => {
    if (!cuotaId) return;
    setDescargando(cuotaId);
    try {
      const response = await api.get(`/cuotas/${cuotaId}/generar_recibo/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recibo_Reimpreso_${cuotaId}.pdf`);
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
      </div>

      {/* Tarjeta de la Tabla */}
      <div className="bg-fin-charcoal rounded-3xl border border-gray-800 overflow-hidden w-full">
        
        <div className="w-full overflow-x-auto block">      
          
          <table className="text-left border-collapse min-w-[850px] lg:w-full table-fixed lg:table-auto">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[160px] min-w-[160px]">Fecha y Hora</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[340px] min-w-[340px]">Detalle de Operación</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[120px] min-w-[120px]">Tipo</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right w-[130px] min-w-[130px]">Monto</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[100px] min-w-[100px]">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm text-gray-200">
              {filteredMovimientos.length > 0 ? filteredMovimientos.map((m) => (
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
                      m.tipo === 'ingreso' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {m.tipo === 'ingreso' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                      {m.tipo}
                    </span>
                  </td>
                  
                  <td className="p-5 text-right font-mono font-black whitespace-nowrap">
                    <span className={m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}>
                      {m.tipo === 'ingreso' ? '+' : '-'} ${parseFloat(m.monto).toLocaleString()}
                    </span>
                  </td>
                  
                  <td className="p-5 text-center whitespace-nowrap">
                    {m.tipo === 'ingreso' && m.cuota_id ? (
                      <button 
                        onClick={() => handleDescargarRecibo(m.cuota_id)}
                        disabled={descargando === m.cuota_id}
                        className={`p-2 rounded-xl transition-all ${
                          descargando === m.cuota_id 
                          ? 'bg-gray-800 text-gray-600 animate-pulse' 
                          : 'bg-fin-cyan/10 text-fin-cyan hover:bg-fin-cyan hover:text-white border border-fin-cyan/20'
                        }`}
                        title="Reimprimir Comprobante"
                      >
                        {descargando === m.cuota_id ? <Download size={16} /> : <ReceiptText size={16} />}
                      </button>
                    ) : (
                      <span className="text-gray-700">-</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-600 italic text-sm">
                    No se encontraron movimientos en este rango de fechas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistorialMovimientos;