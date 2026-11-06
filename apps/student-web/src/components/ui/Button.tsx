import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primaryDark',
    secondary: 'bg-palePeach text-textPrimary hover:bg-palePeachHover',
    danger: 'bg-error text-white hover:opacity-90',
    ghost: 'bg-transparent text-textSecondary hover:bg-palePeach',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
};