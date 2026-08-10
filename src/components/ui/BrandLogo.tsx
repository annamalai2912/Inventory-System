interface BrandLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function BrandLogo({ size = 38, className = '', showText = true }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG TechKnots Emblem: Interlocking circuit knot & microchip geometry */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer glowing rounded squircle */}
        <rect width="44" height="44" rx="12" fill="url(#logo_grad)" />

        {/* Knot circuit trace paths */}
        <path
          d="M14 14C14 11.7909 15.7909 10 18 10H26C28.2091 10 30 11.7909 30 14V20C30 22.2091 28.2091 24 26 24H18C15.7909 24 14 22.2091 14 20V14Z"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <path
          d="M14 24C14 21.7909 15.7909 20 18 20H26C28.2091 20 30 21.7909 30 24V30C30 32.2091 28.2091 34 26 34H18C15.7909 34 14 32.2091 14 30V24Z"
          stroke="#a7f3d0"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Microchip nodes */}
        <circle cx="18" cy="14" r="2.5" fill="#ffffff" />
        <circle cx="26" cy="14" r="2.5" fill="#34d399" />
        <circle cx="18" cy="30" r="2.5" fill="#34d399" />
        <circle cx="26" cy="30" r="2.5" fill="#ffffff" />

        {/* Connecting trace dots */}
        <line x1="22" y1="10" x2="22" y2="34" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 2" opacity="0.6" />

        <defs>
          <linearGradient id="logo_grad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#059669" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div>
          <div className="sidebar-logo-text">TechKnots</div>
          <div className="sidebar-logo-sub">Hardware Stock</div>
        </div>
      )}
    </div>
  );
}
