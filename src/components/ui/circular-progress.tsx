import { cn } from '@/lib/utils';

interface CircularProgressProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  strokeWidth?: number;
  showPercentage?: boolean;
}

const sizeConfig = {
  sm: { width: 40, height: 40, fontSize: 10 },
  md: { width: 60, height: 60, fontSize: 12 },
  lg: { width: 100, height: 100, fontSize: 16 },
};

export function CircularProgress({
  progress,
  size = 'md',
  className,
  strokeWidth = 4,
  showPercentage = true,
}: CircularProgressProps) {
  const config = sizeConfig[size];
  const radius = (config.width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={config.width} height={config.height} className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-green-500 transition-all duration-300 ease-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-semibold text-gray-700" style={{ fontSize: config.fontSize }}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface CircularProgressOverlayProps extends CircularProgressProps {
  label?: string;
}

export function CircularProgressOverlay({
  progress,
  size = 'lg',
  label,
  ...props
}: CircularProgressOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60">
      <CircularProgress progress={progress} size={size} {...props} />
      {label && <span className="mt-2 text-xs font-medium text-white">{label}</span>}
    </div>
  );
}
