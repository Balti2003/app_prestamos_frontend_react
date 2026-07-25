import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp,   
  Percent, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  ReceiptText,
  ArrowLeft
} from 'lucide-react';
import SeccionGarantias from './SeccionGarantias';
import TarjetaPrestamoVigente from './TarjetaPrestamoVigente';

export default function DetalleClientePerfil({ clienteId, onVolver, onDescargarRecibo }) {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activos');
  const [descargandoDesembolsoId, setDescargandoDesembolsoId] = useState(null);

  const fetchClientePerfil = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`http://localhost:8000/api/clientes/${clienteId}/`, {
      method: 'GET',
      headers: headers
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error en el servidor: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setCliente(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al traer el expediente:", err);
        setLoading(false);
      });
  }, [clienteId]);

  // Buscamos los datos dinámicamente al montar el componente
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchClientePerfil();
  }, [fetchClientePerfil]);

  // Función local para descargar el Comprobante de Desembolso del Préstamo
  const handleDescargarDesembolso = async (prestamoId) => {
    if (!prestamoId) return;
    setDescargandoDesembolsoId(prestamoId);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/prestamos/${prestamoId}/comprobante-desembolso/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("No se pudo generar el comprobante de desembolso.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Comprobante_Desembolso_Prestamo_${prestamoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar comprobante de desembolso:", err);
      alert("Error al intentar descargar el comprobante de desembolso.");
    } finally {
      setDescargandoDesembolsoId(null);
    }
  };

  // Función auxiliar para elegir el color del scoring de puntualidad
  const getPuntualidadColor = (porcentaje) => {
    if (porcentaje >= 85) return 'text-green-400 border-green-500/20 bg-green-500/5';
    if (porcentaje >= 65) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-red-400 border-red-500/20 bg-red-500/5';
  };

  {/* --- VALIDACIONES DE CARGA ANTES DE LA DESESTRUCTURACIÓN --- */}
  if (loading) {
    return (
      <div className="text-center p-20 text-gray-500 text-xs font-black uppercase tracking-widest animate-pulse">
        Cargando expediente del cliente...
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center p-20 text-red-400 text-xs font-black uppercase tracking-widest">
        No se pudieron cargar los datos del cliente.
      </div>
    );
  }

  const { metricas_comportamiento, historial_pagos, prestamos_activos } = cliente;

  return (
    <div className="space-y-6">
      
      {/* Botón de Retorno para volver a la tabla general */}
      <button 
        onClick={onVolver} 
        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors mb-2 focus:outline-none"
      >
        <ArrowLeft size={14} /> Volver a la lista de clientes
      </button>

      {/* --- ENCABEZADO DE EXPEDIENTE CON DATOS DEL CLIENTE --- */}
      <div className="bg-fin-charcoal border border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar con iniciales */}
          <div className="w-14 h-14 rounded-2xl bg-fin-violet/10 border border-fin-violet/30 flex items-center justify-center text-fin-violet font-black text-xl uppercase">
            {cliente.nombre?.[0]}{cliente.apellido?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
                {cliente.nombre} {cliente.apellido}
              </h2>
              {metricas_comportamiento?.tasa_puntualidad_porcentaje < 50 ? (
                <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full animate-pulse">
                  Riesgo Alto
                </span>
              ) : (
                <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full">
                  Perfil Confiable
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
              DNI: <span className="font-mono text-gray-300 italic">{cliente.dni}</span>
            </p>
          </div>
        </div>

        {/* Bloques de contacto rápidos */}
        <div className="flex flex-wrap gap-4 text-xs border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
          <div className="bg-gray-900/40 border border-gray-800/80 px-4 py-2.5 rounded-xl">
            <p className="text-gray-500 font-bold uppercase text-[9px] tracking-widest">Teléfono Celular</p>
            <p className="text-gray-200 font-medium mt-0.5">{cliente.telefono || 'Sin teléfono'}</p>
          </div>
          <div className="bg-gray-900/40 border border-gray-800/80 px-4 py-2.5 rounded-xl">
            <p className="text-gray-500 font-bold uppercase text-[9px] tracking-widest">Dirección Registrada</p>
            <p className="text-gray-200 font-medium mt-0.5">{cliente.direccion || 'Sin dirección'}</p>
          </div>
        </div>
      </div>

      {/* 1. SECCIÓN DE TARJETAS: SCORING Y MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tarjeta: Tasa de Puntualidad */}
        <div className={`border rounded-2xl p-5 transition-all ${getPuntualidadColor(metricas_comportamiento?.tasa_puntualidad_porcentaje)}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Puntualidad Histórica</p>
              <h3 className="text-3xl font-black mt-2">
                {metricas_comportamiento?.tasa_puntualidad_porcentaje}%
              </h3>
            </div>
            <div className="p-2 bg-gray-800/50 rounded-xl border border-gray-700">
              <Percent size={20} />
            </div>
          </div>
          <div className="mt-4 flex gap-3 text-xs opacity-80">
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-400" /> {metricas_comportamiento?.cuotas_a_tiempo} al día</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-amber-400" /> {metricas_comportamiento?.cuotas_con_mora} con retraso</span>
          </div>
        </div>

        {/* Tarjeta: Ganancia Generada */}
        <div className="bg-fin-charcoal border border-gray-800 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Rentabilidad Total</p>
              <h3 className="text-3xl font-black mt-2 text-green-400">
                ${metricas_comportamiento?.ganancia_generada.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2 bg-gray-800 rounded-xl border border-gray-700 text-green-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Total generado por intereses y recargos de mora cobrados.
          </p>
        </div>

        {/* Tarjeta: Resumen de Créditos */}
        <div className="bg-fin-charcoal border border-gray-800 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Historial de Créditos</p>
              <h3 className="text-3xl font-black mt-2">
                {metricas_comportamiento?.total_prestamos} <span className="text-sm font-normal text-gray-500">pedidos</span>
              </h3>
            </div>
            <div className="p-2 bg-gray-800 rounded-xl border border-gray-700 text-fin-violet">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Incluye préstamos activos, en mora y ya finalizados.
          </p>
        </div>

      </div>

      {/* --- SECCIÓN DE GARANTÍAS Y DOCUMENTOS --- */}
      <SeccionGarantias 
        clienteId={cliente.id} 
        garantias={cliente.garantias || []} 
        onRefresh={fetchClientePerfil} 
      />

      {/* 2. SELECTOR DE PESTAÑAS */}
      <div className="flex border-b border-gray-800 gap-6">
        <button
          onClick={() => setActiveTab('activos')}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 ${
            activeTab === 'activos' 
              ? 'border-fin-violet text-white font-extrabold' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Préstamos Vigentes ({prestamos_activos?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 ${
            activeTab === 'historial' 
              ? 'border-fin-violet text-white font-extrabold' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Historial de Pagos ({historial_pagos?.length || 0})
        </button>
      </div>

      {/* 3. CONTENIDO DE LAS PESTAÑAS */}
      <div className="bg-fin-charcoal border border-gray-800 rounded-2xl overflow-hidden">
        
        {/* PESTAÑA: PRÉSTAMOS ACTIVOS */}
        {activeTab === 'activos' && (
          <div className="p-6">
            {prestamos_activos?.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Sin deudas vigentes ni préstamos activos.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {prestamos_activos.map((prestamo) => (
                  <TarjetaPrestamoVigente
                    key={prestamo.id}
                    prestamo={prestamo}
                    onDescargarDesembolso={handleDescargarDesembolso}
                    isDescargando={descargandoDesembolsoId === prestamo.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: HISTORIAL CRONOLÓGICO DE PAGOS */}
        {activeTab === 'historial' && (
          <div className="overflow-x-auto">
            {historial_pagos?.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                Este cliente todavía no ha realizado ningún pago en el sistema.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Préstamo</th>
                    <th className="p-4">N° Cuota</th>
                    <th className="p-4">Fecha Pago</th>
                    <th className="p-4">Capital Base</th>
                    <th className="p-4">Mora Cobrada</th>
                    <th className="p-4 text-center">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-sm text-gray-200">
                  {historial_pagos?.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="p-4 font-mono text-xs text-fin-violet">#{pago.prestamo_id}</td>
                      <td className="p-4 font-medium">Cuota {pago.numero_cuota}</td>
                      <td className="p-4 text-xs text-gray-400">
                        {new Date(pago.fecha_pago_real).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                      </td>
                      <td className="p-4 text-green-400 font-semibold">
                        ${parseFloat(pago.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        {parseFloat(pago.mora_pagada) > 0 ? (
                          <span className="text-amber-500 font-medium bg-amber-500/10 py-1 px-2.5 rounded-full text-xs">
                            +${parseFloat(pago.mora_pagada).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onDescargarRecibo(pago.id)}
                          className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all"
                          title="Descargar Comprobante PDF"
                        >
                          <ReceiptText size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}