'use client';

import { useState } from 'react';

/**
 * Lost404Illustration Component
 * Dark-themed agricultural 404 illustration with glowing tractor lost in night fields
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
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes tractorGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.4)); }
          50% { filter: drop-shadow(0 0 14px rgba(34, 197, 94, 0.7)); }
        }
        @keyframes floatQuestion {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fieldGlow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .twinkle-star, .tractor-glow, .float-question, .field-glow-line {
            animation: none !important;
          }
        }
      `}</style>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        role="img"
        aria-label="Illustration of a tractor lost in dark fields at night"
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="darkSky404" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="60%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="darkGround404" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="greenGlow404" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tractorBody404" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>

        {/* Dark sky */}
        <rect width="400" height="180" fill="url(#darkSky404)" />

        {/* Stars */}
        <circle
          cx="30"
          cy="25"
          r="1.5"
          fill="#F8FAFC"
          className="twinkle-star"
          style={{ animation: 'twinkle 3s ease-in-out infinite' }}
        />
        <circle
          cx="80"
          cy="45"
          r="1"
          fill="#F8FAFC"
          className="twinkle-star"
          style={{ animation: 'twinkle 4s ease-in-out 0.5s infinite' }}
        />
        <circle
          cx="140"
          cy="20"
          r="1.5"
          fill="#F8FAFC"
          className="twinkle-star"
          style={{ animation: 'twinkle 2.5s ease-in-out 1s infinite' }}
        />
        <circle
          cx="200"
          cy="35"
          r="1"
          fill="#94A3B8"
          className="twinkle-star"
          style={{ animation: 'twinkle 3.5s ease-in-out 0.3s infinite' }}
        />
        <circle
          cx="250"
          cy="15"
          r="1.5"
          fill="#F8FAFC"
          className="twinkle-star"
          style={{ animation: 'twinkle 4.5s ease-in-out 0.8s infinite' }}
        />
        <circle
          cx="310"
          cy="40"
          r="1"
          fill="#94A3B8"
          className="twinkle-star"
          style={{ animation: 'twinkle 3s ease-in-out 1.2s infinite' }}
        />
        <circle
          cx="360"
          cy="22"
          r="1.5"
          fill="#F8FAFC"
          className="twinkle-star"
          style={{ animation: 'twinkle 2.8s ease-in-out 0.6s infinite' }}
        />
        <circle
          cx="50"
          cy="70"
          r="1"
          fill="#94A3B8"
          className="twinkle-star"
          style={{ animation: 'twinkle 3.2s ease-in-out 1.5s infinite' }}
        />
        <circle
          cx="170"
          cy="55"
          r="1"
          fill="#F8FAFC"
          className="twinkle-star"
          style={{ animation: 'twinkle 4s ease-in-out 0.2s infinite' }}
        />
        <circle
          cx="330"
          cy="60"
          r="1.5"
          fill="#94A3B8"
          className="twinkle-star"
          style={{ animation: 'twinkle 3.7s ease-in-out 0.9s infinite' }}
        />

        {/* Constellation lines (subtle) */}
        <g opacity="0.15" stroke="#94A3B8" strokeWidth="0.5">
          <line x1="30" y1="25" x2="80" y2="45" />
          <line x1="80" y1="45" x2="140" y2="20" />
          <line x1="250" y1="15" x2="310" y2="40" />
          <line x1="310" y1="40" x2="360" y2="22" />
        </g>

        {/* Moon */}
        <circle cx="350" cy="45" r="18" fill="#334155" />
        <circle cx="356" cy="40" r="18" fill="url(#darkSky404)" />
        <circle cx="350" cy="45" r="18" fill="#64748B" opacity="0.3" />

        {/* Dark ground */}
        <rect y="180" width="400" height="120" fill="url(#darkGround404)" />

        {/* Distant hills silhouette */}
        <ellipse cx="100" cy="183" rx="90" ry="12" fill="#1E293B" opacity="0.8" />
        <ellipse cx="320" cy="183" rx="110" ry="15" fill="#1E293B" opacity="0.7" />

        {/* Field rows with green bioluminescent glow */}
        <g className="field-glow-line" style={{ animation: 'fieldGlow 4s ease-in-out infinite' }}>
          <path
            d="M 0 200 Q 200 195 400 200"
            stroke="#22C55E"
            strokeWidth="1"
            fill="none"
            opacity="0.25"
          />
          <path
            d="M 0 215 Q 200 212 400 215"
            stroke="#22C55E"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M 0 230 Q 200 228 400 230"
            stroke="#22C55E"
            strokeWidth="1"
            fill="none"
            opacity="0.15"
          />
          <path
            d="M 0 245 Q 200 244 400 245"
            stroke="#22C55E"
            strokeWidth="1"
            fill="none"
            opacity="0.12"
          />
          <path
            d="M 0 260 Q 200 259 400 260"
            stroke="#22C55E"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
          />
          <path
            d="M 0 275 Q 200 274 400 275"
            stroke="#22C55E"
            strokeWidth="1"
            fill="none"
            opacity="0.08"
          />
        </g>

        {/* Tractor green glow on ground */}
        <ellipse cx="200" cy="248" rx="60" ry="10" fill="url(#greenGlow404)" />

        {/* Tractor group with glow */}
        <g
          className="tractor-glow"
          style={{ animation: 'tractorGlow 3s ease-in-out infinite' }}
          transform={`translate(170, 200) ${isHovered ? 'scale(1.03)' : 'scale(1)'}`}
        >
          {/* Tractor body */}
          <rect x="0" y="0" width="60" height="35" rx="3" fill="url(#tractorBody404)" />

          {/* Engine hood */}
          <rect x="-15" y="5" width="20" height="25" rx="2" fill="#15803D" />

          {/* Cabin */}
          <rect x="15" y="-25" width="30" height="25" rx="3" fill="#166534" />

          {/* Cabin window - dark tinted */}
          <rect x="18" y="-22" width="24" height="18" rx="2" fill="#0F172A" opacity="0.7" />
          <rect
            x="18"
            y="-22"
            width="24"
            height="18"
            rx="2"
            fill="none"
            stroke="#22C55E"
            strokeWidth="0.5"
            opacity="0.4"
          />

          {/* Exhaust pipe */}
          <rect x="8" y="-30" width="4" height="8" rx="1" fill="#334155" />
          <rect x="6" y="-32" width="8" height="3" rx="1" fill="#475569" />

          {/* Headlight beam */}
          <ellipse cx="-25" cy="18" rx="30" ry="15" fill="url(#headlightGlow)" />
          <rect x="-16" y="12" width="3" height="6" rx="1" fill="#F59E0B" opacity="0.9" />

          {/* Green accent lights */}
          <rect x="48" y="2" width="3" height="3" rx="1" fill="#22C55E" opacity="0.8" />
          <rect x="48" y="8" width="3" height="3" rx="1" fill="#22C55E" opacity="0.6" />

          {/* Large rear wheel */}
          <circle cx="45" cy="40" r="20" fill="#1E293B" />
          <circle cx="45" cy="40" r="16" fill="#334155" />
          <circle cx="45" cy="40" r="12" fill="#475569" />
          <circle cx="45" cy="40" r="5" fill="#64748B" />

          {/* Wheel spokes */}
          <line x1="45" y1="28" x2="45" y2="52" stroke="#64748B" strokeWidth="1.5" />
          <line x1="33" y1="40" x2="57" y2="40" stroke="#64748B" strokeWidth="1.5" />
          <line x1="36" y1="31" x2="54" y2="49" stroke="#64748B" strokeWidth="1.5" />
          <line x1="36" y1="49" x2="54" y2="31" stroke="#64748B" strokeWidth="1.5" />

          {/* Small front wheel */}
          <circle cx="0" cy="40" r="14" fill="#1E293B" />
          <circle cx="0" cy="40" r="11" fill="#334155" />
          <circle cx="0" cy="40" r="8" fill="#475569" />
          <circle cx="0" cy="40" r="3" fill="#64748B" />

          {/* Front wheel spokes */}
          <line x1="0" y1="32" x2="0" y2="48" stroke="#64748B" strokeWidth="1" />
          <line x1="-8" y1="40" x2="8" y2="40" stroke="#64748B" strokeWidth="1" />
        </g>

        {/* Floating question marks - green/amber */}
        <g
          className="float-question"
          style={{ animation: 'floatQuestion 3s ease-in-out infinite' }}
        >
          <text x="140" y="188" fontSize="22" fill="#22C55E" fontWeight="bold" opacity="0.7">
            ?
          </text>
        </g>
        <g
          className="float-question"
          style={{ animation: 'floatQuestion 3.5s ease-in-out 0.5s infinite' }}
        >
          <text x="275" y="205" fontSize="18" fill="#F59E0B" fontWeight="bold" opacity="0.5">
            ?
          </text>
        </g>
        <g
          className="float-question"
          style={{ animation: 'floatQuestion 2.8s ease-in-out 1s infinite' }}
        >
          <text x="115" y="210" fontSize="16" fill="#22C55E" fontWeight="bold" opacity="0.4">
            ?
          </text>
        </g>
        <g
          className="float-question"
          style={{ animation: 'floatQuestion 4s ease-in-out 0.3s infinite' }}
        >
          <text x="290" y="185" fontSize="14" fill="#F59E0B" fontWeight="bold" opacity="0.3">
            ?
          </text>
        </g>

        {/* Tire tracks in dark soil */}
        <g opacity="0.2">
          <path
            d="M 50 255 Q 150 250 250 255"
            stroke="#64748B"
            strokeWidth="2"
            fill="none"
            strokeDasharray="6,4"
          />
          <path
            d="M 60 260 Q 160 255 260 260"
            stroke="#64748B"
            strokeWidth="2"
            fill="none"
            strokeDasharray="6,4"
          />
        </g>

        {/* Glowing crop dots */}
        <g>
          {[...Array(8)].map((_, i) => (
            <g key={i} transform={`translate(${30 + i * 45}, 272)`}>
              <line x1="0" y1="0" x2="0" y2="-6" stroke="#334155" strokeWidth="1.5" />
              <circle cx="0" cy="-8" r="2.5" fill="#22C55E" opacity="0.4" />
              <circle cx="0" cy="-8" r="5" fill="#22C55E" opacity="0.1" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
