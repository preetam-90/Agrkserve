/**
 * SuccessIllustration Component
 * SVG illustration for success pages with checkmark and crops theme
 * Positive and celebratory for farmers
 */

export interface SuccessIllustrationProps {
  className?: string;
}

export function SuccessIllustration({ className }: SuccessIllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Success illustration showing a checkmark with crops"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill="#ECFDF5" />
      
      {/* Large checkmark circle */}
      <circle cx="100" cy="90" r="45" fill="#10B981" />
      
      {/* Checkmark */}
      <path
        d="M 75 90 L 92 107 L 125 74"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Wheat/crop stalks */}
      <g transform="translate(50, 140)">
        {/* Left stalk */}
        <line x1="0" y1="0" x2="0" y2="-25" stroke="#84CC16" strokeWidth="2" />
        <ellipse cx="-2" cy="-28" rx="3" ry="5" fill="#A3E635" />
        <ellipse cx="2" cy="-28" rx="3" ry="5" fill="#A3E635" />
        <ellipse cx="-2" cy="-22" rx="3" ry="5" fill="#A3E635" />
        <ellipse cx="2" cy="-22" rx="3" ry="5" fill="#A3E635" />
      </g>
      
      <g transform="translate(150, 140)">
        {/* Right stalk */}
        <line x1="0" y1="0" x2="0" y2="-25" stroke="#84CC16" strokeWidth="2" />
        <ellipse cx="-2" cy="-28" rx="3" ry="5" fill="#A3E635" />
        <ellipse cx="2" cy="-28" rx="3" ry="5" fill="#A3E635" />
        <ellipse cx="-2" cy="-22" rx="3" ry="5" fill="#A3E635" />
        <ellipse cx="2" cy="-22" rx="3" ry="5" fill="#A3E635" />
      </g>
      
      {/* Ground */}
      <ellipse cx="100" cy="145" rx="70" ry="10" fill="#22C55E" opacity="0.2" />
      
      {/* Sparkles/celebration */}
      <g fill="#FCD34D">
        <circle cx="60" cy="60" r="3" />
        <circle cx="140" cy="70" r="2" />
        <circle cx="70" cy="120" r="2" />
        <circle cx="130" cy="115" r="3" />
      </g>
      
      {/* Star sparkles */}
      <g stroke="#FCD34D" strokeWidth="2" strokeLinecap="round">
        <line x1="155" y1="55" x2="155" y2="65" />
        <line x1="150" y1="60" x2="160" y2="60" />
        <line x1="45" y1="100" x2="45" y2="108" />
        <line x1="41" y1="104" x2="49" y2="104" />
      </g>
    </svg>
  );
}
