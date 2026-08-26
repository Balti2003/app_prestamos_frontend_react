import { ChevronLeft, ChevronRight } from 'lucide-react';

const Paginador = ({ paginaActual, totalRegistros, porPagina = 10, onCambiarPagina }) => {
  const totalPaginas = Math.ceil(totalRegistros / porPagina);

  if (totalPaginas <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-fin-charcoal/40 border-t border-gray-800 text-xs text-gray-400">
      <span>
        Mostrando página <strong className="text-white">{paginaActual}</strong> de <strong className="text-white">{totalPaginas}</strong> ({totalRegistros} registros en total)
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual <= 1}
          className="p-2 rounded-xl bg-fin-charcoal border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:hover:border-gray-700 disabled:cursor-not-allowed transition-all"
          title="Página Anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="px-3 py-1 bg-fin-charcoal-light border border-gray-700 rounded-lg text-white font-mono font-bold">
          {paginaActual}
        </span>

        <button
          type="button"
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
          className="p-2 rounded-xl bg-fin-charcoal border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:hover:border-gray-700 disabled:cursor-not-allowed transition-all"
          title="Página Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Paginador;