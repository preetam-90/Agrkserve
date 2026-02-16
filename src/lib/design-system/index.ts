export * from './tokens';

// Utility function to get nested token value
export function getToken<T extends Record<string, unknown>>(
  obj: T,
  path: string
): string | number | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string | number | undefined;
}

// Clamp utility for fluid typography
export function clamp(
  min: string | number,
  preferred: string,
  max: string | number
): string {
  return `clamp(${typeof min === 'number' ? `${min}px` : min}, ${preferred}, ${
    typeof max === 'number' ? `${max}px` : max
  })`;
}

// Alpha color utility
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
