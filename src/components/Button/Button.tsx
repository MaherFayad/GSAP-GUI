import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Style.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

/**
 * Reusable Button component
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) => {
  const variantClass = variant === 'secondary' ? 'button-secondary' : 'button-primary';
  
  return (
    <button 
      className={`${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

