import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Search, Phone, IdCard, ExternalLink, Eye, CalendarClock, MessageCircle, MapPin } from 'lucide-react';
import ClienteDetallePanel from './ClienteDetallePanel';
import Paginador from './Paginador';

const ListaClientes = ({ onOpenPayment, onVerPerfil }) => {
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

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

  // ⚡ Limpia el número y genera el link directo a WhatsApp
  const getWhatsAppLink = (telefono, nombre) => {
    if (!telefono) return null;
    let cleanNumber = telefono.replace(/\D/g, '');

    if (!cleanNumber.startsWith('54')) {
      if (cleanNumber.startsWith('0')) cleanNumber = cleanNumber.substring(1);
      cleanNumber = `549${cleanNumber}`;
    }

    const mensaje = encodeURIComponent(`Hola ${nombre}`);
    return `https://wa.me/${cleanNumber}?text=${mensaje}`;
  };

  // ⚡ Genera el enlace directo a Google Maps con detección de contexto
  const getMapsLink = (direccion) => {
    if (!direccion || direccion.trim() === '' || direccion.toLowerCase() === 'sin dirección') {
      return null;
    }

    const dirLimpia = direccion.trim();
    const dirLower = dirLimpia.toLowerCase();

    let busquedaCompleta = dirLimpia;
    if (!dirLower.includes('córdoba') && !dirLower.includes('cordoba')) {
      if (!dirLower.includes('marcos juárez') && !dirLower.includes('marcos juarez')) {
        busquedaCompleta = `${dirLimpia}, Marcos Juárez, Córdoba, Argentina`;
      } else {
        busquedaCompleta = `${dirLimpia}, Córdoba, Argentina`;
      }
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busquedaCompleta)}`;
  };

  // Subtexto conciso debajo del nombre
  const renderEstadoSubtexto = (cliente) => {
    const estadoData = cliente.estado_financiero || {
      estado: cliente.tiene_mora ? 'moroso' : 'al_dia',
      label: cliente.tiene_mora ? 'PAGO ATRASADO' : 'AL DÍA'
    };

    if (estadoData.estado === 'moroso') {
      return (
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <p className="text-[10px] text-red-400 uppercase font-black tracking-tighter">
            {estadoData.label}
          </p>
        </div>
      );
    }

    if (estadoData.estado === 'por_vencer') {
      return (
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <p className="text-[10px] text-amber-400 uppercase font-black tracking-tighter">
            {estadoData.label}
          </p>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <p className="text-[10px] text-emerald-400 uppercase font-black tracking-tighter">
          {estadoData.label}
        </p>
      </div>
    );
  };

  // Modalidad y Próximo Vencimiento
  const renderModalidadVencimiento = (cliente) => {
    const info = cliente.estado_financiero;
    if (!info || !info.frecuencia || info.estado === 'sin_deuda') {
      return (
        <span className="text-gray-600 text-xs italic">
          Sin préstamos activos
        </span>
      );
    }

    const badgeFrecuencia = {
      diario: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      semanal: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      quincenal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      mensual: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }[info.frecuencia.toLowerCase()] || 'bg-gray-800 text-gray-400 border-gray-700';

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-wider ${badgeFrecuencia}`}>
            {info.frecuencia}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            Cuota {info.numero_cuota_pendiente}/{info.cuotas_totales}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-200 font-medium">
          <CalendarClock size={13} className="text-fin-cyan flex-shrink-0" />
          <span className="capitalize">{info.proximo_vencimiento_texto}</span>
        </div>
      </div>
    );
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
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[160px] min-w-[160px]">Contacto</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[220px] min-w-[220px]">Plan / Próx. Cobro</th>
                <th className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[160px] min-w-[160px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {clientes.map((cliente) => {
                const whatsappUrl = getWhatsAppLink(cliente.telefono, cliente.nombre);
                const mapsUrl = getMapsLink(cliente.direccion);

                return (
                  <tr key={cliente.id} className="hover:bg-fin-violet/5 transition-colors group">
                    
                    {/* Titular */}
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
                          {renderEstadoSubtexto(cliente)}
                        </div>
                      </div>
                    </td>

                    {/* DNI */}
                    <td className="p-5 text-sm text-gray-300 font-mono italic whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <IdCard size={14} className="text-gray-600 flex-shrink-0" />
                        {cliente.dni}
                      </div>
                    </td>

                    {/* Contacto (Clickeable directo a WhatsApp) */}
                    <td className="p-5 text-sm text-gray-300 whitespace-nowrap">
                      {cliente.telefono ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group/tel"
                          title="Abrir chat de WhatsApp"
                        >
                          <Phone size={14} className="text-gray-600 group-hover/tel:text-emerald-400 transition-colors flex-shrink-0" />
                          <span className="font-mono text-xs group-hover/tel:underline">{cliente.telefono}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} className="flex-shrink-0" />
                          <span className="text-xs">Sin teléfono</span>
                        </div>
                      )}
                    </td>

                    {/* Modalidad y Próximo Cobro */}
                    <td className="p-5 whitespace-nowrap">
                      {renderModalidadVencimiento(cliente)}
                    </td>

                    {/* Acciones (WhatsApp, Maps, Perfil, Detalle Lateral) */}
                    <td className="p-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* ⚡ Botón WhatsApp */}
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg transition-all flex-shrink-0"
                            title="Enviar mensaje por WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}

                        {/* ⚡ Botón Google Maps */}
                        {mapsUrl ? (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/20 rounded-lg transition-all flex-shrink-0"
                            title={`Ver ubicación en Google Maps (${cliente.direccion})`}
                          >
                            <MapPin size={16} />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="p-2 bg-gray-800/40 text-gray-600 border border-gray-800 rounded-lg cursor-not-allowed opacity-40 flex-shrink-0"
                            title="Sin dirección registrada"
                          >
                            <MapPin size={16} />
                          </button>
                        )}

                        {/* Botón Ver Perfil */}
                        <button 
                          onClick={() => onVerPerfil(cliente.id)}
                          className="p-2 hover:bg-fin-charcoal-light rounded-lg text-fin-cyan hover:text-white transition-all flex-shrink-0"
                          title="Ver Expediente y Comportamiento Histórico"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Botón Detalle Rápido */}
                        <button 
                          onClick={() => setSelectedCliente(cliente.id)}
                          className="p-2 hover:bg-fin-charcoal-light rounded-lg text-violet-400 hover:text-white transition-all flex-shrink-0"
                          title="Ver Detalle Rápido"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

    </div>
  );
};

export default ListaClientes;