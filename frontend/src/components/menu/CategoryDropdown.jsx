import { CheckIcon, ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import SvgPreview from "./SvgPreview";
import { useEffect, useState } from "react";

const CategoryDropdown = ({ categories, items, selectedId, onSelect }) => {
  const [open, setOpen] = useState(false);

  const getCount = (catId) =>
    catId === null
      ? items.length
      : items.filter((i) => String(i.category_id) === String(catId)).length;

  const selected = selectedId === null
    ? null
    : categories.find((c) => String(c.id) === String(selectedId));

  const handleSelect = (catId) => {
    onSelect(catId);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('[data-cat-dropdown]')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative w-full" data-cat-dropdown="">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-primary-400 dark:hover:border-primary-500 transition-colors text-sm"
      >
        {/* Icon */}
        <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
          {selected?.icon
            ? <SvgPreview svg={selected.icon} className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full" />
            : <FunnelIcon className="w-4 h-4" />
          }
        </span>
        {/* Label */}
        <span className="flex-1 text-left font-medium text-gray-800 dark:text-gray-200 capitalize truncate">
          {selected ? selected.name : 'All Categories'}
        </span>
        {/* Count badge */}
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
          {getCount(selectedId)}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {/* All Categories */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
              selectedId === null
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-400">
              <FunnelIcon className="w-4 h-4" />
            </span>
            <span className="flex-1">All Categories</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">{getCount(null)}</span>
            {selectedId === null && <CheckIcon className="w-4 h-4 flex-shrink-0 text-primary-600 dark:text-primary-400" />}
          </button>

          {/* Category rows */}
          {categories.map((cat) => {
            const active = String(cat.id) === String(selectedId);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <SvgPreview svg={cat.icon} className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full" />
                </span>
                <span className="flex-1 truncate capitalize">{cat.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">{getCount(cat.id)}</span>
                {active && <CheckIcon className="w-4 h-4 flex-shrink-0 text-primary-600 dark:text-primary-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;