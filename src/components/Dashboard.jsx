import { useEffect, useState } from 'react';
import api from '../api';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  Calendar 
} from 'lucide-react';

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
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center text-red-500 bg-red-50 rounded-lg m-8">
      <AlertCircle className="mx-auto mb-2" />
      <p>{error}</p>
    </div>
  );

  const { metricas_financieras, estado_cartera, operativo_hoy } = data;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
        <p className="text-gray-500 text-sm">Resumen general del estado de tus préstamos y caja.</p>
      </div>

      {/* Grid de Tarjetas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Caja Disponible */}
        <StatCard 
          title="Saldo en Caja" 
          value={`$${metricas_financieras.saldo_caja_disponible.toLocaleString()}`}
          icon={<DollarSign className="text-blue-600" />}
          color="blue"
        />

        {/* Rentabilidad */}
        <StatCard 
          title="Ganancia Real" 
          value={`$${metricas_financieras.rentabilidad_acumulada.toLocaleString()}`}
          icon={<TrendingUp className="text-green-600" />}
          color="green"
          subtitle="Intereses + Mora cobrados"
        />

        {/* Capital en Calle */}
        <StatCard 
          title="Capital en Calle" 
          value={`$${metricas_financieras.capital_en_calle.toLocaleString()}`}
          icon={<ArrowUpRight className="text-purple-600" />}
          color="purple"
        />

        {/* Tasa de Mora */}
        <StatCard 
          title="Tasa de Mora" 
          value={`${estado_cartera.tasa_mora_porcentaje}%`}
          icon={<AlertCircle className="text-red-600" />}
          color="red"
          subtitle={`${estado_cartera.prestamos_en_mora} préstamos activos`}
        />
      </div>

      {/* Sección Secundaria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-gray-400" />
            Operativo del Día
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Cobros esperados hoy:</span>
              <span className="font-bold text-gray-800">${operativo_hoy.cobros_pendientes_hoy.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Clientes activos:</span>
              <span className="font-bold text-gray-800">{operativo_hoy.clientes_total}</span>
            </div>
          </div>
        </div>
        
        {/* Aquí podrías agregar un gráfico de Recharts más adelante */}
        <div className="bg-blue-600 p-6 rounded-xl shadow-sm text-white flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-2">Próxima Mejora</h3>
            <p className="text-blue-100 opacity-80">Estamos trabajando en integrar gráficos de crecimiento mensual para tu rentabilidad.</p>
        </div>
      </div>
    </div>
  );
};

// Componente pequeño para las tarjetas para no repetir código
const StatCard = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    purple: "border-purple-500 bg-purple-50",
    red: "border-red-500 bg-red-50",
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${colorClasses[color]} transition-transform hover:scale-105`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{title}</p>
        <div className={`p-2 rounded-lg bg-white shadow-sm`}>{icon}</div>
      </div>
      <h3 className="text-2xl font-black text-gray-800">{value}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default Dashboard;