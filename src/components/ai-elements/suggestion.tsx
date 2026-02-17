'use client';

import type { ReactNode } from 'react';

export function Suggestions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}><div className="flex flex-wrap gap-2">{children}</div></div>;
}

export function Suggestion({
  suggestion,
  onClick,
}: {
  suggestion: string;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-full border border-[#2a2a2a] bg-[#121212] px-3 py-1 text-xs text-gray-300 hover:text-white"
      onClick={onClick}
      type="button"
    >
      {suggestion}
    </button>
  );
}
