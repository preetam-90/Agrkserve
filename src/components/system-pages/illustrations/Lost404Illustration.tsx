'use client';

import { useEffect, useState } from 'react';

/**
 * Lost404Illustration Component
 * Custom agricultural-themed 404 illustration showing a tractor lost in a field
 */

export interface Lost404IllustrationProps {
  className?: string;
}

export function Lost404Illustration({ className }: Lost404IllustrationProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        role="img"
        aria-label="Illustration of a tractor lost in a vast field"
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#BFDBFE" />
          </linearGradient>
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
          <linearGradient id="tractorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="400" height="180" fill="url(#skyGradient)" />

        {/* Sun */}
        <circle
          cx="340"
          cy="50"
          r="25"
          fill="#FCD34D"
          className={isHovered ? 'animate-pulse' : ''}
        />
        <circle cx="340" cy="50" r="30" fill="#FCD34D" opacity="0.3" />

        {/* Clouds */}
        <g opacity="0.7">
          <ellipse cx="80" cy="40" rx="30" ry="15" fill="white" />
          <ellipse cx="100" cy="40" rx="25" ry="12" fill="white" />
          <ellipse cx="90" cy="35" rx="20" ry="10" fill="white" />
        </g>

        <g opacity="0.6">
          <ellipse cx="250" cy="60" rx="35" ry="18" fill="white" />
          <ellipse cx="275" cy="60" rx="28" ry="14" fill="white" />
          <ellipse cx="262" cy="55" rx="22" ry="11" fill="white" />
        </g>

        {/* Ground/Field */}
        <rect y="180" width="400" height="120" fill="url(#groundGradient)" />

        {/* Field rows (perspective lines) */}
        <g opacity="0.3">
          <path d="M 0 200 Q 200 195 400 200" stroke="#15803D" strokeWidth="2" fill="none" />
          <path d="M 0 220 Q 200 218 400 220" stroke="#15803D" strokeWidth="2" fill="none" />
          <path d="M 0 240 Q 200 239 400 240" stroke="#15803D" strokeWidth="2" fill="none" />
          <path d="M 0 260 Q 200 259 400 260" stroke="#15803D" strokeWidth="2" fill="none" />
          <path d="M 0 280 Q 200 279 400 280" stroke="#15803D" strokeWidth="2" fill="none" />
        </g>

        {/* Tractor (centered, slightly small and lost-looking) */}
        <g transform={`translate(170, 200) ${isHovered ? 'scale(1.05)' : 'scale(1)'}`}>
          {/* Tractor body */}
          <rect x="0" y="0" width="60" height="35" rx="3" fill="url(#tractorGradient)" />

          {/* Engine hood */}
          <rect x="-15" y="5" width="20" height="25" rx="2" fill="#B91C1C" />

          {/* Cabin */}
          <rect x="15" y="-25" width="30" height="25" rx="3" fill="#991B1B" />

          {/* Cabin window */}
          <rect x="18" y="-22" width="24" height="18" rx="2" fill="#BFDBFE" opacity="0.7" />

          {/* Window frame */}
          <rect
            x="18"
            y="-22"
            width="24"
            height="18"
            rx="2"
            fill="none"
            stroke="#6B7280"
            strokeWidth="1"
          />

          {/* Exhaust pipe */}
          <rect x="8" y="-30" width="4" height="8" rx="1" fill="#374151" />
          <rect x="6" y="-32" width="8" height="3" rx="1" fill="#4B5563" />

          {/* Large rear wheel */}
          <circle cx="45" cy="40" r="20" fill="#1F2937" />
          <circle cx="45" cy="40" r="16" fill="#374151" />
          <circle cx="45" cy="40" r="12" fill="#4B5563" />
          <circle cx="45" cy="40" r="5" fill="#6B7280" />

          {/* Wheel spokes */}
          <line x1="45" y1="28" x2="45" y2="52" stroke="#9CA3AF" strokeWidth="1.5" />
          <line x1="33" y1="40" x2="57" y2="40" stroke="#9CA3AF" strokeWidth="1.5" />
          <line x1="36" y1="31" x2="54" y2="49" stroke="#9CA3AF" strokeWidth="1.5" />
          <line x1="36" y1="49" x2="54" y2="31" stroke="#9CA3AF" strokeWidth="1.5" />

          {/* Small front wheel */}
          <circle cx="0" cy="40" r="14" fill="#1F2937" />
          <circle cx="0" cy="40" r="11" fill="#374151" />
          <circle cx="0" cy="40" r="8" fill="#4B5563" />
          <circle cx="0" cy="40" r="3" fill="#6B7280" />

          {/* Front wheel spokes */}
          <line x1="0" y1="32" x2="0" y2="48" stroke="#9CA3AF" strokeWidth="1" />
          <line x1="-8" y1="40" x2="8" y2="40" stroke="#9CA3AF" strokeWidth="1" />
        </g>

        {/* Question marks floating around tractor */}
        <g className={isHovered ? 'animate-bounce' : ''}>
          <text x="150" y="190" fontSize="24" fill="#F59E0B" fontWeight="bold" opacity="0.8">
            ?
          </text>
          <text x="280" y="210" fontSize="20" fill="#F59E0B" fontWeight="bold" opacity="0.7">
            ?
          </text>
          <text x="210" y="175" fontSize="18" fill="#F59E0B" fontWeight="bold" opacity="0.6">
            ?
          </text>
        </g>

        {/* Dirt path/tire tracks */}
        <g opacity="0.4">
          <path
            d="M 50 250 Q 150 245 250 250"
            stroke="#15803D"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
          />
          <path
            d="M 60 255 Q 160 250 260 255"
            stroke="#15803D"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
          />
        </g>

        {/* Distant hills */}
        <g opacity="0.5">
          <ellipse cx="100" cy="185" rx="80" ry="15" fill="#15803D" />
          <ellipse cx="300" cy="185" rx="100" ry="18" fill="#15803D" />
        </g>

        {/* Small crops/plants in field */}
        <g opacity="0.6">
          {[...Array(8)].map((_, i) => (
            <g key={i} transform={`translate(${30 + i * 45}, 270)`}>
              <line x1="0" y1="0" x2="0" y2="-8" stroke="#166534" strokeWidth="2" />
              <circle cx="0" cy="-10" r="3" fill="#22C55E" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
