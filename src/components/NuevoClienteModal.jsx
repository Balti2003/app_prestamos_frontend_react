import React, { useState } from 'react';
import { X, User, Phone, MapPin, IdCard, Save } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/clientes/', formData);
      onRefresh();
      onClose();
      setFormData({ nombre: '', apellido: '', dni: '', telefono: '', direccion: '' });
    } catch {
      alert("Error al crear cliente. Revisa los datos.");
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
            <ModalInput icon={<User />} placeholder="Nombre" value={formData.nombre} 
              onChange={v => setFormData({...formData, nombre: v})} />
            <ModalInput icon={<User />} placeholder="Apellido" value={formData.apellido} 
              onChange={v => setFormData({...formData, apellido: v})} />
          </div>

          <ModalInput icon={<IdCard />} placeholder="DNI / Identificación" value={formData.dni} 
            onChange={v => setFormData({...formData, dni: v})} />
          
          <ModalInput icon={<Phone />} placeholder="Teléfono de contacto" value={formData.telefono} 
            onChange={v => setFormData({...formData, telefono: v})} />
          
          <ModalInput icon={<MapPin />} placeholder="Dirección completa" value={formData.direccion} 
            onChange={v => setFormData({...formData, direccion: v})} />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-fin-violet to-fin-cyan text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:opacity-90 shadow-neon-cyan transition-all disabled:opacity-50"
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
      className="w-full bg-fin-charcoal border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-fin-cyan focus:ring-1 focus:ring-fin-cyan transition-all"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default NuevoClienteModal;