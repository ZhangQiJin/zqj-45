import { cn } from '@/lib/utils';

interface CategoryTagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  color?: 'default' | 'sage' | 'terracotta' | 'earth';
}

const colorClasses = {
  default: 'bg-earth-100 text-earth-700 hover:bg-earth-200',
  sage: 'bg-sage-100 text-sage-700 hover:bg-sage-200',
  terracotta: 'bg-terracotta-100 text-terracotta-700 hover:bg-terracotta-200',
  earth: 'bg-earth-200 text-earth-800',
};

const activeColorClasses = {
  default: 'bg-earth-700 text-white',
  sage: 'bg-sage-500 text-white',
  terracotta: 'bg-terracotta-500 text-white',
  earth: 'bg-earth-700 text-white',
};

export default function CategoryTag({
  label,
  active = false,
  onClick,
  color = 'default',
}: CategoryTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'tag transition-all duration-200 cursor-pointer',
        active ? activeColorClasses[color] : colorClasses[color],
        onClick && 'active:scale-95'
      )}
    >
      {label}
    </button>
  );
}
