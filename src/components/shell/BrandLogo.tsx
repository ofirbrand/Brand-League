import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  showText?: boolean;
};

export function BrandLogo({ className, showText = false }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BrandMark className="h-9 w-9" />
      {showText && (
        <span className="text-lg font-extrabold tracking-tight">
          Brand <span className="text-gold">Sport</span> League
        </span>
      )}
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Brand Sport League"
    >
      <defs>
        <linearGradient id="bsl-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="55%" stopColor="#E0B400" />
          <stop offset="100%" stopColor="#8a6a00" />
        </linearGradient>
        <linearGradient id="bsl-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16263d" />
          <stop offset="100%" stopColor="#0A1628" />
        </linearGradient>
      </defs>

      {/* Shield outline */}
      <path
        d="M32 2 L60 12 L60 30 C60 46 48 58 32 62 C16 58 4 46 4 30 L4 12 Z"
        fill="url(#bsl-bg)"
        stroke="url(#bsl-shield)"
        strokeWidth="2.5"
      />

      {/* BSL monogram, stacked + stylized like a sports logo */}
      <text
        x="32"
        y="34"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="20"
        fontWeight="900"
        fill="url(#bsl-shield)"
        textAnchor="middle"
        letterSpacing="1"
      >
        BSL
      </text>

      {/* Lightning slash for sport-vibe */}
      <path
        d="M22 44 L34 38 L30 46 L42 40"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
