import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import SvgPreview from "./SvgPreview";

const CategoryBar = ({ categories, items, selectedId, onSelect }) => {
  const getCount = (catId) =>
    catId === null
      ? items.length
      : items.filter((i) => String(i.category_id) === String(catId)).length;

  const all = [{ id: null, name: 'All', icon: null }, ...categories];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {all.map((cat) => {
        const active = selectedId === cat.id;
        return (
          <button
            key={cat.id ?? 'all'}
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border-2 transition-all duration-200 min-w-[76px] sm:min-w-[90px] ${
              active
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md shadow-primary-100 dark:shadow-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
            }`}
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors ${
                active
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {cat.icon ? (
                <SvgPreview svg={cat.icon} className="w-4 h-4 sm:w-5 sm:h-5 [&>svg]:w-full [&>svg]:h-full" />
              ) : (
                <AdjustmentsHorizontalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <span className={`text-xs font-semibold capitalize leading-tight text-center ${active ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {cat.name}
            </span>
            <span className={`text-xs font-medium ${active ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {getCount(cat.id)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryBar;

