import React, { useEffect, useState } from 'react';
import api from '../api';
import Brand from './Brand';
import { 
  DollarSign, TrendingUp, AlertCircle, ArrowUpRight, 
  CalendarDays, Settings, LogOut, UserPlus, FilePlus, ReceiptText 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos para el gráfico (puedes reemplazarlos luego con datos del backend)
  const chartData = [
    { name: 'Ene', ingresos: 4000 },
    { name: 'Feb', ingresos: 3000 },
    { name: 'Mar', ingresos: 5000 },
    { name: 'Abr', ingresos: 4500 },
    { name: 'May', ingresos: 6000 },
    { name: 'Jun', ingresos: 5500 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/resumen/');
        setData(response.data);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        // SI EL ERROR ES 401 (Token expirado), CERRAMOS SESIÓN
        if (err.response && err.response.status === 401) {
          onLogout(); // Esto limpia el localStorage y te manda al Login
        } else {
          setError("No se pudo cargar la información financiera.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const { metricas_financieras, estado_cartera, operativo_hoy } = data;

  return (
    <div className="min-h-screen bg-fin-dark-bg text-white font-sans">
      
      {/* HEADER */}
      <header className="p-6 lg:px-10 flex justify-between items-center border-b border-gray-800 bg-fin-charcoal/30 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex flex-col">
            <Brand size="sm" /> 
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] -mt-4 ml-12">Tablero de Control</span>
        </div>

        <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Sesión Activa</span>
                <span className="text-sm font-medium text-white">Hola, Baltasar</span>
            </div>

            <div className="flex gap-2">
                <button className="bg-fin-charcoal-light p-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white transition-all hover:border-fin-violet/50 shadow-sm">
                    <Settings size={18}/>
                </button>
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
                    BL
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-fin-dark-bg rounded-full"></div>
            </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="p-6 lg:p-10 max-w-[1600px] mx-auto">
        <div className="mb-10">
            <h2 className="text-4xl font-black tracking-tighter text-white italic">Panel General</h2>
            <p className="text-fin-gray-text text-sm mt-1">Estado de la cartera de préstamos al {new Date().toLocaleDateString()}.</p>
        </div>

        {/* --- NUEVA SECCIÓN: ACCIONES RÁPIDAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <QuickActionBtn icon={<UserPlus />} title="Nuevo Cliente" color="cyan" />
          <QuickActionBtn icon={<FilePlus />} title="Crear Préstamo" color="violet" />
          <QuickActionBtn icon={<ReceiptText />} title="Registrar Pago" color="gray" />
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
          
          {/* --- GRÁFICO REAL IMPLEMENTADO --- */}
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

          {/* Operativo del Día */}
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
              {/* Alerta de Mora */}
              <div className="mt-2 p-4 bg-red-950/20 border border-red-900/50 rounded-2xl">
                <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Alerta Crítica</p>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Hay {estado_cartera.prestamos_en_mora} cuentas que requieren gestión de cobranza inmediata.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const QuickActionBtn = ({ icon, title, color }) => {
  const colors = {
    cyan: "hover:border-fin-cyan text-fin-cyan shadow-fin-cyan/5",
    violet: "hover:border-fin-violet text-fin-violet shadow-fin-violet/5",
    gray: "hover:border-white text-white shadow-white/5"
  };
  return (
    <button className={`flex items-center justify-center gap-3 p-5 bg-fin-charcoal border border-gray-800 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl group ${colors[color]}`}>
      <div className="transition-transform group-hover:scale-110">
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