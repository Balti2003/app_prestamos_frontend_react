import React, { useState } from 'react';
import { X, User, Phone, MapPin, IdCard, Save, FileText } from 'lucide-react';
import api from '../api';

const NuevoClienteModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    direccion: ''
  });
  const [loading, setLoading] = useState(false);
  const [tituloGarantia, setTituloGarantia] = useState('');
  const [archivoGarantia, setArchivoGarantia] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear el cliente
      const resCliente = await api.post('/clientes/', formData);
      const nuevoClienteId = resCliente.data.id;

      // 2. Si adjuntó garantía opcional
      if (archivoGarantia && nuevoClienteId) {
        const dataGarantia = new FormData();
        dataGarantia.append('cliente', nuevoClienteId);
        dataGarantia.append('titulo', tituloGarantia.trim() || 'Garantía Inicial');
        dataGarantia.append('archivo', archivoGarantia);

        await api.post('/garantias/', dataGarantia, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // 3. Limpieza y refresco
      onRefresh();
      onClose();
      setFormData({ nombre: '', apellido: '', dni: '', telefono: '', direccion: '' });
      setTituloGarantia('');
      setArchivoGarantia(null);

    } catch (err) {
      console.error("Error al crear cliente:", err);
      if (err.response && err.response.data) {
        const firstError = Object.values(err.response.data)[0];
        alert("Error: " + firstError);
      } else {
        alert("Error al crear cliente. Revisa los datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div className="absolute inset-0 bg-fin-dark-bg/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Contenedor del Modal */}
      <div className="relative bg-fin-charcoal-light w-full max-w-lg rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-fin-charcoal/50">
          <h3 className="text-xl font-black italic text-white flex items-center gap-2">
            <User className="text-fin-cyan" /> REGISTRAR NUEVO CLIENTE
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <ModalInput 
              icon={<User />} 
              placeholder="Nombre" 
              value={formData.nombre} 
              onChange={v => setFormData({...formData, nombre: v})} 
            />
            <ModalInput 
              icon={<User />} 
              placeholder="Apellido" 
              value={formData.apellido} 
              onChange={v => setFormData({...formData, apellido: v})} 
            />
          </div>

          <ModalInput 
            icon={<IdCard />} 
            placeholder="DNI / Identificación" 
            value={formData.dni} 
            onChange={v => setFormData({...formData, dni: v})} 
          />
          
          <ModalInput 
            icon={<Phone />} 
            placeholder="Teléfono celular (Ej: 3534123456)" 
            value={formData.telefono} 
            onChange={v => setFormData({...formData, telefono: v})} 
          />
          
          <div>
            <ModalInput 
              icon={<MapPin />} 
              placeholder="Dirección (Ej: Bv. Sarmiento 450 o Calle 123, Ciudad)" 
              value={formData.direccion} 
              onChange={v => setFormData({...formData, direccion: v})} 
            />
            <p className="text-[10px] text-gray-500 mt-1.5 ml-1">
              * Ingresa calle y altura. Si es de otra ciudad, indícala (Ej: <i>San Martín 150, Leones</i>).
            </p>
          </div>

          {/* SECCIÓN OPCIONAL: GARANTÍA O DOCUMENTACIÓN */}
          <div className="border-t border-gray-800 pt-4 mt-2 space-y-3">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <FileText size={12} className="text-fin-cyan" /> ADJUNTAR GARANTÍA / DOCUMENTACIÓN (OPCIONAL)
            </p>

            <div>
              <input
                type="text"
                placeholder="Título (Ej: Recibo de Sueldo / DNI / Título Auto)"
                className="w-full bg-fin-charcoal border border-gray-700 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-fin-cyan transition-all"
                value={tituloGarantia}
                onChange={(e) => setTituloGarantia(e.target.value)}
              />
            </div>

            <div className="relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="w-full bg-fin-charcoal border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-fin-cyan/20 file:text-fin-cyan hover:file:bg-fin-cyan/30 cursor-pointer"
                onChange={(e) => setArchivoGarantia(e.target.files[0])}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-fin-violet to-fin-cyan text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:opacity-90 shadow-neon-cyan transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "PROCESANDO..." : <><Save size={20} /> GUARDAR CLIENTE</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const ModalInput = ({ icon, placeholder, value, onChange }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-fin-cyan transition-colors">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <input
      required
      className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-fin-cyan focus:ring-1 focus:ring-fin-cyan transition-all text-sm"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default NuevoClienteModal;