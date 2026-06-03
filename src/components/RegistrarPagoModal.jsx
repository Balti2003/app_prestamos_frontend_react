import { useState, useEffect } from 'react';
import { X, ReceiptText, DollarSign, Calendar, ArrowRight, CheckSquare, AlertCircle } from 'lucide-react';
import api from '../api';

const RegistrarPagoModal = ({ isOpen, onClose, onRefresh }) => {
  const [clientes, setClientes] = useState([]);
  const [cuotasDisponibles, setCuotasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const [step, setStep] = useState(1); // 1: Buscar cliente, 2: Elegir Cuota
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedCuota, setSelectedCuota] = useState('');
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [idCuotaPagada, setIdCuotaPagada] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedCuotaObj, setSelectedCuotaObj] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/immutability
      fetchClientes();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(1);
      setSelectedCliente(null);
      setCuotasDisponibles([]);
      setSelectedCuota('');
      setPagoExitoso(false);
      setIdCuotaPagada(null);
    }
  }, [isOpen]);

  // Cuando cambia el select:
  useEffect(() => {
      const objetoEncontrado = cuotasDisponibles.find(c => c.cuota_id === parseInt(selectedCuota));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCuotaObj(objetoEncontrado);
  }, [selectedCuota, cuotasDisponibles]);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes/');
      setClientes(res.data);
    } catch (err) { console.error("Error cargando clientes", err); }
  };

  const handleSelectCliente = async (cliente) => {
    setSelectedCliente(cliente);
    setLoadingCuotas(true);
    setStep(2);
    try {
      // Llamamos al nuevo endpoint de cuotas secuenciales
      const res = await api.get(`/clientes/${cliente.id}/cuotas_cobrables/`);
      setCuotasDisponibles(res.data);
      if (res.data.length > 0) {
        // Pre-seleccionamos la primera opción disponible
        setSelectedCuota(res.data[0].cuota_id);
      }
    } catch (err) {
      console.error("Error al obtener cuotas cobrables", err);
    } finally {
      setLoadingCuotas(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleSelectCuota = (id) => {
    setSelectedCuota(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCuota) return;
    setLoading(true);

    try {
      const response = await api.post(`/prestamos/registrar_pago_exacto/`, {
        cuota_id: selectedCuota
      });

      // Guardamos el ID que nos dio el backend para el PDF
      setIdCuotaPagada(response.data.cuota_id);
      
      // En lugar de cerrar, mostramos la pantalla de éxito
      setPagoExitoso(true);
      onRefresh(); 

    } catch (err) {
      alert(err.response?.data?.error || "Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar solo si el admin hace clic
  const descargarPDF = async () => {
    try {
      const response = await api.get(`/cuotas/${idCuotaPagada}/generar_recibo/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recibo_${idCuotaPagada}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      alert("Error al generar el PDF");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const checkMora = (fechaVencimiento, pagada) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Limpiamos horas para comparar solo fechas
    const vencimiento = new Date(fechaVencimiento);
    return vencimiento < hoy && !pagada;
  };

  // Buscamos el objeto de la cuota seleccionada para mostrar el precio en pantalla
  const cuotaActivaInfo = cuotasDisponibles.find(c => c.cuota_id === parseInt(selectedCuota));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-fin-dark-bg/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-fin-charcoal-light w-full max-w-lg rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-fin-charcoal/50">
          <h3 className="text-xl font-black italic text-white flex items-center gap-2">
            <ReceiptText className="text-fin-cyan" /> REGISTRAR PAGO
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X size={24} /></button>
        </div>

        <div className="p-8">
          {pagoExitoso ? (
            /* PANTALLA DE ÉXITO */
            <div className="py-10 flex flex-col items-center text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-neon-green">
                <CheckSquare size={40} />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 uppercase italic">¡Pago Registrado!</h3>
              <p className="text-gray-400 text-sm mb-8">
                La cuota ha sido asentada correctamente y el movimiento de caja fue generado.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={descargarPDF}
                  className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-fin-cyan hover:text-white transition-all group"
                >
                  <ReceiptText size={18} /> DESCARGAR COMPROBANTE
                </button>
                
                <button 
                  onClick={onClose}
                  className="w-full bg-fin-charcoal border border-gray-800 text-gray-400 py-4 rounded-xl font-bold hover:text-white transition-all"
                >
                  CONTINUAR SIN RECIBO
                </button>
              </div>
            </div>
          ) : (
            step === 1 ? (
              /* PASO 1: SELECCIÓN DE CLIENTE */
              <div className="space-y-4">
                <p className="text-gray-400 text-sm text-center">Selecciona el cliente para ver sus cuotas habilitadas</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {clientes.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => handleSelectCliente(c)}
                      className="w-full flex justify-between items-center p-4 bg-fin-charcoal border border-gray-700 rounded-2xl hover:border-fin-cyan/50 hover:bg-fin-cyan/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-fin-cyan">
                          {c.nombre[0]}{c.apellido[0]}
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold">{c.nombre} {c.apellido}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{c.dni}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-600 group-hover:text-fin-cyan group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* PASO 2: SELECCIÓN DE CUOTA Y MONTO */
              <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4">
                <div className="bg-fin-dark-bg/50 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-fin-violet/20 flex items-center justify-center text-fin-violet font-black">
                    {selectedCliente.nombre[0]}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Cliente</p>
                    <p className="text-lg font-black text-white">{selectedCliente.nombre} {selectedCliente.apellido}</p>
                  </div>
                </div>

                {loadingCuotas ? (
                  <p className="text-center text-xs text-fin-cyan animate-pulse py-4 font-bold">Buscando plan de pagos...</p>
                ) : cuotasDisponibles.length === 0 ? (
                  <div className="text-center py-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-red-400 text-sm font-bold">Este cliente no registra cuotas pendientes.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Seleccionar Cuota Habilitada</label>
                      <select 
                        className="w-full bg-fin-charcoal border border-gray-800 rounded-xl py-3 px-4 text-white font-medium outline-none focus:border-fin-violet transition-all"
                        value={selectedCuota}
                        onChange={e => setSelectedCuota(e.target.value)}
                      >
                        {cuotasDisponibles.map(c => {
                          const hoy = new Date();
                          hoy.setHours(0,0,0,0);
                          const vencimiento = new Date(c.fecha_vencimiento);
                          const estaVencida = vencimiento < hoy;

                          return (
                            <option key={c.cuota_id} value={c.cuota_id}>
                              {c.prestamo_nombre} - Cuota #{c.numero_cuota} {estaVencida ? '(¡VENCIDA!)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* DETALLE DE MORA (SE MUESTRA SI HAY ATRASO) */}
                    {cuotaActivaInfo?.dias_atraso > 0 && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                            <AlertCircle size={12} /> Atraso detectado
                          </span>
                          <span className="text-xs font-bold text-red-500">{cuotaActivaInfo.dias_atraso} días</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-red-500/10 pt-2">
                          <span className="text-xs text-gray-400 font-bold">RECARGO POR MORA:</span>
                          <span className="text-sm font-black text-red-500">+ ${parseFloat(cuotaActivaInfo.mora).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Monto Total a Cobrar</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-cyan" size={20} />
                        <input 
                          disabled
                          type="text"
                          // El estilo cambiará a rojo automáticamente si hay días de atraso
                          className={`w-full bg-fin-charcoal/50 border rounded-xl py-4 pl-12 pr-4 text-xl font-black cursor-not-allowed transition-colors duration-300 ${
                            cuotaActivaInfo?.dias_atraso > 0 
                              ? 'border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                              : 'border-gray-800 text-gray-400'
                          }`}
                          // Mostramos el monto total que ya incluye la mora calculada en el servidor
                          value={cuotaActivaInfo ? `$${parseFloat(cuotaActivaInfo.monto).toLocaleString('es-AR')}` : '$0'}
                        />
                        {cuotaActivaInfo?.dias_atraso > 0 && (
                          <div className="flex justify-between items-center px-2 animate-in fade-in slide-in-from-top-1">
                            <span className="text-[10px] font-bold text-red-500/80 uppercase">
                              Incluye multa por {cuotaActivaInfo.dias_atraso} días de atraso
                            </span>
                            <span className="text-[10px] font-black text-red-500">
                              + ${parseFloat(cuotaActivaInfo.mora).toLocaleString('es-AR')}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tight">
                        {cuotaActivaInfo?.dias_atraso > 0 
                          ? "* El monto incluye capital + intereses punitorios por mora."
                          : "* El sistema no acepta importes fraccionados ni sobrepagos."}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                      <Calendar size={14} />
                      <span>Fecha contable: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="flex-1 bg-fin-charcoal border border-gray-700 text-gray-400 py-4 rounded-xl font-bold hover:text-white transition-all"
                  >
                    VOLVER
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || cuotasDisponibles.length === 0}
                    className="flex-[2] bg-gradient-to-r from-fin-violet to-fin-cyan text-white py-4 rounded-xl font-black shadow-neon-cyan flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "LIQUIDANDO..." : <><CheckSquare size={18} /> REALIZAR COBRO</>}
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrarPagoModal;