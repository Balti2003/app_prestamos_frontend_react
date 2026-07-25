import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock 
} from 'lucide-react';

export default function TarjetaPrestamoVigente({ prestamo, onDescargarDesembolso, isDescargando }) {
  const [mostrarCuotas, setMostrarCuotas] = useState(false);

  const montoNumeric = parseFloat(prestamo.monto_solicitado);
  const montoFormateado = !isNaN(montoNumeric) 
    ? `$${montoNumeric.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
    : '—';

  const montoCuotaNumeric = parseFloat(prestamo.monto_cuota);
  const montoCuotaFormateado = !isNaN(montoCuotaNumeric)
    ? `$${montoCuotaNumeric.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
    : '—';

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 space-y-4">
      
      {/* Encabezado del Préstamo */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
        <div>
          <span className="text-xs font-bold text-fin-violet font-mono uppercase tracking-wider">
            Contrato #{prestamo.id}
          </span>
          <h4 className="text-lg font-black text-white mt-0.5">
            Préstamo Activo
          </h4>
        </div>

        <div className="flex items-center gap-3">
          {/* BOTÓN DESEMBOLSO DE PRÉSTAMO */}
          <button
            onClick={() => onDescargarDesembolso(prestamo.id)}
            disabled={isDescargando}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isDescargando 
                ? 'bg-gray-800 text-gray-600 animate-pulse border border-gray-700' 
                : 'bg-fin-violet/10 text-fin-violet hover:bg-fin-violet hover:text-white border border-fin-violet/30'
            }`}
            title="Descargar Comprobante de Desembolso para Firma"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Comprobante Prestamo</span>
          </button>

          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
            prestamo.estado === 'mora' 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' 
              : 'bg-fin-cyan/10 text-fin-cyan border border-fin-cyan/20'
          }`}>
            {prestamo.estado === 'mora' ? 'En Mora' : 'Al día'}
          </span>
        </div>
      </div>

      {/* Fila de Métricas Reales del Préstamo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Monto Otorgado</p>
          <p className="text-white font-mono font-bold mt-0.5">
            {montoFormateado}
          </p>
        </div>
        <div>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Valor de Cuota</p>
          <p className="text-fin-cyan font-mono font-bold mt-0.5">
            {montoCuotaFormateado}
          </p>
        </div>
        <div>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Progreso de Pagos</p>
          <p className="text-gray-300 mt-0.5 font-medium">
            {prestamo.cuotas_pagadas} / {prestamo.cuotas_totales} <span className="text-xs text-gray-500 font-normal">pagas</span>
          </p>
        </div>
        <div>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Estado de cuenta</p>
          <p className="text-gray-300 mt-0.5 capitalize font-medium">
            {prestamo.estado}
          </p>
        </div>
      </div>

      {/* SECCIÓN DESPLEGABLE: CALENDARIO DE CUOTAS / VENCIMIENTOS */}
      <div className="border-t border-gray-800/80 pt-3">
        <button
          type="button"
          onClick={() => setMostrarCuotas(!mostrarCuotas)}
          className="flex items-center gap-2 text-xs font-bold text-fin-violet hover:text-white transition group"
        >
          <Calendar size={14} className="group-hover:scale-110 transition-transform" />
          <span>{mostrarCuotas ? "Ocultar Cronograma de Cuotas" : "Ver Fechas de Vencimiento de Cuotas"}</span>
          {mostrarCuotas ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {mostrarCuotas && (
            <div className="mt-3 bg-fin-charcoal/80 border border-gray-800 rounded-xl p-3.5 space-y-2 animate-in fade-in duration-200">
                <div className="grid grid-cols-12 text-[10px] font-bold text-gray-500 uppercase pb-1.5 border-b border-gray-800 tracking-wider">
                <span className="col-span-2">Cuota</span>
                <span className="col-span-4">Vencimiento</span>
                <span className="col-span-3">Monto</span>
                <span className="col-span-3 text-right">Estado</span>
                </div>

                {prestamo.plan_pagos && prestamo.plan_pagos.length > 0 ? (
                prestamo.plan_pagos.map((cuota) => {
                    // Tolerancia a nombres de variables del backend:
                    const estaPagada = cuota.esta_pagada ?? cuota.pagado;
                    const montoCuota = cuota.monto_total ?? cuota.monto ?? prestamo.monto_cuota ?? 0;

                    return (
                    <div key={cuota.id || cuota.numero_cuota} className="grid grid-cols-12 text-xs items-center py-1.5 border-b border-gray-800/40 last:border-0">
                        <span className="col-span-2 font-mono font-bold text-gray-300">
                        #{cuota.numero_cuota}
                        </span>
                        <span className="col-span-4 font-mono text-gray-300">
                        {cuota.fecha_vencimiento}
                        </span>
                        <span className="col-span-3 font-mono text-white font-bold">
                        ${parseFloat(montoCuota).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="col-span-3 text-right">
                        {estaPagada ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle size={10} /> Pagada
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Clock size={10} /> Pendiente
                            </span>
                        )}
                        </span>
                    </div>
                    );
                })
                ) : (
                <p className="text-xs text-gray-500 italic py-1">No hay detalle de cuotas disponible para este contrato.</p>
                )}
            </div>
        )}
    </div>
    </div>
  );
}