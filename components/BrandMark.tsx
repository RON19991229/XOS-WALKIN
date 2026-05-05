import Image from 'next/image';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandMark({ size = 'md' }: BrandMarkProps) {
  const sizes = {
    sm: { w: 36, h: 36 },
    md: { w: 48, h: 48 },
    lg: { w: 96, h: 96 },
  };
  const { w, h } = sizes[size];

  return (
    <div className="inline-flex items-center">
      <Image
        src="/logo.png"
        alt="X FITNESS"
        width={w}
        height={h}
        priority
        className="object-contain"
      />
    </div>
  );
}
