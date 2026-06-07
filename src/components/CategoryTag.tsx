import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CategoryTagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  color?: 'default' | 'sage' | 'terracotta' | 'earth' | 'amber';
  icon?: ReactNode;
}

const colorClasses = {
  default: 'bg-earth-100 text-earth-700 hover:bg-earth-200',
  sage: 'bg-sage-100 text-sage-700 hover:bg-sage-200',
  terracotta: 'bg-terracotta-100 text-terracotta-700 hover:bg-terracotta-200',
  earth: 'bg-earth-200 text-earth-800',
  amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
};

const activeColorClasses = {
  default: 'bg-earth-700 text-white',
  sage: 'bg-sage-500 text-white',
  terracotta: 'bg-terracotta-500 text-white',
  earth: 'bg-earth-700 text-white',
  amber: 'bg-amber-500 text-white',
};

export default function CategoryTag({
  label,
  active = false,
  onClick,
  color = 'default',
  icon,
}: CategoryTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'tag transition-all duration-200 cursor-pointer flex items-center gap-1.5',
        active ? activeColorClasses[color] : colorClasses[color],
        onClick && 'active:scale-95'
      )}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}
