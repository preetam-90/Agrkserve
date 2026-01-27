/**
 * EmptyStateIllustration Component
 * SVG illustration for empty states with empty field theme
 * Positive and encouraging for farmers
 */

export interface EmptyStateIllustrationProps {
  className?: string;
}

export function EmptyStateIllustration({ className }: EmptyStateIllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Empty state illustration showing an empty field"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill="#FFFBEB" />
      
      {/* Sun */}
      <circle cx="150" cy="50" r="15" fill="#FCD34D" />
      <g stroke="#FCD34D" strokeWidth="2" strokeLinecap="round">
        <line x1="150" y1="30" x2="150" y2="25" />
        <line x1="150" y1="75" x2="150" y2="70" />
        <line x1="130" y1="50" x2="125" y2="50" />
        <line x1="175" y1="50" x2="170" y2="50" />
        <line x1="135" y1="35" x2="131" y2="31" />
        <line x1="169" y1="69" x2="165" y2="65" />
        <line x1="135" y1="65" x2="131" y2="69" />
        <line x1="169" y1="31" x2="165" y2="35" />
      </g>
      
      {/* Field/Ground */}
      <ellipse cx="100" cy="140" rx="70" ry="15" fill="#84CC16" opacity="0.3" />
      <ellipse cx="100" cy="145" rx="60" ry="12" fill="#65A30D" opacity="0.2" />
      
      {/* Empty box/crate */}
      <rect x="70" y="100" width="60" height="40" rx="2" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <line x1="70" y1="110" x2="130" y2="110" stroke="#F59E0B" strokeWidth="1" opacity="0.5" />
      <line x1="70" y1="120" x2="130" y2="120" stroke="#F59E0B" strokeWidth="1" opacity="0.5" />
      <line x1="70" y1="130" x2="130" y2="130" stroke="#F59E0B" strokeWidth="1" opacity="0.5" />
      
      {/* Small plants/sprouts (hope) */}
      <g transform="translate(40, 130)">
        <path d="M 0 0 Q -3 -8 -5 -12 Q -3 -8 0 -10" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 0 0 Q 3 -8 5 -12 Q 3 -8 0 -10" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      
      <g transform="translate(160, 135)">
        <path d="M 0 0 Q -2 -6 -3 -10 Q -2 -6 0 -8" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 0 0 Q 2 -6 3 -10 Q 2 -6 0 -8" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
