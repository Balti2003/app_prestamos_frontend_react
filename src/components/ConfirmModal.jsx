import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, titulo, mensaje, loading, isAlert = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Fondo oscuro con desfoque */}
      <div 
        className="absolute inset-0 bg-fin-dark-bg/90 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Tarjeta del Modal */}
      <div className="relative bg-fin-charcoal-light w-full max-w-md rounded-3xl border border-gray-800 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Botón Cerrar Superior */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Contenido Principal */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          
          {/* Icono */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 shadow-neon-red">
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">
            {titulo || '¿Confirmar Acción?'}
          </h3>

          <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
            {mensaje || 'Esta acción no se podrá deshacer. ¿Deseas continuar?'}
          </p>
        </div>

        {/* Botones de Acción Condicionales */}
        <div className="flex gap-3 mt-4">
          {isAlert ? (
            // MODO ADVERTENCIA: Un solo botón para cerrar
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-fin-charcoal border border-gray-700 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all text-xs uppercase tracking-wider"
            >
              ENTENDIDO
            </button>
          ) : (
            // MODO CONFIRMACIÓN: Botones Cancelar / Eliminar
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-fin-charcoal border border-gray-700 text-gray-400 py-3.5 rounded-xl font-bold hover:text-white hover:bg-gray-800 transition-all text-xs uppercase tracking-wider"
              >
                CANCELAR
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/40 py-3.5 rounded-xl font-black transition-all shadow-lg text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'ELIMINANDO...' : 'SÍ, ELIMINAR'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;