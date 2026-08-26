import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, Phone, IdCard, ExternalLink, Eye, Edit, Trash2 } from 'lucide-react';
import ClienteDetallePanel from './ClienteDetallePanel';
import EditarClienteModal from './EditarClienteModal';
import ConfirmModal from './ConfirmModal';
import Paginador from './Paginador';

const ListaClientes = ({ onOpenPayment, onVerPerfil }) => {
  const { esAdmin } = useAuth();
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteAEditar, setClienteAEditar] = useState(null);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [mensajeAdvertencia, setMensajeAdvertencia] = useState(null);

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: pagina };
      if (busqueda.trim()) params.search = busqueda.trim();

      const res = await api.get('/clientes/', { params });
      
      if (res.data && res.data.results) {
        setClientes(res.data.results);
        setTotalRegistros(res.data.count || 0);
      } else {
        const lista = Array.isArray(res.data) ? res.data : [];
        setClientes(lista);
        setTotalRegistros(lista.length);
      }
    } catch {
      console.error("Error al traer clientes");
      setClientes([]);
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
  }, [pagina, busqueda]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClientes();
  }, [fetchClientes]);

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
    setPagina(1);
  };

  const handleOpenEditar = (cliente) => {
    if (!esAdmin) return;
    setClienteAEditar(cliente);
    setModalEditarOpen(true);
  };

  const handleSolicitarEliminacion = (cliente) => {
    if (!esAdmin) return;
    setClienteAEliminar(cliente);
    setModalConfirmOpen(true);
  };

  const handleConfirmarEliminacion = async () => {
    if (!clienteAEliminar || !esAdmin) return;
    try {
      setDeleting(true);
      await api.delete(`/clientes/${clienteAEliminar.id}/`);
      setModalConfirmOpen(false);
      setClienteAEliminar(null);
      fetchClientes();
    } catch (err) {
      const errorServidor = err.response?.data?.error || "No se puede eliminar este cliente porque posee créditos u operaciones registradas.";
      setModalConfirmOpen(false);
      setClienteAEliminar(null);
      setMensajeAdvertencia(errorServidor);
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      
      <ClienteDetallePanel 
        clienteId={selectedCliente} 
        onClose={() => setSelectedCliente(null)} 
        onOpenPayment={onOpenPayment}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 w-full">
        <div>
          <h2 className="text-3xl font-black tracking-tighter italic text-white">CARTERA DE CLIENTES</h2>
          <p className="text-fin-gray-text text-sm">Gestiona y visualiza el estado de tus prestatarios.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            className="w-full bg-fin-charcoal border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-fin-cyan focus:ring-1 focus:ring-fin-cyan outline-none transition-all"
            value={busqueda}
            onChange={handleBuscar}
          />
        </div>
      </div>

      <div className="bg-fin-charcoal rounded-3xl border border-gray-800 shadow-fin-card overflow-hidden w-full">
        <div className="w-full overflow-x-auto block">
          <table className="text-left border-collapse min-w-[850px] lg:w-full table-fixed lg:table-auto">
            <thead>
              <tr className="bg-fin-charcoal-light/50 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[260px] min-w-[260px]">Cliente</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[140px] min-w-[140px]">Dni</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[180px] min-w-[180px]">Contacto</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[240px] min-w-[240px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-fin-violet/5 transition-colors group">
                  
                  <td className="p-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-fin-charcoal-light flex items-center justify-center border border-gray-700 text-fin-cyan font-bold group-hover:border-fin-cyan/50 transition-colors flex-shrink-0">
                        {cliente.nombre[0]}{cliente.apellido[0]}
                      </div>
                      <div className="truncate">
                        <button
                          onClick={() => onVerPerfil(cliente.id)}
                          className="font-bold text-white capitalize hover:text-fin-violet transition-colors text-left focus:outline-none block"
                        >
                          {cliente.nombre} {cliente.apellido}
                        </button>
                        
                        {cliente.tiene_mora ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <p className="text-[10px] text-red-400 uppercase font-black tracking-tighter animate-pulse">
                              PAGO ATRASADO
                            </p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">
                            Cliente al día
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-5 text-sm text-gray-300 font-mono italic whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <IdCard size={14} className="text-gray-600 flex-shrink-0" />
                      {cliente.dni}
                    </div>
                  </td>

                  <td className="p-5 text-sm text-gray-300 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-600 flex-shrink-0" />
                      {cliente.telefono || 'Sin teléfono'}
                    </div>
                  </td>

                  <td className="p-5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {cliente.tiene_mora && (
                        <div className="bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-red-500 text-[9px] font-bold flex-shrink-0 mr-1">
                          MOROSO
                        </div>
                      )}
                      
                      <button 
                        onClick={() => onVerPerfil(cliente.id)}
                        className="p-2 hover:bg-fin-charcoal-light rounded-lg text-fin-cyan hover:text-white transition-all flex-shrink-0"
                        title="Ver Expediente y Comportamiento Histórico"
                      >
                        <Eye size={18} />
                      </button>

                      <button 
                        onClick={() => setSelectedCliente(cliente.id)}
                        className="p-2 hover:bg-fin-charcoal-light rounded-lg text-violet-400 hover:text-white transition-all flex-shrink-0"
                        title="Ver Detalle Rápido"
                      >
                        <ExternalLink size={18} />
                      </button>

                      {esAdmin && (
                        <button 
                          onClick={() => handleOpenEditar(cliente)}
                          className="p-2 hover:bg-fin-charcoal-light rounded-lg text-amber-400 hover:text-white transition-all flex-shrink-0"
                          title="Editar Información del Cliente"
                        >
                          <Edit size={18} />
                        </button>
                      )}

                      {esAdmin && (
                        <button 
                          onClick={() => handleSolicitarEliminacion(cliente)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-200 transition-all flex-shrink-0"
                          title="Eliminar Cliente"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {clientes.length === 0 && !loading && (
            <div className="p-20 text-center text-gray-600 uppercase font-black tracking-widest text-sm">
              No se encontraron clientes que coincidan
            </div>
          )}
        </div>

        {/* Paginador integrado */}
        <Paginador 
          paginaActual={pagina} 
          totalRegistros={totalRegistros} 
          porPagina={10} 
          onCambiarPagina={(nuevaPagina) => setPagina(nuevaPagina)} 
        />
      </div>

      {esAdmin && (
        <EditarClienteModal 
          isOpen={modalEditarOpen}
          onClose={() => {
            setModalEditarOpen(false);
            setClienteAEditar(null);
          }}
          cliente={clienteAEditar}
          onRefresh={fetchClientes}
        />
      )}

      {esAdmin && (
        <ConfirmModal
          isOpen={modalConfirmOpen}
          onClose={() => {
            setModalConfirmOpen(false);
            setClienteAEliminar(null);
          }}
          onConfirm={handleConfirmarEliminacion}
          loading={deleting}
          titulo={`¿Eliminar a ${clienteAEliminar?.nombre || ''} ${clienteAEliminar?.apellido || ''}?`}
          mensaje="Esta acción borrará permanentemente la información del cliente. Solo se procesará si no posee préstamos activos."
        />
      )}

      <ConfirmModal
        isOpen={!!mensajeAdvertencia}
        onClose={() => setMensajeAdvertencia(null)}
        titulo="Acción Bloqueada"
        mensaje={mensajeAdvertencia}
        isAlert={true}
      />

    </div>
  );
};

export default ListaClientes;