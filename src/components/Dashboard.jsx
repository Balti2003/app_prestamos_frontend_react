import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';
import ListaClientes from './ListaClientes';
import NuevoClienteModal from './NuevoClienteModal';
import NuevoPrestamoModal from './NuevoPrestamoModal';
import RegistrarPagoModal from './RegistrarPagoModal';
import HistorialMovimientos from './HistorialMovimientos';
import DetalleClientePerfil from './DetalleClientePerfil';
import MiPerfilUsuario from './MiPerfilUsuario';
import ListaPrestamos from './ListaPrestamos';
import { AperturaCajaModal, ArqueoCierreModal } from './CajaModales';
import { 
  DollarSign, TrendingUp, AlertCircle, ArrowUpRight, 
  CalendarDays, LogOut, UserPlus, FilePlus, ReceiptText, Play, 
  CheckCircle2, FolderLock, FileText, Calculator, Users
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onLogout }) => {
  const { user, esAdmin, tienePermiso } = useAuth();
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

  const chartData = [
    { name: 'Ene', ingresos: 4000 },
    { name: 'Feb', ingresos: 3000 },
    { name: 'Mar', ingresos: 5000 },
    { name: 'Abr', ingresos: 4500 },
    { name: 'May', ingresos: 6000 },
    { name: 'Jun', ingresos: 5500 },
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/resumen/');
      setData(response.data);
      setError(null);
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
  }, [onLogout]);

  const chequearEstadoCaja = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/caja-diaria/estado_actual/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const resData = await res.json();
        setCajaInfo({ cargando: false, abierta: !!resData.caja_abierta, datos: resData });
      } else {
        setCajaInfo({ cargando: false, abierta: false, datos: null });
      }
    } catch (err) {
      console.error("Error al chequear el estado de la caja:", err);
      setCajaInfo({ cargando: false, abierta: false, datos: null });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
    chequearEstadoCaja();
  }, [activeTab, fetchDashboardData, chequearEstadoCaja]);

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

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante_cuota_${cuotaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
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

  const metricas_financieras = data?.metricas_financieras;
  const estado_cartera = data?.estado_cartera;
  const operativo_hoy = data?.operativo_hoy;

  const obtenerIniciales = () => {
    if (!user) return 'US';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username ? user.username.slice(0, 2).toUpperCase() : 'US';
  };

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
        onDescargarComprobante={descargarComprobanteDesembolsoSeguro}
      />

      <RegistrarPagoModal 
        isOpen={isPagoModalOpen} 
        onClose={() => setIsPagoModalOpen(false)} 
        onRefresh={fetchDashboardData} 
      />

      {/* HEADER RESPONSIVO */}
      <header className="p-4 lg:p-6 lg:px-10 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-gray-800 bg-fin-charcoal/30 sticky top-0 z-50 backdrop-blur-md w-full">
        
        {/* SECCIÓN IZQUIERDA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8 w-full lg:w-auto justify-between sm:justify-start">
            <div className="flex flex-col">
                <Brand 
                  size="md"
                  onClick={() => {
                    setSelectedClienteId(null);
                    setActiveTab('resumen');
                  }} 
                />
            </div>

            {/* NAVEGACIÓN */}
            <nav className="flex gap-1 bg-fin-charcoal/50 p-1 rounded-xl border border-gray-800 w-full sm:w-auto justify-center">
              <button 
                onClick={() => { setSelectedClienteId(null); setActiveTab('resumen'); }}
                className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg text-[11px] sm:text-xs font-black transition-all ${activeTab === 'resumen' ? 'bg-fin-violet text-white shadow-neon-violet' : 'text-gray-500 hover:text-white'}`}
              >
                  RESUMEN
              </button>
              <button 
                onClick={() => { setSelectedClienteId(null); setActiveTab('prestamos'); }}
                className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg text-[11px] sm:text-xs font-black transition-all ${activeTab === 'prestamos' ? 'bg-fin-violet text-white shadow-neon-violet' : 'text-gray-500 hover:text-white'}`}
              >
                  PRÉSTAMOS
              </button>
              <button 
                onClick={() => { setSelectedClienteId(null); setActiveTab('clientes'); }}
                className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg text-[11px] sm:text-xs font-black transition-all ${activeTab === 'clientes' ? 'bg-fin-violet text-white shadow-neon-violet' : 'text-gray-500 hover:text-white'}`}
              >
                  CLIENTES
              </button>
              {tienePermiso('puede_ver_caja') && (
                <button 
                  onClick={() => { setSelectedClienteId(null); setActiveTab('movimientos'); }}
                  className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg text-[11px] sm:text-xs font-black transition-all ${activeTab === 'movimientos' ? 'bg-fin-violet text-white shadow-neon-violet' : 'text-gray-500 hover:text-white'}`}
                >
                    MOVIMIENTOS
                </button>
              )}
            </nav>
        </div>

        {/* SECCIÓN DERECHA */}
        <div className="flex items-center justify-between sm:justify-end w-full lg:w-auto gap-4 sm:gap-6 border-t border-gray-800/40 lg:border-t-0 pt-3 lg:pt-0">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  {esAdmin ? 'Administrador' : 'Operador'}
                </span>
                <span className="text-sm font-medium text-white">
                  Hola, {user?.first_name || user?.username || 'Usuario'}
                </span>
            </div>

            <div className="flex items-center gap-4 ml-auto sm:ml-0">
                <div className="flex gap-2">
                    <button 
                        onClick={onLogout}
                        className="bg-fin-charcoal-light p-2.5 rounded-xl border border-gray-800 text-red-400 hover:bg-red-950/20 hover:border-red-900 transition-all shadow-sm group"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform"/>
                    </button>
                </div>

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
                          {obtenerIniciales()}
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-fin-dark-bg rounded-full"></div>
                </div>
            </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:p-6 overflow-hidden flex flex-col">
        
        {activeTab === 'resumen' && (
          <>
            {cajaInfo.cargando ? (
              <div className="mb-6 p-4 bg-fin-charcoal/40 border border-gray-800 rounded-2xl animate-pulse flex h-16 w-full" />
            ) : !cajaInfo.abierta ? (
              <div className="mb-6 p-4 sm:p-5 bg-red-950/20 border border-red-900/40 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
                    <AlertCircle size={20} className="animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">La Caja del Día está Cerrada</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {esAdmin 
                        ? "Debes abrir la caja diaria con un saldo base para poder registrar cobros o préstamos."
                        : "Un administrador debe realizar la apertura de la caja del día para habilitar las operaciones."}
                    </p>
                  </div>
                </div>

                {esAdmin ? (
                  <button
                    onClick={() => setIsAperturaModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-red-500/10 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Play size={14} /> Abrir Caja de Hoy
                  </button>
                ) : (
                  <span className="text-xs text-red-400 font-bold bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-900/50">
                    Apertura Pendiente por Admin
                  </span>
                )}
              </div>
            ) : (
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
                      Abierta por <span className="text-green-400 font-semibold">{cajaInfo.datos?.operador_apertura}</span> con un saldo inicial de <span className="font-semibold text-white">${cajaInfo.datos?.saldo_apertura?.toLocaleString()}</span>.
                    </p>
                  </div>
                </div>

                {esAdmin && (
                  <button
                    onClick={() => setIsCierreModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xs rounded-xl border border-gray-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <FolderLock size={14} /> Realizar Arqueo y Cerrar
                  </button>
                )}
              </div>
            )}

            <div className="mb-10">
                <h2 className="text-4xl font-black tracking-tighter text-white italic">Panel General</h2>
                <p className="text-fin-gray-text text-sm mt-1">Estado de la cartera de préstamos al {new Date().toLocaleDateString()}.</p>
            </div>

            {/* Acciones Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {tienePermiso('puede_crear_cliente') && (
                <QuickActionBtn 
                  icon={<UserPlus />} 
                  title="Nuevo Cliente" 
                  color="cyan" 
                  disabled={!cajaInfo.abierta}
                  onClick={() => setIsModalOpen(true)} 
                />
              )}
              {tienePermiso('puede_crear_prestamo') && (
                <QuickActionBtn 
                  icon={<FilePlus />} 
                  title="Crear Préstamo" 
                  color="violet" 
                  disabled={!cajaInfo.abierta}
                  onClick={() => setIsPrestamoModalOpen(true)} 
                />
              )}
              {tienePermiso('puede_cobrar_cuota') && (
                <QuickActionBtn 
                  icon={<ReceiptText />} 
                  title="Registrar Pago" 
                  color="gray" 
                  disabled={!cajaInfo.abierta}
                  onClick={() => setIsPagoModalOpen(true)} 
                />
              )}
            </div>

            {/* Tarjetas Principales según Permisos */}
            {tienePermiso('puede_ver_metricas') ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                  title="SALDO EN CAJA" 
                  value={`$${metricas_financieras?.saldo_caja_disponible?.toLocaleString() ?? 0}`}
                  icon={<DollarSign />}
                  color="cyan"
                  subtitle="Dinero líquido listo para prestar"
                />
                <StatCard 
                  title="GANANCIA REAL" 
                  value={`$${metricas_financieras?.rentabilidad_acumulada?.toLocaleString() ?? 0}`}
                  icon={<TrendingUp />}
                  color="violet"
                  subtitle="Suma de intereses y mora cobrados"
                />
                <StatCard 
                  title="CAPITAL PRESTADO" 
                  value={`$${metricas_financieras?.capital_en_calle?.toLocaleString() ?? 0}`}
                  icon={<ArrowUpRight />}
                  color="gray"
                  subtitle="Monto base pendiente de cobro"
                />
                <StatCard 
                  title="% MORA ACTIVA" 
                  value={`${estado_cartera?.tasa_mora_porcentaje ?? 0}%`}
                  icon={<AlertCircle />}
                  color="red"
                  subtitle={`${estado_cartera?.prestamos_en_mora ?? 0} préstamos vencidos`}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard 
                  title="COBROS ESPERADOS HOY" 
                  value={`$${operativo_hoy?.cobros_pendientes_hoy?.toLocaleString() ?? 0}`}
                  icon={<ReceiptText />}
                  color="violet"
                  subtitle="Cuotas a cobrar en la jornada"
                />
                <StatCard 
                  title="PRÉSTAMOS ACTIVOS" 
                  value={`${estado_cartera?.prestamos_activos ?? 0}`}
                  icon={<FileText />}
                  color="cyan"
                  subtitle="Contratos vigentes a gestionar"
                />
                <StatCard 
                  title="CUENTAS EN MORA" 
                  value={`${estado_cartera?.prestamos_en_mora ?? 0}`}
                  icon={<AlertCircle />}
                  color="red"
                  subtitle={`${estado_cartera?.tasa_mora_porcentaje ?? 0}% de mora en cartera`}
                />
              </div>
            )}

            {/* Gráfico y Métricas */}
            <div className={`grid grid-cols-1 ${tienePermiso('puede_ver_metricas') ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
              
              {/* Gráfico de Tendencias: Solo si tiene permiso de métricas */}
              {tienePermiso('puede_ver_metricas') && (
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
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.3}/>
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
              )}

              {/* Columna Derecha: Métricas Operativas */}
              <div className="bg-fin-charcoal-light p-8 rounded-3xl shadow-fin-card border border-gray-800 flex flex-col transition hover:border-fin-violet/40">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <CalendarDays className="text-fin-violet h-5 w-5" />
                  Métricas Operativas
                </h3>
                
                <div className="space-y-4 flex-grow">
                  <div className="p-4 bg-fin-charcoal rounded-2xl border border-gray-700 transition group hover:border-fin-cyan/40 flex items-center justify-between">
                    <div>
                      <span className="text-fin-gray-text text-[10px] uppercase font-bold tracking-widest block">Cobros esperados hoy</span>
                      <p className="font-black text-2xl text-white mt-0.5">${operativo_hoy?.cobros_pendientes_hoy?.toLocaleString() ?? 0}</p>
                    </div>
                    <div className="p-2.5 bg-fin-cyan/10 text-fin-cyan rounded-xl border border-fin-cyan/20">
                      <ReceiptText size={18} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-fin-charcoal rounded-2xl border border-gray-700 transition group hover:border-fin-violet/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-fin-gray-text text-[9px] uppercase font-bold tracking-wider">Préstamos Activos</span>
                        <FileText size={14} className="text-fin-violet" />
                      </div>
                      <p className="font-black text-xl text-white">{estado_cartera?.prestamos_activos ?? 0}</p>
                      <span className="text-[9px] text-gray-500 font-bold">Vigentes</span>
                    </div>

                    {tienePermiso('puede_ver_metricas') ? (
                      <div className="p-4 bg-fin-charcoal rounded-2xl border border-gray-700 transition group hover:border-fin-cyan/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-fin-gray-text text-[9px] uppercase font-bold tracking-wider">Promedio Otorgado</span>
                          <Calculator size={14} className="text-fin-cyan" />
                        </div>
                        <p className="font-black text-xl text-white">${Math.round(estado_cartera?.promedio_prestamo ?? 0).toLocaleString()}</p>
                        <span className="text-[9px] text-gray-500 font-bold">Por contrato</span>
                      </div>
                    ) : (
                      <div className="p-4 bg-fin-charcoal rounded-2xl border border-gray-700 transition group hover:border-fin-cyan/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-fin-gray-text text-[9px] uppercase font-bold tracking-wider">Total Clientes</span>
                          <Users size={14} className="text-fin-cyan" />
                        </div>
                        <p className="font-black text-xl text-white">{operativo_hoy?.clientes_total ?? 0}</p>
                        <span className="text-[9px] text-gray-500 font-bold">Registrados</span>
                      </div>
                    )}
                  </div>

                  {tienePermiso('puede_ver_metricas') && (
                    <div className="p-4 bg-fin-charcoal rounded-2xl border border-gray-700 flex items-center justify-between">
                      <div>
                        <span className="text-fin-gray-text text-[10px] uppercase font-bold tracking-widest block">Cartera total clientes</span>
                        <p className="font-black text-2xl text-white mt-0.5">{operativo_hoy?.clientes_total ?? 0}</p>
                      </div>
                      <div className="p-2.5 bg-gray-800 text-gray-400 rounded-xl border border-gray-700">
                        <Users size={18} />
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-2xl">
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Alerta de Mora</p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      Hay <span className="font-bold text-red-400">{estado_cartera?.prestamos_en_mora ?? 0}</span> cuentas que requieren gestión de cobranza inmediata.
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
              <ListaClientes 
                onOpenPayment={abrirModalPagoConCliente} 
                onVerPerfil={(id) => setSelectedClienteId(id)}
              />
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

        {activeTab === 'prestamos' && (
          <div className="w-full overflow-hidden">
            <ListaPrestamos onVerCliente={(clienteId) => {
              setSelectedClienteId(clienteId);
              setActiveTab('clientes');
            }} />
          </div>
        )}
      </main>

      {/* Modales de Caja */}
      <AperturaCajaModal 
        isOpen={isAperturaModalOpen}
        onClose={() => setIsAperturaModalOpen(false)}
        saldoSugerido={cajaInfo.datos?.saldo_sugerido}
        onAperturaExitosa={() => {
          setIsAperturaModalOpen(false);
          chequearEstadoCaja();
        }}
      />

      <ArqueoCierreModal 
        isOpen={isCierreModalOpen}
        datosCaja={cajaInfo.datos}
        onClose={() => setIsCierreModalOpen(false)}
        onCierreExitoso={() => {
          setIsCierreModalOpen(false);
          chequearEstadoCaja();
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