'use client';

import React, { useEffect, useState } from 'react';

interface KPICardProps {
  label: string;
  value: number | string;
  unit?: string;
  subtext?: string;
  color?: 'accent' | 'danger' | 'warn' | 'success' | 'purple' | 'cyan';
  animateValue?: boolean;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit = '',
  subtext = '',
  color = 'accent',
  animateValue = false,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!animateValue || typeof value !== 'number') return;

    let currentValue = typeof displayValue === 'number' ? displayValue : 0;
    const targetValue = value;
    const increment = (targetValue - currentValue) / 20;
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      currentValue += increment;
      if (frame >= 20) {
        setDisplayValue(targetValue);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(currentValue));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [value, animateValue]);

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toFixed(2);
  };

  return (
    <div className={`kpi-card ${color} ${className}`}>
      <div className="flex flex-col">
        <span className="text-text-tertiary text-xs font-mono uppercase tracking-wider mb-2">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono text-text-primary">
            {formatValue(displayValue as number)}
          </span>
          {unit && (
            <span className="text-sm text-text-secondary font-mono">
              {unit}
            </span>
          )}
        </div>
        {subtext && (
          <span className="text-xs text-text-secondary font-mono mt-2">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default KPICard;
