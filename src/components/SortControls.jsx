import { SORT_OPTIONS } from "../services/tmdb-api"

const SORT_BUTTONS = [
  { key: SORT_OPTIONS.POPULAR, label: "Popular" },
  { key: SORT_OPTIONS.TOP_RATED, label: "Top Rated" },
  { key: SORT_OPTIONS.NEWEST, label: "Newest" },
];

const SortControls = ({ sortBy, onSortChange, disabled }) => {
  return (
    <div className="flex gap-2">
      {SORT_BUTTONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSortChange(key)}
          disabled={disabled}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 cursor-pointer
            ${sortBy === key
              ? "bg-light-100/15 text-light-100 border-light-100/30 shadow-sm"
              : "bg-transparent text-gray-100/60 border-white/10 hover:border-white/20 hover:text-gray-100"
            }
            ${disabled ? "opacity-40 pointer-events-none" : ""}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default SortControls;