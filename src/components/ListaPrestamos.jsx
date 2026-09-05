import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, FileText, CheckCircle2, Clock, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import Paginador from './Paginador';

const ListaPrestamos = ({ onVerCliente }) => {
  const { esAdmin } = useAuth();
  const [prestamos, setPrestamos] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [prestamoAEliminar, setPrestamoAEliminar] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPrestamos = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: pagina };
      
      if (busqueda.trim()) {
        params.search = busqueda.trim();
      }

      if (filtroEstado === 'ACTIVOS') {
        params.estado = 'activo';
      } else if (filtroEstado === 'MORA') {
        params.estado = 'mora';
      } else if (filtroEstado === 'FINALIZADOS') {
        params.estado = 'finalizado';
      }

      const response = await api.get('/prestamos/', { params });
      
      if (response.data && response.data.results) {
        setPrestamos(response.data.results);
        setTotalRegistros(response.data.count || 0);
      } else {
        const lista = Array.isArray(response.data) ? response.data : [];
        setPrestamos(lista);
        setTotalRegistros(lista.length);
      }
    } catch (error) {
      console.error("Error al obtener préstamos:", error);
      setPrestamos([]);
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
  }, [pagina, busqueda, filtroEstado]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPrestamos();
  }, [fetchPrestamos]);

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
    setPagina(1);
  };

  const handleCambiarFiltro = (estado) => {
    setFiltroEstado(estado);
    setPagina(1);
  };

  const handleSolicitarEliminacion = (prestamoId) => {
    if (!esAdmin) return;
    setPrestamoAEliminar(prestamoId);
    setModalConfirmOpen(true);
  };

  const handleConfirmarEliminacion = async () => {
    if (!prestamoAEliminar || !esAdmin) return;
    try {
      setDeleting(true);
      await api.delete(`/prestamos/${prestamoAEliminar}/`);
      setModalConfirmOpen(false);
      setPrestamoAEliminar(null);
      fetchPrestamos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar el préstamo.");
    } finally {
      setDeleting(false);
    }
  };

  const getBadgeEstado = (estado) => {
    switch (estado) {
      case 'activo':
        return <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 w-max"><Clock size={12} /> Al Día</span>;
      case 'mora':
        return <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 w-max"><AlertTriangle size={12} /> En Mora</span>;
      case 'finalizado':
      case 'completado':
        return <span className="px-3 py-1 bg-fin-cyan/10 text-fin-cyan border border-fin-cyan/20 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 w-max"><CheckCircle2 size={12} /> Finalizado</span>;
      default:
        return <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-xl text-xs font-black uppercase">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-fin-charcoal p-6 rounded-3xl border border-gray-800">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tight flex items-center gap-2">
            <FileText className="text-fin-violet" size={24} /> Cartera de Préstamos
          </h2>
          <p className="text-xs text-fin-gray-text mt-1">Vista general de todos los créditos otorgados e históricos.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Buscar por cliente o ID préstamo..."
            value={busqueda}
            onChange={handleBuscar}
            className="w-full bg-fin-dark-bg border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-fin-violet transition-colors"
          />
        </div>
      </div>

      {/* Selector de Filtros por Estado */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        {['TODOS', 'ACTIVOS', 'MORA', 'FINALIZADOS'].map((estado) => (
          <button
            key={estado}
            onClick={() => handleCambiarFiltro(estado)}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all ${
              filtroEstado === estado
                ? 'bg-fin-violet text-white shadow-neon-violet'
                : 'bg-fin-charcoal/50 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {estado}
          </button>
        ))}
      </div>

      {/* Tabla de Préstamos */}
      <div className="bg-fin-charcoal rounded-3xl border border-gray-800 overflow-hidden shadow-fin-card">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse font-black uppercase text-xs">Cargando préstamos...</div>
        ) : prestamos.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs font-bold uppercase">No se encontraron préstamos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-[11px] font-black uppercase text-gray-400 tracking-wider bg-fin-dark-bg/50">
                  <th className="p-4 pl-6">Operación</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Monto Solicitado</th>
                  <th className="p-4">Fecha Inicio</th>
                  <th className="p-4">Cuotas (P/T)</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs">
                {prestamos.map((p) => {
                  const cuotasPagadas = p.cuotas_pagadas_count ?? p.cuotas?.filter(c => c.esta_pagada).length ?? 0;
                  const totalCuotas = p.cantidad_cuotas || p.cuotas?.length || 0;
                  const porcentajeProgreso = totalCuotas > 0 ? (cuotasPagadas / totalCuotas) * 100 : 0;
                  const clienteIdTarget = typeof p.cliente === 'object' ? p.cliente?.id : (p.cliente || p.cliente_detail?.id);

                  return (
                    <tr key={p.id} className="hover:bg-fin-charcoal-light/40 transition-colors">
                      <td className="p-4 pl-6 font-black text-fin-cyan">
                        #{p.id}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {typeof p.cliente === 'object' 
                            ? `${p.cliente?.nombre} ${p.cliente?.apellido}`
                            : `${p.cliente_detail?.nombre || p.cliente_nombre || 'Cliente'} ${p.cliente_detail?.apellido || ''}`}
                        <span className="block text-[10px] text-gray-500 font-normal">
                            DNI: {p.cliente?.dni || p.cliente_detail?.dni || '---'}
                        </span>
                      </td>
                      <td className="p-4 font-black text-white text-sm">
                        ${Number(p.monto_solicitado).toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-400 font-medium">
                        {(() => {
                            const fechaRaw = p.fecha_inicio || p.fecha_creacion;
                            if (!fechaRaw) return '---';

                            const fechaLimpia = fechaRaw.split('T')[0]; 
                            const [year, month, day] = fechaLimpia.split('-');

                            if (!year || !month || !day) return fechaRaw;

                            return `${day}/${month}/${year}`;
                        })()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 w-32">
                            <span className="font-bold text-gray-300 text-[11px]">
                              {cuotasPagadas} de {totalCuotas} saldadas
                            </span>

                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden my-0.5">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  porcentajeProgreso === 100 ? 'bg-fin-cyan' : 'bg-fin-violet'
                                }`} 
                                style={{ width: `${porcentajeProgreso}%` }}
                              />
                            </div>

                            <span className="text-[10px] text-fin-cyan font-bold">
                              {p.monto_cuota ? `$${Number(p.monto_cuota).toLocaleString()} c/u` : '---'}
                            </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getBadgeEstado(p.estado)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onVerCliente(clienteIdTarget)}
                            className="p-2 bg-fin-dark-bg hover:bg-fin-violet/20 border border-gray-700 hover:border-fin-violet rounded-xl text-fin-violet transition-all"
                            title="Ver Perfil del Cliente"
                          >
                            <Eye size={16} />
                          </button>

                          {esAdmin && (
                            <button
                              onClick={() => handleSolicitarEliminacion(p.id)}
                              className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all"
                              title="Eliminar / Cancelar Préstamo"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginador integrado */}
        <Paginador 
          paginaActual={pagina} 
          totalRegistros={totalRegistros} 
          porPagina={10} 
          onCambiarPagina={(nuevaPagina) => setPagina(nuevaPagina)} 
        />
      </div>

      {esAdmin && (
        <ConfirmModal
          isOpen={modalConfirmOpen}
          onClose={() => {
            setModalConfirmOpen(false);
            setPrestamoAEliminar(null);
          }}
          onConfirm={handleConfirmarEliminacion}
          loading={deleting}
          titulo={`¿Eliminar Préstamo #${prestamoAEliminar}?`}
          mensaje="Esta acción eliminará el contrato, sus cuotas asociadas y revertirá los asientos contables en caja."
        />
      )}

    </div>
  );
};

export default ListaPrestamos;