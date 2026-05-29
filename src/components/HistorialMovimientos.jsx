import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Calendar, Filter } from 'lucide-react';
import api from '../api';

const HistorialMovimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchMovimientos();
  }, []);

  // Cada vez que cambien las fechas o los movimientos, filtramos
  useEffect(() => {
    let resultado = movimientos;

    if (fechaDesde) {
      resultado = resultado.filter(m => new Date(m.fecha) >= new Date(fechaDesde));
    }
    if (fechaHasta) {
      // Ajustamos fechaHasta al final del día para que incluya hoy
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

  if (loading) return <div className="p-10 text-center text-fin-cyan animate-pulse font-black uppercase italic">Sincronizando caja...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header y Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
          Movimientos de <span className="text-fin-cyan">Caja</span>
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 bg-fin-charcoal p-2 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-2 px-3">
            <Filter size={14} className="text-gray-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase">Filtros:</span>
          </div>
          <input 
            type="date" 
            className="bg-fin-dark-bg border border-gray-700 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-fin-cyan"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <span className="text-gray-600 text-xs">al</span>
          <input 
            type="date" 
            className="bg-fin-dark-bg border border-gray-700 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-fin-cyan"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
          {(fechaDesde || fechaHasta) && (
            <button 
              onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
              className="text-[10px] font-black text-fin-violet px-3 hover:underline"
            >
              LIMPIAR
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-fin-charcoal-light rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-fin-charcoal/50 border-b border-gray-800">
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Fecha y Hora</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Detalle de Operación</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Tipo</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredMovimientos.length > 0 ? filteredMovimientos.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} className="text-gray-600" />
                      <span className="text-xs font-medium">{m.fecha_formateada}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors uppercase tracking-tight">
                      {m.concepto}
                    </p>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      m.tipo === 'ingreso' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {m.tipo === 'ingreso' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                      {m.tipo}
                    </span>
                  </td>
                  <td className="p-5 text-right font-mono font-black">
                    <span className={m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}>
                      {m.tipo === 'ingreso' ? '+' : '-'} ${parseFloat(m.monto).toLocaleString()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-gray-600 italic text-sm">
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