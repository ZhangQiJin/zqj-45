import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function Empty({
  icon,
  title = '暂无数据',
  description,
  action,
  className,
}: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-earth-100 flex items-center justify-center mb-4">
          <div className="text-earth-400">{icon}</div>
        </div>
      )}
      <h3 className="text-lg font-medium text-earth-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-earth-500 text-center max-w-xs mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
