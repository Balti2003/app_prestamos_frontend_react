import { useState } from 'react';
import { FileText, Image as ImageIcon, Upload, Trash2, ExternalLink, Plus, AlertTriangle } from 'lucide-react';
import api from '../api';

const SeccionGarantias = ({ clienteId, garantias = [], onRefresh }) => {
  const [subiendo, setSubiendo] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Estado para el modal de confirmación de eliminación
  const [garantiasAEliminar, setGarantiaAEliminar] = useState(null); // guarda { id, titulo }
  const [eliminando, setEliminando] = useState(false);

  const handleSubirGarantia = async (e) => {
    e.preventDefault();
    if (!archivo || !titulo) return;

    setSubiendo(true);
    const formData = new FormData();
    formData.append('cliente', clienteId);
    formData.append('titulo', titulo.trim());
    formData.append('archivo', archivo);

    try {
      await api.post('/garantias/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitulo('');
      setArchivo(null);
      setMostrarForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error al subir garantía:", err);
      alert("Error al subir el archivo.");
    } finally {
      setSubiendo(false);
    }
  };

  // Función para procesar la eliminación desde el modal custom
  const confirmEliminar = async () => {
    if (!garantiasAEliminar) return;

    setEliminando(true);
    try {
      await api.delete(`/garantias/${garantiasAEliminar.id}/`);
      setGarantiaAEliminar(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error al eliminar garantía:", err);
      alert("Error al eliminar la garantía.");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="bg-fin-charcoal border border-gray-800 rounded-3xl p-6 space-y-4 relative">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black italic text-white flex items-center gap-2 uppercase tracking-tight">
          <FileText className="text-fin-cyan" size={20} /> GARANTÍAS Y DOCUMENTACIÓN
        </h3>
        <button
          type="button"
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-1.5 bg-fin-cyan/10 text-fin-cyan hover:bg-fin-cyan hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-fin-cyan/20 active:scale-95"
        >
          <Plus size={14} /> {mostrarForm ? "CANCELAR" : "NUEVA GARANTÍA"}
        </button>
      </div>

      {/* Formulario desplegable de carga */}
      {mostrarForm && (
        <form onSubmit={handleSubirGarantia} className="bg-fin-dark-bg/60 border border-gray-800 p-4 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase">Título / Descripción Documento</label>
            <input
              required
              type="text"
              placeholder="Ej: Título Vehículo / Recibo de Sueldo / Foto DNI"
              className="w-full bg-fin-charcoal border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-fin-cyan mt-1 placeholder-gray-600"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase">Archivo (JPG, PNG, PDF)</label>
            <input
              required
              type="file"
              accept="image/*,application/pdf"
              className="w-full bg-fin-charcoal border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-fin-cyan/20 file:text-fin-cyan hover:file:bg-fin-cyan/30 cursor-pointer mt-1"
              onChange={e => setArchivo(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            disabled={subiendo || !archivo || !titulo}
            className="w-full bg-gradient-to-r from-fin-violet to-fin-cyan text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <Upload size={14} /> {subiendo ? "SUBIENDO..." : "GUARDAR DOCUMENTO"}
          </button>
        </form>
      )}

      {/* Grid de Garantías Cargadas */}
      {garantias.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {garantias.map((g) => (
            <div key={g.id} className="flex items-center justify-between bg-fin-dark-bg/40 border border-gray-800 p-3.5 rounded-2xl hover:border-gray-700 transition">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 bg-fin-charcoal rounded-xl text-fin-cyan flex-shrink-0 border border-gray-800">
                  {g.es_imagen ? <ImageIcon size={18} /> : <FileText size={18} />}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{g.titulo}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {g.fecha_subida ? new Date(g.fecha_subida).toLocaleDateString() : '---'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <a
                  href={g.archivo_url || g.archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-fin-cyan hover:bg-white/5 rounded-lg transition"
                  title="Ver Documento"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => setGarantiaAEliminar({ id: g.id, titulo: g.titulo })}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                  title="Eliminar Documento"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-fin-dark-bg/20 rounded-2xl border border-dashed border-gray-800/80">
          <p className="text-xs text-gray-500 italic">No hay garantías o documentos registrados para este cliente.</p>
        </div>
      )}

      {/* --- MODAL CUSTOM DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
      {garantiasAEliminar && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Overlay oscuro */}
          <div 
            className="absolute inset-0 bg-fin-dark-bg/80 backdrop-blur-sm"
            onClick={() => !eliminando && setGarantiaAEliminar(null)}
          ></div>

          {/* Caja del Modal */}
          <div className="relative bg-fin-charcoal-light w-full max-w-sm rounded-3xl border border-gray-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <AlertTriangle size={22} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                Eliminar Documento
              </h4>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              ¿Estás seguro de que deseas borrar <span className="text-white font-bold">"{garantiasAEliminar.titulo}"</span>? Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={eliminando}
                onClick={() => setGarantiaAEliminar(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                CANCELAR
              </button>
              <button
                type="button"
                disabled={eliminando}
                onClick={confirmEliminar}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {eliminando ? "BORRANDO..." : "SÍ, ELIMINAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeccionGarantias;