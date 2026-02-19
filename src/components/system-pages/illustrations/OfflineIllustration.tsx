/**
 * OfflineIllustration Component
 * SVG illustration for offline pages with disconnected signal theme
 * Simple and clear for farmers to understand
 */

export interface OfflineIllustrationProps {
  className?: string;
}

export function OfflineIllustration({ className }: OfflineIllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Offline illustration showing disconnected signal"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill="#F1F5F9" />

      {/* Mobile phone */}
      <rect x="70" y="50" width="60" height="100" rx="8" fill="#1E293B" />
      <rect x="75" y="60" width="50" height="75" rx="2" fill="#334155" />

      {/* Phone screen with X */}
      <line
        x1="85"
        y1="80"
        x2="115"
        y2="120"
        stroke="#EF4444"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="115"
        y1="80"
        x2="85"
        y2="120"
        stroke="#EF4444"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Signal waves (disconnected) */}
      <g opacity="0.3">
        <path
          d="M 100 30 Q 85 40 85 50"
          stroke="#64748B"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 100 30 Q 115 40 115 50"
          stroke="#64748B"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 100 25 Q 75 40 75 60"
          stroke="#64748B"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 100 25 Q 125 40 125 60"
          stroke="#64748B"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Slash through signal */}
      <line
        x1="65"
        y1="20"
        x2="135"
        y2="70"
        stroke="#EF4444"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Cloud (offline) */}
      <g transform="translate(130, 110)">
        <ellipse cx="0" cy="0" rx="15" ry="10" fill="#94A3B8" />
        <ellipse cx="-10" cy="2" rx="12" ry="8" fill="#94A3B8" />
        <ellipse cx="10" cy="2" rx="12" ry="8" fill="#94A3B8" />
        <line
          x1="-5"
          y1="5"
          x2="5"
          y2="15"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
