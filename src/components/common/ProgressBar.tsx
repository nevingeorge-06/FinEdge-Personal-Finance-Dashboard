import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  warningThreshold?: number; // e.g. 80%
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color,
  showLabels = false,
  size = 'md',
  className = '',
  warningThreshold = 80,
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const isOver = value > max;

  // Cream & Mocha status colours
  let barColor = '#287A55'; // indicator-income green (healthy)
  if (isOver) {
    barColor = '#B94C48'; // indicator-expense red
  } else if (percentage >= warningThreshold) {
    barColor = '#B77925'; // indicator-warning amber
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-mocha-400 font-medium">
            {percentage.toFixed(0)}% used
          </span>
          {isOver && (
            <span className="text-indicator-expense font-medium">
              Over by {(percentage - 100).toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-cream-300 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: color && !isOver && percentage < warningThreshold ? color : barColor,
          }}
        />
      </div>
    </div>
  );
};
