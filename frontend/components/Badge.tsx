'use client';

import React from 'react';

type BadgeVariant = 'critical' | 'high' | 'medium' | 'success' | 'purple' | 'cyan';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  return (
    <span className={`badge ${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
