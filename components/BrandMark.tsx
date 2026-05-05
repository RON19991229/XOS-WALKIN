interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  invert?: boolean;
}

export default function BrandMark({ size = 'md', invert = false }: BrandMarkProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-6xl md:text-7xl',
  };

  return (
    <div className={`font-display ${sizes[size]} tracking-tighter leading-none flex items-baseline gap-1`}>
      <span className={invert ? 'text-bone' : 'text-ink'}>X</span>
      <span className={invert ? 'text-accent' : 'text-ink'}>FITNESS</span>
    </div>
  );
}
