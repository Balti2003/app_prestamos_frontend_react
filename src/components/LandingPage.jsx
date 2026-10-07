import { useState } from 'react';
import Brand from './Brand';
import { 
  Zap, FileText, Users, DollarSign, 
  TrendingUp, CheckCircle2, ArrowRight, 
  Receipt, Lock, ChevronRight
} from 'lucide-react';

export default function LandingPage({ onGoToLogin, onSelectPlan }) {
  const [faqAbierta, setFaqAbierta] = useState(null);

  const toggleFaq = (index) => {
    setFaqAbierta(faqAbierta === index ? null : index);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const planes = [
    {
      id: 'plan_basico',
      nombre: 'Independiente',
      descripcion: 'Ideal para prestamistas individuales que buscan ordenar su cartera.',
      precio: '$15.000',
      periodo: '/mes',
      destacado: false,
      caracteristicas: [
        'Hasta 150 clientes activos',
        'Cálculo automático de cuotas y mora',
        'Arqueo de caja diaria en tiempo real',
        'Comprobantes PDF oficiales con tu nombre',
        '1 usuario administrador',
        'Soporte por WhatsApp'
      ],
      cta: 'Comenzar Ahora'
    },
    {
      id: 'plan_pro',
      nombre: 'Financiera Pro',
      descripcion: 'Para financieras y equipos de cobranza con múltiples operadores.',
      precio: '$29.000',
      periodo: '/mes',
      destacado: true,
      badge: 'MÁS ELEGIDO',
      caracteristicas: [
        'Clientes y préstamos ILIMITADOS',
        'Gestión de equipo y operadores ilimitados',
        'Permisos avanzados por operador',
        'Métricas financieras y analítica avanzada',
        'Recibos y desembolsos membretados',
        'Aislamiento bancario de datos 100% privado',
        'Soporte prioritario 24/7'
      ],
      cta: 'Adquirir Plan Pro'
    }
  ];

  const faqs = [
    {
      pregunta: '¿Mis datos o clientes son visibles para otros usuarios?',
      respuesta: 'No, bajo ninguna circunstancia. Nuestra arquitectura multi-tenant aísla de forma estricta los registros de cada empresa a nivel de base de datos. Ningún otro usuario u operador fuera de tu cuenta tiene acceso a tu cartera o saldos.'
    },
    {
      pregunta: '¿Puedo crear operadores para que cobren en la calle?',
      respuesta: 'Sí. Puedes crear cuentas de operadores con permisos controlados. Ellos podrán cobrar cuotas o registrar pagos sin tener acceso a métricas globales ni a modificar parámetros reservados para el administrador.'
    },
    {
      pregunta: '¿Cómo se generan los recibos y comprobantes de desembolso?',
      respuesta: 'Con un solo clic. El sistema genera documentos PDF descargables con membrete oficial, nombre de tu negocio, identificación fiscal (CUIT/RUT) y campos de conformidad de firma.'
    },
    {
      pregunta: '¿Qué formas de pago aceptan para la suscripción?',
      respuesta: 'Aceptamos todas las tarjetas de crédito, débito y dinero en cuenta a través de Mercado Pago, con renovación automática mensual y posibilidad de cancelar cuando desees.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#07080a] text-white flex flex-col font-sans selection:bg-fin-violet selection:text-white">
      
      {/* NAVBAR */}
      <header className="border-b border-gray-800/80 bg-fin-charcoal/40 sticky top-0 z-50 backdrop-blur-md px-6 lg:px-16 py-4 flex items-center justify-between">
        <Brand size="md" onClick={scrollToTop} />

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
          <a href="#funciones" className="hover:text-white transition-colors">Funcionalidades</a>
          <a href="#precios" className="hover:text-white transition-colors">Precios</a>
          <a href="#faq" className="hover:text-white transition-colors">Preguntas</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={onGoToLogin}
            className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors uppercase tracking-wider"
          >
            Iniciar Sesión
          </button>
          <a 
            href="#precios"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fin-violet to-fin-cyan text-white text-xs font-black uppercase tracking-wider shadow-neon-cyan hover:opacity-95 transition-all"
          >
            Empezar
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 lg:px-16 pt-20 pb-28 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-fin-violet/20 to-fin-cyan/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fin-charcoal border border-gray-800 text-xs font-semibold text-fin-cyan mb-8">
          <Zap size={14} /> La plataforma definitiva para préstamos y cobranzas
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl text-white leading-tight">
          Controlá tu cartera, cobros y caja <br />
          <span className="bg-gradient-to-r from-fin-cyan via-white to-fin-violet bg-clip-text text-transparent">
            en un solo lugar
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
          Diseñado para financieras y prestamistas independientes. Gestión automatizada de cuotas, alertas de mora, arqueo de caja diario y recibos oficiales en segundos.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <a 
            href="#precios"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-fin-violet to-fin-cyan text-white font-black text-sm uppercase tracking-wider shadow-neon-cyan hover:scale-[1.02] active:scale-95 transition-all"
          >
            Suscribir mi Negocio <ArrowRight size={18} />
          </a>
          <button 
            onClick={onGoToLogin}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-fin-charcoal border border-gray-800 text-gray-300 hover:text-white font-bold text-sm transition-all hover:border-gray-700"
          >
            Acceder a mi Cuenta
          </button>
        </div>
      </section>

      {/* CARACTERÍSTICAS / MÓDULOS */}
      <section id="funciones" className="px-6 lg:px-16 py-20 bg-fin-charcoal/20 border-t border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white italic">
              Todo lo que necesitas para operar sin desorden
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Elimina los cuadernos, planillas de Excel complejas y la pérdida de cobros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-fin-charcoal p-7 rounded-3xl border border-gray-800 hover:border-fin-cyan/40 transition-all">
              <div className="p-3 bg-fin-cyan/10 text-fin-cyan rounded-2xl w-fit mb-5 border border-fin-cyan/20">
                <Receipt size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cobranzas y Cuotas</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Calcula automáticamente el plan de pagos pactado, vencimientos y recargos por mora en tiempo real.
              </p>
            </div>

            <div className="bg-fin-charcoal p-7 rounded-3xl border border-gray-800 hover:border-fin-violet/40 transition-all">
              <div className="p-3 bg-fin-violet/10 text-fin-violet rounded-2xl w-fit mb-5 border border-fin-violet/20">
                <DollarSign size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Caja Diaria y Arqueos</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Apertura y cierre de caja con control exacto de efectivo. Ningún desembolso o cobro queda sin registrar.
              </p>
            </div>

            <div className="bg-fin-charcoal p-7 rounded-3xl border border-gray-800 hover:border-fin-cyan/40 transition-all">
              <div className="p-3 bg-fin-cyan/10 text-fin-cyan rounded-2xl w-fit mb-5 border border-fin-cyan/20">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Comprobantes PDF Oficiales</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Genera al instante contratos de desembolso y recibos de pago membretados con los datos y CUIT de tu negocio.
              </p>
            </div>

            <div className="bg-fin-charcoal p-7 rounded-3xl border border-gray-800 hover:border-fin-violet/40 transition-all">
              <div className="p-3 bg-fin-violet/10 text-fin-violet rounded-2xl w-fit mb-5 border border-fin-violet/20">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Operadores y Roles</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Crea cuentas para tus cobradores con permisos específicos: registra cobros en calle sin exponer métricas globales.
              </p>
            </div>

            <div className="bg-fin-charcoal p-7 rounded-3xl border border-gray-800 hover:border-fin-cyan/40 transition-all">
              <div className="p-3 bg-fin-cyan/10 text-fin-cyan rounded-2xl w-fit mb-5 border border-fin-cyan/20">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Métricas Financieras</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Monitorea el capital colocado, rentabilidad cobrada, saldo líquido y tasa de mora con un gráfico interactivo.
              </p>
            </div>

            <div id="seguridad" className="bg-fin-charcoal p-7 rounded-3xl border border-gray-800 hover:border-fin-violet/40 transition-all">
              <div className="p-3 bg-fin-violet/10 text-fin-violet rounded-2xl w-fit mb-5 border border-fin-violet/20">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Seguridad Multi-Tenant</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Tus datos viven en un espacio blindado e independiente. Tu cartera es 100% privada e inaccesible para terceros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES Y PRECIOS */}
      <section id="precios" className="px-6 lg:px-16 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-fin-cyan">Planes Flexibles</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white italic mt-2">
              Comenzá a potenciar tu negocio hoy
            </h2>
            <p className="text-gray-400 text-sm mt-3">
              Sin contratos de permanencia. Cancela o cambia de plan en cualquier momento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {planes.map((plan) => (
              <div 
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  plan.destacado 
                    ? 'bg-gradient-to-b from-fin-charcoal to-[#10121a] border-2 border-fin-violet shadow-2xl shadow-fin-violet/10' 
                    : 'bg-fin-charcoal border border-gray-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-black text-white">{plan.nombre}</h3>
                    {plan.destacado && (
                      <span className="px-3 py-1 rounded-full bg-fin-violet text-[10px] font-black tracking-widest text-white shadow-neon-violet">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 min-h-[32px]">{plan.descripcion}</p>

                  <div className="my-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">{plan.precio}</span>
                    <span className="text-gray-500 text-sm font-bold">{plan.periodo}</span>
                  </div>

                  <div className="space-y-3 border-t border-gray-800/80 pt-6">
                    {plan.caracteristicas.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                        <CheckCircle2 size={16} className={plan.destacado ? "text-fin-cyan" : "text-gray-500"} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`mt-8 w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    plan.destacado
                      ? 'bg-gradient-to-r from-fin-violet to-fin-cyan text-white shadow-neon-cyan hover:opacity-95'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  {plan.cta} <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section id="faq" className="px-6 lg:px-16 py-20 bg-fin-charcoal/20 border-t border-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white italic">Preguntas Frecuentes</h2>
            <p className="text-gray-400 text-sm mt-2">Todo lo que necesitas saber antes de contratar.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-fin-charcoal border border-gray-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-fin-cyan transition-colors"
                >
                  <span>{faq.pregunta}</span>
                  <ChevronRight 
                    size={18} 
                    className={`transition-transform text-gray-500 ${faqAbierta === index ? 'rotate-90 text-fin-cyan' : ''}`} 
                  />
                </button>
                {faqAbierta === index && (
                  <div className="px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-gray-800/60 pt-3">
                    {faq.respuesta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/80 px-6 lg:px-16 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 bg-fin-charcoal/40">
        <p>© {new Date().getFullYear()} PrestaYa Platform. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <a href="#funciones" className="hover:text-gray-400">Funcionalidades</a>
          <a href="#precios" className="hover:text-gray-400">Planes</a>
          <button onClick={onGoToLogin} className="hover:text-gray-400">Acceso Clientes</button>
        </div>
      </footer>

    </div>
  );
}