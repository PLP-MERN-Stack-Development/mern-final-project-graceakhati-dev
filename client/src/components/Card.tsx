import { ReactNode, MouseEvent } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

function Card({ children, className = '', onClick }: CardProps) {
  const baseStyles =
    'bg-white rounded-lg border-2 border-green-100 shadow-sm transition-all duration-300';
  
  const hoverStyles = onClick
    ? 'hover:shadow-lg hover:border-green-300 hover:scale-[1.02] cursor-pointer active:scale-[0.98]'
    : 'hover:shadow-md';

  const combinedClassName = `${baseStyles} ${hoverStyles} ${className}`.trim();

  return (
    <div
      className={combinedClassName}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as unknown as MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      data-testid="card"
    >
      {children}
    </div>
  );
}

export default Card;
