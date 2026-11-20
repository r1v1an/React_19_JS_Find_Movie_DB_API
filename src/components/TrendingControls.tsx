import type { TrendingPeriod } from "../types";

interface TrendingControlsProps {
  period: TrendingPeriod;
  onPeriodChange: (value: TrendingPeriod) => void;
}

const PERIOD_BUTTONS: { key: TrendingPeriod; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "daily", label: "Last 24h" },
];

const TrendingControls = ({ period, onPeriodChange }: TrendingControlsProps) => {
  return (
    <div className="flex gap-2">
      {PERIOD_BUTTONS.map(({ key, label }) => (
        <button type="button"
          key={key}
          onClick={() => onPeriodChange(key)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 cursor-pointer
            ${period === key
              ? "bg-light-100/15 text-light-100 border-light-100/30 shadow-sm"
              : "bg-transparent text-gray-100/60 border-white/10 hover:border-white/20 hover:text-gray-100"
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TrendingControls;