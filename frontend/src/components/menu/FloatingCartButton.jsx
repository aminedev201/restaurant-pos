import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const FloatingCartButton = ({ count, total, onClick }) => {
  if (count === 0) return null;
  return (
    <button onClick={onClick} className="fixed bottom-6 right-6 z-20 lg:hidden flex items-center gap-3 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-primary-300 dark:shadow-primary-900/50 transition-all duration-200 active:scale-95">
      <div className="relative">
        <ShoppingCartIcon className="w-5 h-5" />
        <span className="absolute -top-2 -right-2 bg-white text-primary-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">{count}</span>
      </div>
      <span className="text-sm font-bold">{total.toLocaleString()} USD</span>
    </button>
  );
};

export default FloatingCartButton;