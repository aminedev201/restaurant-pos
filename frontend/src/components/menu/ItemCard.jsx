import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

const ItemCard = ({ item, cartQty, onAdd, onIncrease, onDecrease }) => {
  const inCart = cartQty > 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col">
      <div className="relative overflow-hidden h-32 sm:h-40">
        <img
          src={item.image_path_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x160?text=No+Image'; }}
        />
        {inCart && (
          <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            {cartQty}
          </div>
        )}
        {item.category && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full capitalize">
              {item.category.icon && (
                <span className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full opacity-90" dangerouslySetInnerHTML={{ __html: item.category.icon }} />
              )}
              {item.category.name}
            </span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 gap-1.5 sm:gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white capitalize leading-snug line-clamp-2">{item.title}</h3>
        <p className="text-sm sm:text-base font-bold text-primary-600 dark:text-primary-400 mt-auto">
          {Number(item.price).toLocaleString()} USD
        </p>
        {inCart ? (
          <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 rounded-lg px-1 py-1">
            <button onClick={() => onDecrease(item)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-primary-500 hover:bg-primary-600 text-white transition-colors">
              <MinusIcon className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300 min-w-[20px] text-center">{cartQty}</span>
            <button onClick={() => onIncrease(item)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-primary-500 hover:bg-primary-600 text-white transition-colors">
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={() => onAdd(item)} className="w-full py-1.5 sm:py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">
            <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemCard;