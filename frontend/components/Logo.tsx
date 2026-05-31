'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
}

const sizes = {
  sm: { icon: 28, textClass: 'text-base', tagClass: 'text-[9px]' },
  md: { icon: 36, textClass: 'text-xl', tagClass: 'text-[10px]' },
  lg: { icon: 44, textClass: 'text-2xl', tagClass: 'text-xs' },
};

export function Logo({ size = 'md', showText = true, showTagline = false }: LogoProps) {
  const { icon: iconSize, textClass, tagClass } = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <LogoIcon size={iconSize} />
      {showText && (
        <div>
          <span className={`font-bold gradient-text ${textClass}`}>ElevateCRM</span>
          {showTagline && (
            <p className={`text-muted-foreground ${tagClass}`}>India&apos;s Smart Sales CRM</p>
          )}
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <rect width="32" height="32" rx="7" fill="url(#elevate-grad)" />
      {/* Bar chart — three ascending bars */}
      <rect x="5" y="20" width="4" height="7" rx="1" fill="white" fillOpacity="0.45" />
      <rect x="11" y="15" width="4" height="12" rx="1" fill="white" fillOpacity="0.7" />
      <rect x="17" y="10" width="4" height="17" rx="1" fill="white" fillOpacity="0.95" />
      {/* Upward arrow — saffron accent (Indian flag colour) */}
      <path d="M25 15V8" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22.5 10.5L25 8L27.5 10.5" stroke="#FF9933" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="elevate-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
