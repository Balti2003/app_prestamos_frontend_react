import { useState, useEffect } from 'react';
import { X, Phone, MapPin, IdCard, ArrowRight } from 'lucide-react';
import api from '../api';

const ClienteDetallePanel = ({ clienteId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clienteId) {
      const fetchDetalle = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/clientes/${clienteId}/`);
          setData(res.data);
        } catch {
          console.error("Error al obtener datos del cliente");
        } finally {
          setLoading(false);
        }
      };
      fetchDetalle();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
    }
  }, [clienteId]);

  if (!clienteId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-fin-charcoal border-l border-gray-800 z-[120] shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="h-full flex flex-col">
          
          <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-fin-charcoal-light/50">
            <h3 className="text-xl font-black italic text-white uppercase">Perfil del Cliente</h3>
            <button onClick={onClose} className="p-2 hover:bg-fin-charcoal rounded-xl text-gray-500 hover:text-white transition">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading || !data ? (
              <div className="flex flex-col items-center justify-center h-40 text-fin-cyan animate-pulse">
                <div className="w-8 h-8 border-4 border-fin-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="font-bold text-xs uppercase tracking-widest">Cargando...</span>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Información Básica */}
                <section className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fin-violet to-fin-cyan flex items-center justify-center text-2xl font-black text-white shadow-lg">
                      {data.nombre?.[0]}{data.apellido?.[0]}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white capitalize">{data.nombre} {data.apellido}</h4>
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter">Legajo Activo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mt-6">
                    <InfoRow icon={<IdCard size={16}/>} label="DNI" value={data.dni} />
                    <InfoRow icon={<Phone size={16}/>} label="Teléfono" value={data.telefono} />
                    <InfoRow icon={<MapPin size={16}/>} label="Dirección" value={data.direccion} />
                  </div>
                </section>

                {/* Nota: Como no tenemos el endpoint /detalle/, 
                    los préstamos no aparecerán aquí por ahora. */}
                <div className="p-4 bg-fin-dark-bg/30 rounded-2xl border border-dashed border-gray-800 text-center">
                   <p className="text-gray-500 text-xs font-bold uppercase italic">Detalle de préstamos disponible próximamente</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-fin-charcoal-light border-t border-gray-800">
            <button className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-fin-cyan hover:text-white transition-all group">
              REGISTRAR PAGO <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-fin-dark-bg/40 rounded-xl border border-gray-800/50">
    <div className="text-gray-500">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[9px] text-gray-600 font-black uppercase tracking-tighter mb-1">{label}</span>
      <span className="text-sm text-gray-300 font-medium">{value || 'N/A'}</span>
    </div>
  </div>
);

export default ClienteDetallePanel;