/**
 * ErrorIllustration Component
 * SVG illustration for error pages with tractor and tools theme
 * Culturally appropriate for Indian farmers
 */

export interface ErrorIllustrationProps {
  className?: string;
}

export function ErrorIllustration({ className }: ErrorIllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Error illustration showing a tractor with tools"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill="#F0FDF4" />
      
      {/* Tractor body */}
      <rect x="70" y="80" width="60" height="40" rx="4" fill="#16A34A" />
      
      {/* Tractor cabin */}
      <rect x="90" y="60" width="30" height="20" rx="2" fill="#15803D" />
      <rect x="95" y="65" width="20" height="10" fill="#DBEAFE" opacity="0.6" />
      
      {/* Large rear wheel */}
      <circle cx="110" cy="125" r="18" fill="#374151" />
      <circle cx="110" cy="125" r="12" fill="#6B7280" />
      <circle cx="110" cy="125" r="6" fill="#9CA3AF" />
      
      {/* Small front wheel */}
      <circle cx="80" cy="125" r="12" fill="#374151" />
      <circle cx="80" cy="125" r="8" fill="#6B7280" />
      <circle cx="80" cy="125" r="4" fill="#9CA3AF" />
      
      {/* Wrench tool */}
      <g transform="translate(130, 70) rotate(45)">
        <rect x="0" y="0" width="4" height="25" rx="2" fill="#EF4444" />
        <circle cx="2" cy="0" r="4" fill="#DC2626" />
      </g>
      
      {/* Exclamation mark */}
      <circle cx="50" cy="70" r="20" fill="#FEF3C7" />
      <rect x="48" y="60" width="4" height="12" rx="2" fill="#F59E0B" />
      <circle cx="50" cy="78" r="2" fill="#F59E0B" />
    </svg>
  );
}
