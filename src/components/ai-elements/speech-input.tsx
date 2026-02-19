'use client';

import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SpeechInput({
  onTranscriptionChange,
  className,
}: {
  onTranscriptionChange: (transcript: string) => void;
  size?: 'icon-sm' | 'icon';
  variant?: 'ghost' | 'default';
  className?: string;
}) {
  return (
    <Button
      className={className}
      onClick={() => onTranscriptionChange('')}
      size="sm"
      title="Speech input"
      type="button"
      variant="ghost"
    >
      <Mic className="size-4" />
    </Button>
  );
}
