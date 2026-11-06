import React from 'react';

export const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`rounded-[22px] border border-borderWarm bg-white p-5 shadow-card ${className}`}>
      {title && <h3 className="mb-4 font-manrope text-lg font-extrabold tracking-tight text-textPrimary">{title}</h3>}
      {children}
    </div>
  );
};