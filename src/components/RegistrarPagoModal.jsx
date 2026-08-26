import { useState, useEffect, useMemo } from 'react';
import { X, ReceiptText, DollarSign, Calendar, ArrowRight, CheckSquare, Layers, Wallet, ArrowRightLeft, CreditCard, Edit3 } from 'lucide-react';
import api from '../api';

const RegistrarPagoModal = ({ isOpen, onClose, onRefresh }) => {
  const [clientes, setClientes] = useState([]);
  const [prestamosCliente, setPrestamosCliente] = useState([]);
  const [selectedPrestamoId, setSelectedPrestamoId] = useState('');
  const [cuotasDisponibles, setCuotasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [montoIngresado, setMontoIngresado] = useState('');
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [idCuotaPagada, setIdCuotaPagada] = useState(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [metodoPagoDetalle, setMetodoPagoDetalle] = useState(''); // 👈 Nuevo estado

  const parsearMonto = (valor) => {
    if (valor === null || valor === undefined) return 0;
    const limpio = String(valor).replace(/\$/g, '').replace(/,/g, '.').trim();
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/immutability
      fetchClientes();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(1);
      setSelectedCliente(null);
      setPrestamosCliente([]);
      setSelectedPrestamoId('');
      setCuotasDisponibles([]);
      setMontoIngresado('');
      setMetodoPago('efectivo');
      setMetodoPagoDetalle('');
      setPagoExitoso(false);
      setIdCuotaPagada(null);
    }
  }, [isOpen]);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes/todos/');
      setClientes(res.data);
    } catch (err) { console.error("Error cargando clientes", err); }
  };

  const handleSelectCliente = async (cliente) => {
    setSelectedCliente(cliente);
    setLoadingCuotas(true);
    setStep(2);
    try {
      const res = await api.get(`/clientes/${cliente.id}/cuotas_cobrables/`);
      const cuotas = res.data || [];
      const idsPrestamos = [...new Set(cuotas.map(c => c.prestamo_id || c.prestamo))].filter(Boolean);
      setPrestamosCliente(idsPrestamos);

      if (idsPrestamos.length > 0) {
        const firstId = idsPrestamos[0];
        setSelectedPrestamoId(firstId.toString());
        filtrarYSetearCuotas(cuotas, firstId);
      } else {
        setCuotasDisponibles([]);
      }
    } catch (err) {
      console.error("Error al obtener cuotas cobrables", err);
    } finally {
      setLoadingCuotas(false);
    }
  };

  const filtrarYSetearCuotas = (todasLasCuotas, prestamoId) => {
    const cuotasDelPrestamo = todasLasCuotas.filter(
      c => String(c.prestamo_id || c.prestamo) === String(prestamoId)
    );
    setCuotasDisponibles(cuotasDelPrestamo);

    if (cuotasDelPrestamo.length > 0) {
      const primeraCuota = cuotasDelPrestamo[0];
      const total = parsearMonto(primeraCuota.monto_total ?? primeraCuota.monto ?? 0);
      const pagadoAnteriormente = parsearMonto(primeraCuota.monto_pagado);
      
      const saldoRemanente = primeraCuota.saldo_pendiente !== undefined && primeraCuota.saldo_pendiente !== null
        ? parsearMonto(primeraCuota.saldo_pendiente)
        : Math.max(0, total - pagadoAnteriormente);

      setMontoIngresado(saldoRemanente.toString());
    } else {
      setMontoIngresado('');
    }
  };

  const handleCambioPrestamo = (nuevoPrestamoId) => {
    setSelectedPrestamoId(nuevoPrestamoId);
    if (selectedCliente) {
      api.get(`/clientes/${selectedCliente.id}/cuotas_cobrables/`).then(res => {
        filtrarYSetearCuotas(res.data || [], nuevoPrestamoId);
      });
    }
  };

  const simulacion = useMemo(() => {
    const monto = parsearMonto(montoIngresado);
    if (monto <= 0 || !cuotasDisponibles || cuotasDisponibles.length === 0) {
      return { desgloses: [], sobrante: 0 };
    }

    let disponible = monto;
    const cuotasOrdenadas = [...cuotasDisponibles].sort(
      (a, b) => (a.numero_cuota || 0) - (b.numero_cuota || 0)
    );

    const desgloses = [];

    for (const c of cuotasOrdenadas) {
      if (disponible <= 0) break;

      const moraCuota = parsearMonto(c.mora || c.mora_actual);
      const totalCuota = parsearMonto(c.monto_total ?? c.monto ?? 0);
      const pagadoAnteriormente = parsearMonto(c.monto_pagado);

      // eslint-disable-next-line no-useless-assignment
      let saldoCapital = 0;
      if (c.saldo_pendiente !== undefined && c.saldo_pendiente !== null) {
        saldoCapital = parsearMonto(c.saldo_pendiente);
      } else {
        saldoCapital = Math.max(0, totalCuota - pagadoAnteriormente);
      }

      let moraAbonada = 0;
      let capitalAbonado = 0;

      if (moraCuota > 0) {
        moraAbonada = Math.min(disponible, moraCuota);
        disponible -= moraAbonada;
      }

      if (disponible > 0 && saldoCapital > 0) {
        capitalAbonado = Math.min(disponible, saldoCapital);
        disponible -= capitalAbonado;
      }

      const resta = Math.max(0, saldoCapital - capitalAbonado);

      desgloses.push({
        numero_cuota: c.numero_cuota,
        moraAbonada,
        capitalAbonado,
        saldoRestante: resta,
        saldada: resta <= 0.01
      });
    }

    return { desgloses, sobrante: disponible };
  }, [montoIngresado, cuotasDisponibles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const monto = parsearMonto(montoIngresado);
    if (monto <= 0 || !selectedPrestamoId) return;

    if (metodoPago === 'otro' && !metodoPagoDetalle.trim()) {
      alert("Por favor, especifica la descripción de la forma de pago.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/prestamos/${selectedPrestamoId}/registrar-pago/`, {
        monto: monto,
        metodo_pago: metodoPago,
        metodo_pago_detalle: metodoPagoDetalle.trim() // 👈 Enviamos la descripción
      });

      if (response.data.desglose && response.data.desglose.length > 0) {
        setIdCuotaPagada(response.data.desglose[0].cuota_id || response.data.cuota_id);
      }

      setPagoExitoso(true);
      if (onRefresh) onRefresh();

    } catch (err) {
      const mensajeError = err.response?.data?.error || err.response?.data?.detail || "Error al registrar el pago en caja.";
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-fin-dark-bg/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-fin-charcoal-light w-full max-w-lg rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-fin-charcoal/50">
          <h3 className="text-xl font-black italic text-white flex items-center gap-2">
            <ReceiptText className="text-fin-cyan" /> REGISTRAR PAGO
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X size={24} /></button>
        </div>

        <div className="p-8">
          {pagoExitoso ? (
            <div className="py-10 flex flex-col items-center text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-neon-green">
                <CheckSquare size={40} />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 uppercase italic">¡Pago Registrado!</h3>
              <p className="text-gray-400 text-sm mb-8">
                El cobro fue procesado correctamente y asentado en caja.
              </p>

              <div className="flex flex-col w-full gap-3">
                {idCuotaPagada && (
                  <button 
                    onClick={descargarPDF}
                    className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-fin-cyan hover:text-white transition-all group"
                  >
                    <ReceiptText size={18} /> DESCARGAR COMPROBANTE
                  </button>
                )}
                
                <button 
                  onClick={onClose}
                  className="w-full bg-fin-charcoal border border-gray-800 text-gray-400 py-4 rounded-xl font-bold hover:text-white transition-all"
                >
                  CERRAR
                </button>
              </div>
            </div>
          ) : (
            step === 1 ? (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm text-center">Seleccioná el cliente que realizará el pago</p>
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
              <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4">
                
                {/* INFO DEL CLIENTE */}
                <div className="bg-fin-dark-bg/50 p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-fin-violet/20 flex items-center justify-center text-fin-violet font-black">
                      {selectedCliente.nombre[0]}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Cliente</p>
                      <p className="text-lg font-black text-white">{selectedCliente.nombre} {selectedCliente.apellido}</p>
                    </div>
                  </div>
                </div>

                {/* SELECTOR DE PRÉSTAMO */}
                {prestamosCliente.length > 1 && (
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers size={14} className="text-fin-violet" />
                      Seleccionar Contrato a Cobrar
                    </label>
                    <select
                      value={selectedPrestamoId}
                      onChange={(e) => handleCambioPrestamo(e.target.value)}
                      className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-fin-violet transition-colors"
                    >
                      {prestamosCliente.map((pId) => (
                        <option key={pId} value={pId}>
                          Préstamo / Contrato #{pId}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {loadingCuotas ? (
                  <p className="text-center text-xs text-fin-cyan animate-pulse py-4 font-bold">Buscando cuotas del contrato...</p>
                ) : cuotasDisponibles.length === 0 ? (
                  <div className="text-center py-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-red-400 text-sm font-bold">No hay cuotas pendientes para este contrato.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    
                    {/* MONTO */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        Monto Ingresado para Préstamo #{selectedPrestamoId} ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-cyan" size={20} />
                        <input 
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={montoIngresado}
                          onChange={(e) => setMontoIngresado(e.target.value)}
                          className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-xl font-mono font-black text-white outline-none focus:border-fin-cyan transition-colors"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* SELECTOR FORMA DE PAGO */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        Forma de Pago
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setMetodoPago('efectivo')}
                          className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border ${
                            metodoPago === 'efectivo'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-lg'
                              : 'bg-fin-charcoal text-gray-400 border-gray-800 hover:text-white'
                          }`}
                        >
                          <Wallet size={16} />
                          <span>Efectivo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMetodoPago('transferencia')}
                          className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border ${
                            metodoPago === 'transferencia'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-lg'
                              : 'bg-fin-charcoal text-gray-400 border-gray-800 hover:text-white'
                          }`}
                        >
                          <ArrowRightLeft size={16} />
                          <span>Transferencia</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMetodoPago('otro')}
                          className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border ${
                            metodoPago === 'otro'
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-lg'
                              : 'bg-fin-charcoal text-gray-400 border-gray-800 hover:text-white'
                          }`}
                        >
                          <CreditCard size={16} />
                          <span>Otro</span>
                        </button>
                      </div>

                      {/* ⚡ CAMPO DESCRIPCIÓN CONDICIONAL */}
                      {metodoPago === 'otro' && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                            <Edit3 size={12} className="text-purple-400" /> Descripción del Medio de Pago
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Cheque N° 849302, Dólares billete, Permuta..."
                            value={metodoPagoDetalle}
                            onChange={(e) => setMetodoPagoDetalle(e.target.value)}
                            className="w-full bg-fin-charcoal border border-purple-500/40 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>

                    {/* PREVISUALIZACIÓN */}
                    {simulacion.desgloses.length > 0 && (
                      <div className="p-4 bg-fin-dark-bg/60 border border-gray-800 rounded-2xl space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-gray-800 pb-1.5">
                          Distribución en Contrato #{selectedPrestamoId}
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                          {simulacion.desgloses.map((d) => (
                            <div key={d.numero_cuota} className="flex justify-between items-center text-xs font-mono py-1 border-b border-gray-800/40 last:border-0">
                              <span className="text-gray-300 font-bold">Cuota #{d.numero_cuota}</span>
                              <div className="text-right">
                                {d.moraAbonada > 0 && (
                                  <span className="text-red-400 text-[10px] block">+${d.moraAbonada.toLocaleString('es-AR', { minimumFractionDigits: 2 })} Mora</span>
                                )}
                                <span className="text-fin-cyan font-bold">${d.capitalAbonado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                {d.saldada ? (
                                  <span className="text-[10px] text-emerald-400 font-bold ml-2">✓ Completada</span>
                                ) : (
                                  <span className="text-[10px] text-amber-400 font-bold ml-2">(Resta ${d.saldoRestante.toLocaleString('es-AR', { minimumFractionDigits: 2 })})</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                      <Calendar size={14} />
                      <span>Fecha contable: {new Date().toLocaleDateString('es-AR')}</span>
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
                    disabled={loading || cuotasDisponibles.length === 0 || parsearMonto(montoIngresado) <= 0 || (metodoPago === 'otro' && !metodoPagoDetalle.trim())}
                    className="flex-[2] bg-gradient-to-r from-fin-violet to-fin-cyan text-white py-4 rounded-xl font-black shadow-neon-cyan flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "PROCESANDO..." : <><CheckSquare size={18} /> ASENTAR COBRO</>}
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