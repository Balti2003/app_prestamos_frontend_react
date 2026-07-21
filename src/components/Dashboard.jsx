import React, { useEffect, useState } from 'react';
import api from '../api';
import Brand from './Brand';
import ListaClientes from './ListaClientes';
import NuevoClienteModal from './NuevoClienteModal';
import NuevoPrestamoModal from './NuevoPrestamoModal';
import RegistrarPagoModal from './RegistrarPagoModal';
import HistorialMovimientos from './HistorialMovimientos';
import DetalleClientePerfil from './DetalleClientePerfil';
import MiPerfilUsuario from './MiPerfilUsuario';
import { AperturaCajaModal, ArqueoCierreModal } from './CajaModales';
import { 
  DollarSign, TrendingUp, AlertCircle, ArrowUpRight, 
  CalendarDays, LogOut, UserPlus, FilePlus, ReceiptText, Play, 
  CheckCircle2, FolderLock 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrestamoModalOpen, setIsPrestamoModalOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [cajaInfo, setCajaInfo] = useState({ cargando: true, abierta: false, datos: null });
  const [isAperturaModalOpen, setIsAperturaModalOpen] = useState(false);
  const [isCierreModalOpen, setIsCierreModalOpen] = useState(false);

  // Datos para el gráfico (puedes reemplazarlos luego con datos del backend)
  const chartData = [
    { name: 'Ene', ingresos: 4000 },
    { name: 'Feb', ingresos: 3000 },
    { name: 'Mar', ingresos: 5000 },
    { name: 'Abr', ingresos: 4500 },
    { name: 'May', ingresos: 6000 },
    { name: 'Jun', ingresos: 5500 },
  ];

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/resumen/');
      setData(response.data);
    } catch (err) {
      console.error("Error al obtener datos:", err);
      if (err.response && err.response.status === 401) {
        onLogout();
      } else {
        setError("No se pudo cargar la información financiera."); 
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para consultar el estado de la caja de hoy en el backend
  const chequearEstadoCaja = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/caja-diaria/estado_actual/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.caja_abierta) {
          setCajaInfo({ cargando: false, abierta: true, datos: data });
        } else {
          setCajaInfo({ cargando: false, abierta: false, datos: data }); // Trae el saldo sugerido
        }
      }
    } catch (error) {
      console.error("Error al chequear el estado de la caja:", error);
      setCajaInfo({ cargando: false, abierta: false, datos: null });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
    chequearEstadoCaja();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-fin-dark-bg text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fin-cyan"></div>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center text-red-400 bg-red-950/30 rounded-2xl m-8 border border-red-900">
      <AlertCircle className="mx-auto mb-2 text-red-500" />
      <p>{error}</p>
    </div>
  );

  // eslint-disable-next-line no-unused-vars
  const abrirModalPagoConCliente = (cliente) => {
    if (!cajaInfo.abierta) {
    alert("No puedes registrar pagos. Debes abrir la caja del día primero.");
    return;
  }
    setActiveTab('resumen');
    setIsPagoModalOpen(true);
  };

  const descargarReciboSeguro = async (cuotaId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/cuotas/${cuotaId}/generar_recibo/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudo descargar el comprobante');
      }

      // Convertimos la respuesta a un archivo binario (Blob)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Creamos un link invisible temporal para disparar la descarga
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante_cuota_${cuotaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando recibo:", error);
      alert("Error al descargar el comprobante. Verifique su sesión.");
    }
  };

  const descargarComprobanteDesembolsoSeguro = async (prestamoId) => {
    try { 
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/prestamos/${prestamoId}/comprobante-desembolso/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar el comprobante de desembolso.');
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
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      alert("Ocurrió un error al intentar descargar el comprobante del préstamo.");
    }
  };

  const { metricas_financieras, estado_cartera, operativo_hoy } = data;

  return (
    <div className="min-h-screen w-full bg-[#07080a] text-white overflow-x-hidden flex flex-col">
      <NuevoClienteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchDashboardData} 
      />

      <NuevoPrestamoModal 
        isOpen={isPrestamoModalOpen} 
        onClose={() => setIsPrestamoModalOpen(false)} 
        onRefresh={fetchDashboardData} 
      />

      <RegistrarPagoModal 
        isOpen={isPagoModalOpen} 
        onClose={() => setIsPagoModalOpen(false)} 
        onRefresh={fetchDashboardData} 
      />

      <NuevoPrestamoModal 
        isOpen={isPrestamoModalOpen} 
        onClose={() => setIsPrestamoModalOpen(false)} 
        onRefresh={fetchDashboardData} 
        onDescargarComprobante={descargarComprobanteDesembolsoSeguro}
      />

      {/* HEADER RESPONSIVO */}
      <header className="p-4 lg:p-6 lg:px-10 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-gray-800 bg-fin-charcoal/30 sticky top-0 z-50 backdrop-blur-md w-full">
        
        {/* SECCIÓN IZQUIERDA: LOGO Y NAVEGACIÓN CENTRAL */}
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8 w-full lg:w-auto justify-between sm:justify-start">
            
            {/* Brand / Logo */}
            <div className="flex flex-col">
                <Brand 
                  size="md"
                  onClick={() => {
                    setSelectedClienteId(null);
                    setActiveTab('resumen');
                  }} 
                />
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] -mt-4 ml-12 italic"></span>
            </div>

            {/* NAVEGACIÓN DE SECCIONES */}
            <nav className="flex gap-1 bg-fin-charcoal/50 p-1 rounded-xl border border-gray-800 w-full sm:w-auto justify-center">
              <button 
                onClick={() => { setSelectedClienteId(null); setActiveTab('resumen'); }}
                className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg text-[11px] sm:text-xs font-black transition-all ${activeTab === 'resumen' ? 'bg-fin-violet text-white shadow-neon-violet' : 'text-gray-500 hover:text-white'}`}
              >
                  RESUMEN
              </button>
              <button 
                onClick={() => { setSelectedClienteId(null); setActiveTab('clientes'); }}
                className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg text-[11px] sm:text-xs font-black transition-all ${activeTab === 'clientes' ? 'bg-fin-violet text-white shadow-neon-violet' : 'text-gray-500 hover:text-white'}`}
              >
                  CLIENTES
              </button>
              <button 
                onClick={() => { setSelectedClienteId(null); setActiveTab('movimientos'); }}
                className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg text-[11px] sm:text-xs font-black transition-all ${activeTab === 'movimientos' ? 'bg-fin-violet text-white shadow-neon-violet' : 'text-gray-500 hover:text-white'}`}
              >
                  MOVIMIENTOS
              </button>
            </nav>
        </div>

        {/* SECCIÓN DERECHA: SESIÓN, LOGOUT Y AVATAR */}
        <div className="flex items-center justify-between sm:justify-end w-full lg:w-auto gap-4 sm:gap-6 border-t border-gray-800/40 lg:border-t-0 pt-3 lg:pt-0">
            
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Sesión Activa</span>
                <span className="text-sm font-medium text-white">Hola, Baltasar</span>
            </div>

            <div className="flex items-center gap-4 ml-auto sm:ml-0">
                {/* Botón Cerrar Sesión */}
                <div className="flex gap-2">
                    <button 
                        onClick={onLogout}
                        className="bg-fin-charcoal-light p-2.5 rounded-xl border border-gray-800 text-red-400 hover:bg-red-950/20 hover:border-red-900 transition-all shadow-sm group"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform"/>
                    </button>
                </div>

                {/* Botón de Perfil BL de la derecha del todo */}
                <div className="relative group">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fin-violet to-fin-cyan flex items-center justify-center font-black text-white shadow-neon-cyan active:scale-95 transition-transform cursor-pointer">
                        <button 
                          onClick={() => {
                            setSelectedClienteId(null);
                            setActiveTab('mi-perfil');
                          }}
                          className={`relative w-11 h-11 rounded-xl bg-black border flex items-center justify-center font-bold text-sm text-white transition-all focus:outline-none ${
                            activeTab === 'mi-perfil' 
                              ? 'border-fin-violet shadow-neon-violet ring-1 ring-fin-violet' 
                              : 'border-gray-700 hover:border-gray-500 shadow-lg shadow-cyan-500/5'
                          }`}
                        >
                          BL
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-fin-dark-bg rounded-full"></div>
                </div>
            </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL CON RENDERIZADO CONDICIONAL TRIPLE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:p-6 overflow-hidden flex flex-col">
        
        {activeTab === 'resumen' && (
          <>
            {/* --- ALERTA Y CONTROL DE CAJA DIARIA */}
            {cajaInfo.cargando ? (
              <div className="mb-6 p-4 bg-fin-charcoal/40 border border-gray-800 rounded-2xl animate-pulse flex h-16 w-full" />
            ) : !cajaInfo.abierta ? (
              /* CAJA CERRADA: Advertencia de bloqueo */
              <div className="mb-6 p-4 sm:p-5 bg-red-950/20 border border-red-900/40 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
                    <AlertCircle size={20} className="animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">La Caja del Día está Cerrada</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Debes abrir la caja diaria con un saldo base para poder registrar cobros o préstamos.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAperturaModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-red-500/10 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Play size={14} /> Abrir Caja de Hoy
                </button>
              </div>
            ) : (
              /* CAJA ABIERTA: Todo en Orden */
              <div className="mb-6 p-4 sm:p-5 bg-green-950/10 border border-green-900/20 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-500/10 rounded-xl text-green-400 border border-green-500/10">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                      Caja Diaria Activa <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Abierta por <span className="text-green-400 font-semibold">{cajaInfo.datos?.operador_apertura}</span> con un saldo inicial de <span className="font-semibold text-white">${cajaInfo.datos?.saldo_apertura.toLocaleString()}</span>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCierreModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xs rounded-xl border border-gray-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <FolderLock size={14} /> Realizar Arqueo y Cerrar
                </button>
              </div>
            )}

            <div className="mb-10">
                <h2 className="text-4xl font-black tracking-tighter text-white italic">Panel General</h2>
                <p className="text-fin-gray-text text-sm mt-1">Estado de la cartera de préstamos al {new Date().toLocaleDateString()}.</p>
            </div>

            {/* --- ACCIONES RÁPIDAS (DESHABILITADAS SI LA CAJA ESTÁ CERRADA) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <QuickActionBtn 
                icon={<UserPlus />} 
                title="Nuevo Cliente" 
                color="cyan" 
                disabled={!cajaInfo.abierta}
                onClick={() => setIsModalOpen(true)} 
              />
              <QuickActionBtn 
                icon={<FilePlus />} 
                title="Crear Préstamo" 
                color="violet" 
                disabled={!cajaInfo.abierta}
                onClick={() => setIsPrestamoModalOpen(true)} 
              />
              <QuickActionBtn 
                icon={<ReceiptText />} 
                title="Registrar Pago" 
                color="gray" 
                disabled={!cajaInfo.abierta}
                onClick={() => setIsPagoModalOpen(true)} 
              />
            </div>

            {/* Grid de Tarjetas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard 
                title="SALDO EN CAJA" 
                value={`$${metricas_financieras.saldo_caja_disponible.toLocaleString()}`}
                icon={<DollarSign />}
                color="cyan"
                subtitle="Dinero líquido listo para prestar"
              />
              <StatCard 
                title="GANANCIA REAL" 
                value={`$${metricas_financieras.rentabilidad_acumulada.toLocaleString()}`}
                icon={<TrendingUp />}
                color="violet"
                subtitle="Suma de intereses y mora cobrados"
              />
              <StatCard 
                title="CAPITAL PRESTADO" 
                value={`$${metricas_financieras.capital_en_calle.toLocaleString()}`}
                icon={<ArrowUpRight />}
                color="gray"
                subtitle="Monto base pendiente de cobro"
              />
              <StatCard 
                title="% MORA ACTIVA" 
                value={`${estado_cartera.tasa_mora_porcentaje}%`}
                icon={<AlertCircle />}
                color="red"
                subtitle={`${estado_cartera.prestamos_en_mora} préstamos vencidos`}
              />
            </div>

            {/* Grid Secundario */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-fin-charcoal p-8 rounded-3xl shadow-fin-card border border-gray-800 flex flex-col group transition hover:border-fin-violet/40">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-fin-cyan" size={20} /> Tendencias de Crecimiento
                      </h3>
                      <div className="flex gap-2 text-sm text-gray-500">
                          <span className="text-fin-cyan font-semibold">Historial</span>
                          <span>Mensual</span>
                      </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#16181f', border: '1px solid #374151', borderRadius: '12px' }}
                          itemStyle={{ color: '#22d3ee' }}
                        />
                        <Area type="monotone" dataKey="ingresos" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              <div className="bg-fin-charcoal-light p-8 rounded-3xl shadow-fin-card border border-gray-800 flex flex-col transition hover:border-fin-violet/40">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <CalendarDays className="text-fin-violet h-5 w-5" />
                  Operaciones del Día
                </h3>
                <div className="space-y-5 flex-grow">
                  <div className="p-5 bg-fin-charcoal rounded-2xl border border-gray-700 transition group hover:border-fin-cyan/40">
                    <span className="text-fin-gray-text text-xs uppercase font-bold tracking-widest">Cobros esperados hoy</span>
                    <p className="font-black text-3xl text-white mt-1">${operativo_hoy.cobros_pendientes_hoy.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-fin-charcoal rounded-2xl border border-gray-700">
                    <span className="text-fin-gray-text text-xs uppercase font-bold tracking-widest">Cartera total de clientes</span>
                    <p className="font-black text-3xl text-white mt-1">{operativo_hoy.clientes_total}</p>
                  </div>
                  <div className="mt-2 p-4 bg-red-950/20 border border-red-900/50 rounded-2xl">
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Alerta Crítica</p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      Hay {estado_cartera.prestamos_en_mora} cuentas que requieren gestión de cobranza inmediata.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'clientes' && (
          selectedClienteId ? (
            <DetalleClientePerfil 
              clienteId={selectedClienteId} 
              onVolver={() => setSelectedClienteId(null)} 
              onDescargarRecibo={descargarReciboSeguro}
            />
          ) : (
            <div className="w-full overflow-hidden">
              <React.Suspense fallback={<div className="h-10 w-full animate-pulse bg-fin-charcoal" />}>
                <ListaClientes 
                  onOpenPayment={abrirModalPagoConCliente} 
                  onVerPerfil={(id) => setSelectedClienteId(id)}
                />
              </React.Suspense>
            </div>
          )
        )}

        {activeTab === 'movimientos' && (
          <div className="w-full overflow-hidden">
            <HistorialMovimientos />
          </div>
        )}

        {activeTab === 'mi-perfil' && (
          <MiPerfilUsuario 
            onVolverALaHome={() => setActiveTab('resumen')} 
          />
        )}
      </main>

      {/* --- INTEGRACIÓN DE MODALES DE CAJA DIARIA */}
      <AperturaCajaModal 
        isOpen={isAperturaModalOpen}
        onClose={() => setIsAperturaModalOpen(false)}
        saldoSugerido={cajaInfo.datos?.saldo_sugerido}
        onAperturaExitosa={() => {
          setIsAperturaModalOpen(false);
          chequearEstadoCaja(); // Refresca el banner principal
        }}
      />

      <ArqueoCierreModal 
        isOpen={isCierreModalOpen}
        datosCaja={cajaInfo.datos}
        onClose={() => setIsCierreModalOpen(false)}
        onCierreExitoso={() => {
          setIsCierreModalOpen(false);
          chequearEstadoCaja(); // Vuelve a consultar el estado y actualiza a modo cerrado
        }}
      />
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const QuickActionBtn = ({ icon, title, color, onClick, disabled }) => {
  const colors = {
    cyan: "hover:border-fin-cyan text-fin-cyan shadow-fin-cyan/5",
    violet: "hover:border-fin-violet text-fin-violet shadow-fin-violet/5",
    gray: "hover:border-white text-white shadow-white/5"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-3 p-5 bg-fin-charcoal border border-gray-800 rounded-2xl transition-all group ${
        disabled 
          ? "opacity-35 cursor-not-allowed hover:scale-100 text-gray-600" 
          : `hover:scale-[1.02] hover:shadow-xl ${colors[color]}`
      }`}
    >
      <div className={`transition-transform ${!disabled && 'group-hover:scale-110'}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="font-bold text-lg">{title}</span>
    </button>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }) => {
  const styles = {
    cyan: { icon: "text-fin-cyan", value: "text-white", border: "border-fin-cyan", bg: "from-fin-cyan/10" },
    violet: { icon: "text-fin-violet", value: "text-white", border: "border-fin-violet", bg: "from-fin-violet/10" },
    gray: { icon: "text-gray-400", value: "text-white", border: "border-gray-700", bg: "from-gray-700/10" },
    red: { icon: "text-red-400", value: "text-red-400", border: "border-red-900", bg: "from-red-900/10" },
  };

  const style = styles[color];

  return (
    <div className={`bg-fin-gradient-card p-7 rounded-3xl shadow-fin-card border border-gray-800 transition-transform hover:-translate-y-1 group relative overflow-hidden`}>
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-radial ${style.bg} to-transparent opacity-50 blur-xl`}></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-fin-gray-text uppercase font-bold tracking-wider">{title}</p>
            <div className={`p-3 rounded-xl bg-fin-charcoal border border-gray-700 ${style.icon}`}>{icon}</div>
        </div>
        <div>
            <h3 className={`text-4xl font-black ${style.value}`}>{value}</h3>
            {subtitle && <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-tight">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;