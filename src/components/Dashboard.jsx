import { useEffect, useState } from 'react';
import api from '../api';
import Brand from './Brand';
import { DollarSign, TrendingUp, AlertCircle, ArrowUpRight, CalendarDays, Settings } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/resumen/');
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener datos del dashboard:", err);
        setError("No se pudo cargar la información financiera.");
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
    <div className="p-6 lg:p-10 min-h-screen bg-fin-dark-bg text-white">
      {/* Header del Dashboard */}
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-800">
        <div>
            <Brand />
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Tablero de Operaciones</h2>
            <p className="text-fin-gray-text text-sm">Resumen en tiempo real del estado de la cartera.</p>
        </div>
        <div className="flex gap-3 items-center">
            <p className="text-sm text-gray-500 mr-2">Hola, Admin</p>
            <button className="bg-fin-charcoal-light p-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white transition hover:border-gray-600"><Settings size={20}/></button>
            <div className="w-12 h-12 rounded-full bg-fin-gradient-main flex items-center justify-center font-bold text-lg text-white shadow-neon-cyan">AD</div>
        </div>
      </div>

      {/* Grid de Tarjetas Principales: Estilo High-Tech */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Caja Disponible */}
        <StatCard 
          title="SALDO EN CAJA" 
          value={`$${metricas_financieras.saldo_caja_disponible.toLocaleString()}`}
          icon={<DollarSign />}
          color="cyan"
          subtitle="Dinero líquido listo para prestar"
        />

        {/* Rentabilidad */}
        <StatCard 
          title="GANANCIA REAL" 
          value={`$${metricas_financieras.rentabilidad_acumulada.toLocaleString()}`}
          icon={<TrendingUp />}
          color="violet"
          subtitle="Suma de intereses y mora cobrados"
        />

        {/* Capital en Calle */}
        <StatCard 
          title="CAPITAL PRESTADO" 
          value={`$${metricas_financieras.capital_en_calle.toLocaleString()}`}
          icon={<ArrowUpRight />}
          color="gray"
          subtitle="Monto base pendiente de cobro"
        />

        {/* Tasa de Mora */}
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
        
        {/* Gráfico Simulado */}
        <div className="lg:col-span-2 bg-fin-charcoal p-8 rounded-3xl shadow-fin-card border border-gray-800 flex flex-col justify-between group transition hover:border-fin-violet/40">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Tendencias de Crecimiento</h3>
                <div className="flex gap-2 text-sm text-gray-500">
                    <span className="text-fin-cyan font-semibold">Historial</span>
                    <span>Mensual</span>
                </div>
            </div>
            {/* Espacio para Recharts */}
            <div className="h-60 bg-fin-dark-bg/50 rounded-xl border border-dashed border-gray-700 flex items-center justify-center text-gray-600 group-hover:border-gray-500 transition">
                [Espacio para Gráfico Violeta/Cian]
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
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente pequeño de tarjeta optimizado para el estilo oscuro
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
      {/* Resplandor de fondo sutil */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-radial ${style.bg} to-transparent opacity-50 blur-xl`}></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-fin-gray-text uppercase font-bold tracking-wider">{title}</p>
            <div className={`p-3 rounded-xl bg-fin-charcoal border border-gray-700 ${style.icon} group-hover:shadow-neon-${color}`}>{icon}</div>
        </div>
        <div>
            <h3 className={`text-4xl font-black ${style.value}`}>{value}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;