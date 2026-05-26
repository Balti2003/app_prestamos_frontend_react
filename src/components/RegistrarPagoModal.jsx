import { useState, useEffect } from 'react';
import { X, ReceiptText, DollarSign, Calendar, ArrowRight, Save } from 'lucide-react';
import api from '../api';

const RegistrarPagoModal = ({ isOpen, onClose, onRefresh }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Buscar cliente, 2: Detalle de pago
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  const [formData, setFormData] = useState({
    monto_pago: '',
    notas: ''
  });

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/immutability
      fetchClientes();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(1);
      setSelectedCliente(null);
    }
  }, [isOpen]);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes/');
      setClientes(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/prestamos/registrar_pago/`, {
        cliente_id: selectedCliente.id,
        monto: formData.monto_pago,
      });
      onRefresh();
      onClose();
    } catch {
      alert("Error al registrar el pago.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-fin-dark-bg/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-fin-charcoal-light w-full max-w-lg rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-fin-charcoal/50">
          <h3 className="text-xl font-black italic text-white flex items-center gap-2">
            <ReceiptText className="text-fin-cyan" /> REGISTRAR COBRO
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X size={24} /></button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Selecciona el cliente que realiza el pago</p>
              </div>
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
              <div className="bg-fin-dark-bg/50 p-4 rounded-2xl border border-fin-cyan/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-fin-cyan/20 flex items-center justify-center text-fin-cyan font-black">
                  {selectedCliente.nombre[0]}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Cobrando a:</p>
                  <p className="text-lg font-black text-white">{selectedCliente.nombre} {selectedCliente.apellido}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-cyan" size={20} />
                  <input 
                    required
                    type="number"
                    placeholder="Monto a cobrar"
                    className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white text-xl font-black outline-none focus:border-fin-cyan transition-all"
                    value={formData.monto_pago}
                    onChange={e => setFormData({...formData, monto_pago: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                  <Calendar size={14} />
                  <span>Fecha de operación: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

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
                  disabled={loading}
                  className="flex-[2] bg-gradient-to-r from-fin-violet to-fin-cyan text-white py-4 rounded-xl font-black shadow-neon-cyan flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  {loading ? "PROCESANDO..." : <><Save size={20} /> CONFIRMAR PAGO</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrarPagoModal;