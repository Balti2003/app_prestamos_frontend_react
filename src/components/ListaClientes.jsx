import { useState, useEffect } from 'react';
import api from '../api';
import { Search, Phone, IdCard, ExternalLink } from 'lucide-react';
import ClienteDetallePanel from './ClienteDetallePanel';

const ListaClientes = ({ onOpenPayment }) => {
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes/');
      setClientes(res.data);
    } catch {
      console.error("Error al traer clientes");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado en tiempo real
  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.dni.includes(busqueda)
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Panel Lateral de Detalle */}
      <ClienteDetallePanel 
        clienteId={selectedCliente} 
        onClose={() => setSelectedCliente(null)} 
        onOpenPayment={onOpenPayment}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter italic text-white">CARTERA DE CLIENTES</h2>
          <p className="text-fin-gray-text text-sm">Gestiona y visualiza el estado de tus prestatarios.</p>
        </div>

        {/* Buscador Pro */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            className="w-full bg-fin-charcoal border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-fin-cyan focus:ring-1 focus:ring-fin-cyan outline-none transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-fin-charcoal rounded-3xl border border-gray-800 shadow-fin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-fin-charcoal-light/50 border-b border-gray-800">
                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Cliente</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Dni</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Contacto</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-fin-violet/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-fin-charcoal-light flex items-center justify-center border border-gray-700 text-fin-cyan font-bold group-hover:border-fin-cyan/50 transition-colors">
                        {cliente.nombre[0]}{cliente.apellido[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white capitalize">{cliente.nombre} {cliente.apellido}</p>
                        
                        {/* --- SINCRONIZACIÓN DE MORA (PUNTO 3) --- */}
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

                  <td className="p-5 text-sm text-gray-300 font-mono italic">
                    <div className="flex items-center gap-2">
                      <IdCard size={14} className="text-gray-600" />
                      {cliente.dni}
                    </div>
                  </td>

                  <td className="p-5 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-600" />
                      {cliente.telefono || 'Sin teléfono'}
                    </div>
                  </td>

                  <td className="p-5 text-center">
                    {/* Agregué un indicador visual de estado rápido en la columna de acciones o estado */}
                    <div className="flex items-center justify-center gap-3">
                      {cliente.tiene_mora && (
                        <div className="bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-red-500 text-[9px] font-bold">
                          MOROSO
                        </div>
                      )}
                      
                      <button 
                        onClick={() => setSelectedCliente(cliente.id)}
                        className="p-2 hover:bg-fin-charcoal-light rounded-lg text-violet-400 hover:text-white transition-all"
                        title="Ver Detalle Completo"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {clientesFiltrados.length === 0 && !loading && (
            <div className="p-20 text-center text-gray-600 uppercase font-black tracking-widest text-sm">
              No se encontraron clientes que coincidan
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaClientes;