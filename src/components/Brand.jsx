import { Zap } from 'lucide-react'; // Ícono de rayo

const Brand = ({ size = 'md', onClick }) => {
  const isLarge = size === 'lg';
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 text-left focus:outline-none ${isLarge ? 'mb-8' : 'mb-6'} ${
        onClick ? 'group active:scale-95 transition-transform' : 'cursor-default'
      }`}
      disabled={!onClick}
    >
      <div className={`${isLarge ? 'p-3' : 'p-2'} rounded-xl bg-fin-charcoal border border-gray-800 transition-all ${
        onClick ? 'group-hover:border-fin-violet/40 group-hover:bg-fin-violet/5 group-hover:shadow-lg group-hover:shadow-neon-violet/5' : ''
      }`}>
        <Zap className={`${isLarge ? 'h-9 w-9' : 'h-6 w-6'} text-fin-violet transition-transform ${onClick ? 'group-hover:scale-105' : ''}`} />
      </div>
      <h1 className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-black text-white tracking-tighter transition-colors ${
        onClick ? 'group-hover:text-gray-200' : ''
      }`}>
        PRESTA<span className="text-fin-cyan">YA</span>
      </h1>
    </button>
  );
};

export default Brand;