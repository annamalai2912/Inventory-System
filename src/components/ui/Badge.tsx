type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'sky' | 'gray' | 'ivory';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  category?: string;
  className?: string;
}

const CATEGORY_CLASS_MAP: Record<string, string> = {
  microcontroller: 'badge-cat-microcontroller',
  sensor:          'badge-cat-sensor',
  passive:         'badge-cat-passive',
  module:          'badge-cat-module',
  connector:       'badge-cat-connector',
  tool:            'badge-cat-tool',
  power:           'badge-cat-power',
  display:         'badge-cat-display',
  communication:   'badge-cat-sensor',
  actuator:        'badge-cat-module',
  cable:           'badge-cat-connector',
  other:           'badge-cat-other',
};

export function Badge({ children, variant, category, className = '' }: BadgeProps) {
  const cls = category
    ? `badge ${CATEGORY_CLASS_MAP[category] ?? 'badge-cat-other'} ${className}`
    : `badge badge-${variant ?? 'gray'} ${className}`;

  return <span className={cls}>{children}</span>;
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge category={category}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}
