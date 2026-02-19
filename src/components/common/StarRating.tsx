import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/**
 * Renders a star rating display component.
 * @param rating - The current rating (0 to maxRating)
 * @param maxRating - Maximum number of stars (default: 5)
 * @param size - Size of stars: 'sm', 'md', or 'lg' (default: 'md')
 * @param className - Additional CSS classes
 */
export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  className = '',
}: StarRatingProps) {
  return (
    <div className={`flex ${className}`}>
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}
