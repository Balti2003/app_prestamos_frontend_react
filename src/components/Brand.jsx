import { Zap } from 'lucide-react'; // Ícono de rayo

const Brand = ({ size = 'md' }) => {
  const isLarge = size === 'lg';
  return (
    <div className={`flex items-center gap-3 ${isLarge ? 'mb-8' : 'mb-6'}`}>
      <div className={`${isLarge ? 'p-3' : 'p-2'} rounded-xl bg-fin-charcoal border border-gray-800`}>
        <Zap className={`${isLarge ? 'h-9 w-9' : 'h-6 w-6'} text-fin-violet`} />
      </div>
      <h1 className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-black text-white tracking-tighter`}>
        PRESTA<span className="text-fin-cyan">YA</span>
      </h1>
    </div>
  );
};

export default Brand;